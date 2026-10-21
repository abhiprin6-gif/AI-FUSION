const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3001;
const DB = path.join(__dirname, 'virat-panel-data.json');
const sessions = new Map();

const initialServices = [
  'VIRAT Search', 'VIRAT AI', 'AI Assistant', 'Code Studio',
  'Image Creator', 'Video Studio', 'Writing Studio',
  'Document Tools', 'PDF Tools', 'Translation',
  'Voice Studio', 'Music Studio', 'Learning Hub',
  'News Hub', 'Weather', 'Calculator', 'Unit Converter',
  'Notes', 'Task Manager', 'Calendar', 'Cloud Storage',
  'File Manager', 'Photo Editor', 'Background Remover',
  'Logo Maker', 'Resume Builder', 'QR Generator',
  'Password Generator', 'Text Tools', 'Developer Tools',
  'Website Builder', 'Business Tools', 'Finance Tools',
  'INSTANT PAY Demo', 'VIRAT Community', 'VIRAT Games',
  'VIRAT Labs', 'Help Center', 'User Support'
].map((name, i) => ({ id: i + 1, name, enabled: true }));

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch {
    const db = {
      users: [],
      services: initialServices,
      announcement: 'Welcome to VIRAT DIGITAL ECOSYSTEM'
    };
    saveDB(db);
    return db;
  }
}
function saveDB(db) {
  const temp = DB + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(temp, DB);
}
let db = loadDB();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: crypto.scryptSync(password, salt, 64).toString('hex')
  };
}
function verifyPassword(password, user) {
  const candidate = crypto.scryptSync(password, user.salt, 64);
  const saved = Buffer.from(user.hash, 'hex');
  return saved.length === candidate.length &&
    crypto.timingSafeEqual(candidate, saved);
}

if (!db.users.some(u => u.role === 'admin')) {
  const password = crypto.randomBytes(12).toString('base64url');
  const secure = hashPassword(password);
  db.users.push({
    id: crypto.randomUUID(),
    username: 'admin',
    email: 'admin@virat.local',
    ...secure,
    role: 'admin',
    createdAt: new Date().toISOString()
  });
  saveDB(db);
  console.log('\n===== VIRAT ADMIN LOGIN =====');
  console.log('Username: admin');
  console.log('Password: ' + password);
  console.log('Save this password securely. It is shown only once.\n');
}

function send(res, status, data, extra = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    ...extra
  });
  res.end(JSON.stringify(data));
}
function cookieToken(req) {
  const cookies = (req.headers.cookie || '').split(';');
  const item = cookies.find(c => c.trim().startsWith('virat_session='));
  return item ? decodeURIComponent(item.trim().slice('virat_session='.length)) : '';
}
function currentUser(req) {
  const session = sessions.get(cookieToken(req));
  if (!session || session.expires < Date.now()) return null;
  return db.users.find(u => u.id === session.userId) || null;
}
function publicUser(u) {
  return { id: u.id, username: u.username, email: u.email,
    role: u.role, createdAt: u.createdAt };
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 10000) {
        reject(new Error('Request too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}
function clean(value, max = 80) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const app = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = url.pathname;
  const method = req.method;
  const ip = req.socket.remoteAddress || 'unknown';

  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip)) {
    return send(res, 403, { error: 'Local access only. Configure HTTPS before deployment.' });
  }

  if (method === 'GET' && route === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'"
    });
    return res.end(PAGE);
  }

  if (route.startsWith('/api/')) {
    try {
      if (method === 'POST' && route === '/api/register') {
        const b = await readBody(req);
        const username = clean(b.username, 24);
        const email = clean(b.email, 120).toLowerCase();
        const password = typeof b.password === 'string' ? b.password : '';

        if (!/^[a-zA-Z0-9_]{3,24}$/.test(username))
          return send(res, 400, { error: 'Username: 3–24 letters, numbers or underscores.' });
        if (!validEmail(email))
          return send(res, 400, { error: 'Enter a valid email.' });
        if (password.length < 10 || password.length > 128)
          return send(res, 400, { error: 'Password must be 10–128 characters.' });
        if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email === email))
          return send(res, 409, { error: 'Username or email already exists.' });

        const user = {
          id: crypto.randomUUID(), username, email,
          ...hashPassword(password), role: 'user',
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        saveDB(db);
        return send(res, 201, { message: 'Account created. Please log in.' });
      }

      if (method === 'POST' && route === '/api/login') {
        const b = await readBody(req);
        const username = clean(b.username, 120).toLowerCase();
        const password = typeof b.password === 'string' ? b.password : '';
        const user = db.users.find(u =>
          u.username.toLowerCase() === username || u.email === username
        );
        if (!user || !verifyPassword(password, user))
          return send(res, 401, { error: 'Invalid username/email or password.' });

        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, {
          userId: user.id,
          expires: Date.now() + 8 * 60 * 60 * 1000
        });
        return send(res, 200, { user: publicUser(user) }, {
          'Set-Cookie': `virat_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`
        });
      }

      if (method === 'POST' && route === '/api/logout') {
        sessions.delete(cookieToken(req));
        return send(res, 200, { message: 'Logged out.' }, {
          'Set-Cookie': 'virat_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
        });
      }

      const user = currentUser(req);
      if (route === '/api/me' && method === 'GET')
        return send(res, 200, { user: user ? publicUser(user) : null });

      if (!user) return send(res, 401, { error: 'Please log in first.' });

      if (route === '/api/dashboard' && method === 'GET') {
        return send(res, 200, {
          user: publicUser(user),
          services: db.services.filter(s => s.enabled),
          announcement: db.announcement
        });
      }

      if (user.role !== 'admin')
        return send(res, 403, { error: 'Admin access required.' });

      if (route === '/api/admin' && method === 'GET') {
        return send(res, 200, {
          totalUsers: db.users.filter(u => u.role === 'user').length,
          totalServices: db.services.length,
          activeServices: db.services.filter(s => s.enabled).length,
          users: db.users.map(publicUser),
          services: db.services,
          announcement: db.announcement
        });
      }

      if (route === '/api/admin/service' && method === 'POST') {
        const b = await readBody(req);
        const service = db.services.find(s => s.id === Number(b.id));
        if (!service) return send(res, 404, { error: 'Service not found.' });
        service.enabled = Boolean(b.enabled);
        saveDB(db);
        return send(res, 200, { message: 'Service updated.' });
      }

      if (route === '/api/admin/announcement' && method === 'POST') {
        const b = await readBody(req);
        db.announcement = clean(b.announcement, 300);
        saveDB(db);
        return send(res, 200, { message: 'Announcement saved.' });
      }

      if (route === '/api/admin/user-role' && method === 'POST') {
        const b = await readBody(req);
        const target = db.users.find(u => u.id === b.id);
        if (!target) return send(res, 404, { error: 'User not found.' });
        if (target.id === user.id)
          return send(res, 400, { error: 'You cannot change your own role.' });
        target.role = target.role === 'admin' ? 'user' : 'admin';
        saveDB(db);
        return send(res, 200, { message: 'User role updated.' });
      }

      return send(res, 404, { error: 'API route not found.' });
    } catch (e) {
      return send(res, 400, { error: e.message || 'Request failed.' });
    }
  }

  send(res, 404, { error: 'Not found.' });
});

const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VIRAT | Control Panel</title>
<style>
:root{color-scheme:dark;--bg:#090b17;--card:#14182a;--line:#303653;--txt:#f4f5ff;--muted:#a7aec9;--accent:#9b8cff;--cyan:#5be7ff}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top,#22214a,var(--bg) 60%);color:var(--txt);font:15px system-ui,sans-serif;min-height:100vh}
header{padding:20px 5%;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px}
.logo{font-weight:900;letter-spacing:2px;font-size:22px}.logo span{color:var(--cyan)}main{width:min(1000px,92%);margin:30px auto}
h1{font-size:clamp(26px,5vw,42px);margin:5px 0}h2{margin-top:0}.muted{color:var(--muted)}.card{background:#14182aeb;border:1px solid var(--line);border-radius:18px;padding:20px;margin:14px 0;box-shadow:0 12px 35px #0003}
input,button,textarea{font:inherit;border-radius:10px;padding:12px;border:1px solid var(--line);width:100%;background:#0c1020;color:var(--txt);margin:6px 0}
button{background:linear-gradient(110deg,#7666ed,#357dce);border:0;font-weight:700;cursor:pointer}
button.secondary{background:#252b43;border:1px solid var(--line)}button.small{width:auto;padding:8px 12px}
.tabs,.actions,.stats{display:flex;gap:10px;flex-wrap:wrap}.tabs button{flex:1}
.stat{flex:1;min-width:120px;background:#0c1020;border:1px solid var(--line);padding:15px;border-radius:12px}.stat strong{display:block;font-size:28px;color:var(--cyan)}
.rowitem{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--line);padding:12px 0}.rowitem:last-child{border:0}
.rowitem span{overflow-wrap:anywhere}.rowitem button{flex-shrink:0}.hidden{display:none!important}.notice{padding:12px;background:#202744;border-radius:10px;color:var(--cyan);margin:12px 0}
footer{text-align:center;color:var(--muted);padding:30px;font-size:12px}
</style></head><body>
<header><div class="logo">VIRAT<span>.</span> <small style="font-size:11px">CONTROL</small></div><button id="logout" class="small secondary hidden" onclick="logout()">Log out</button></header>
<main><div id="msg" class="notice hidden"></div>
<section id="auth"><h1>Your digital world.</h1><p class="muted">One Platform. Endless Possibilities.</p>
<div class="card"><div class="tabs"><button onclick="showAuth('login')">Login</button><button class="secondary" onclick="showAuth('register')">Create account</button></div>
<form id="loginForm"><h2>Welcome back</h2><input name="username" placeholder="Username or email" required autocomplete="username"><input name="password" type="password" placeholder="Password" required autocomplete="current-password"><button>Login</button></form>
<form id="registerForm" class="hidden"><h2>Create user account</h2><input name="username" placeholder="Username (3–24 characters)" required minlength="3" maxlength="24"><input name="email" type="email" placeholder="Email address" required><input name="password" type="password" placeholder="Password (minimum 10 characters)" required minlength="10" maxlength="128" autocomplete="new-password"><button>Create account</button></form></div>
<p class="muted">Admin account is generated on the first server start. Read the Termux terminal for its password.</p></section>
<section id="userPanel" class="hidden"><h1>User Panel</h1><p class="muted" id="welcome"></p><div id="announcement" class="notice"></div><div class="card"><h2>Available Services</h2><div id="userServices"></div></div></section>
<section id="adminPanel" class="hidden"><h1>Admin Dashboard</h1><p class="muted">Manage your VIRAT ecosystem.</p>
<div class="stats"><div class="stat">Users<strong id="usersCount">0</strong></div><div class="stat">Services<strong id="servicesCount">0</strong></div><div class="stat">Active<strong id="activeCount">0</strong></div></div>
<div class="card"><h2>Service Management</h2><div id="adminServices"></div></div>
<div class="card"><h2>Announcements</h2><textarea id="announcementInput" rows="3" maxlength="300" placeholder="Write a notice for users"></textarea><button onclick="saveAnnouncement()">Publish announcement</button></div>
<div class="card"><h2>User Management</h2><p class="muted">Promote or demote accounts. Only promote trusted people.</p><div id="usersList"></div></div></section>
</main><footer>VIRAT DIGITAL ECOSYSTEM · INSTANT PAY is demo only</footer>
<script>
const $=id=>document.getElementById(id);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function message(s){$('msg').textContent=s;$('msg').classList.remove('hidden');}
function showAuth(which){$('loginForm').classList.toggle('hidden',which!=='login');$('registerForm').classList.toggle('hidden',which!=='register');}
async function api(url,body){const r=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d;}
async function login(e){e.preventDefault();try{const f=new FormData(e.target);await api('/api/login',{username:f.get('username'),password:f.get('password')});await refresh();}catch(x){message(x.message);}}
async function register(e){e.preventDefault();try{const f=new FormData(e.target);const d=await api('/api/register',{username:f.get('username'),email:f.get('email'),password:f.get('password')});message(d.message);showAuth('login');}catch(x){message(x.message);}}
$('loginForm').addEventListener('submit',login);$('registerForm').addEventListener('submit',register);
function hidePanels(){['auth','userPanel','adminPanel'].forEach(id=>$(id).classList.add('hidden'));}
async function refresh(){try{const d=await api('/api/me');if(!d.user){hidePanels();$('auth').classList.remove('hidden');$('logout').classList.add('hidden');return;}hidePanels();$('logout').classList.remove('hidden');$('welcome').textContent='Signed in as '+d.user.username;$('announcement').textContent='📢 '+(d.announcement||'No announcements');$('userPanel').classList.remove('hidden');$('userServices').innerHTML=d.services.map(s=>'<div class="rowitem"><span>'+esc(s.name)+'</span><span class="muted">Available</span></div>').join('')||'No services available';if(d.user.role==='admin'){await adminLoad();}}catch(e){message(e.message);}}
async function adminLoad(){const d=await api('/api/admin');$('adminPanel').classList.remove('hidden');$('usersCount').textContent=d.totalUsers;$('servicesCount').textContent=d.totalServices;$('activeCount').textContent=d.activeServices;$('announcementInput').value=d.announcement||'';$('adminServices').innerHTML=d.services.map(s=>'<div class="rowitem"><span>'+esc(s.name)+'</span><button class="small '+(s.enabled?'':'secondary')+'" onclick="toggleService('+s.id+','+(!s.enabled)+')">'+(s.enabled?'ON':'OFF')+'</button></div>').join('');$('usersList').innerHTML=d.users.map(u=>'<div class="rowitem"><span>'+esc(u.username)+' · '+esc(u.role)+'<br><small class="muted">'+esc(u.email)+'</small></span>'+(u.role==='admin'&&u.username==='admin'?'': '<button class="small secondary" onclick="changeRole(\\''+u.id+'\\')">'+(u.role==='admin'?'Demote':'Make admin')+'</button>')).join('');}
async function toggleService(id,enabled){try{await api('/api/admin/service',{id,enabled});await adminLoad();}catch(e){message(e.message);}}
async function saveAnnouncement(){try{await api('/api/admin/announcement',{announcement:$('announcementInput').value});message('Announcement published.');await refresh();}catch(e){message(e.message);}}
async function changeRole(id){if(!confirm('Change this account role?'))return;try{await api('/api/admin/user-role',{id});await adminLoad();}catch(e){message(e.message);}}
async function logout(){try{await api('/api/logout',{});}catch(e){}hidePanels();$('auth').classList.remove('hidden');$('logout').classList.add('hidden');}
refresh();
</script></body></html>`;

app.listen(PORT, '127.0.0.1', () => {
  console.log('VIRAT Panel ready: http://127.0.0.1:' + PORT);
  console.log('Keep this Termux session running while using the panel.');
});
