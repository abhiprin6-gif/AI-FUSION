const services = [
["VIRAT Search","🔎","Search and discover services"],
["VIRAT AI","🤖","AI assistant — integration planned"],
["VIRAT Government","🏛️","Government links and schemes"],
["VIRAT Career","💼","Jobs, exams and opportunities"],
["VIRAT Education","📚","Courses, study and scholarships"],
["VIRAT Drive","☁️","Cloud storage — backend needed"],
["VIRAT Video","🎬","Video discovery and tools"],
["INSTANT PAY","⚡","Demo only; no real payments"],
["VIRAT CSC","🏢","CSC information and official links"],
["VIRAT Business","🏪","Business tools and directory"],
["VIRAT Innovation","💡","Ideas and innovation"],
["VIRAT Research","🔬","Research resources"],
["VIRAT Technology","💻","Technology resources"],
["VIRAT Agriculture","🌾","Farming resources and schemes"],
["VIRAT Health","🏥","Health resources and hospitals"],
["VIRAT Local","📍","Local services"],
["VIRAT Connect","💬","Communication — integration planned"],
["VIRAT Trust","🛡️","Trust and safety resources"],
["VIRAT Memory","🧠","Personal memory — backend needed"],
["VIRAT Notifications","🔔","Notification preferences"],
["VIRAT Admin","⚙️","Admin tools — access control needed"],
["VIRAT Developer Cloud","🧰","Developer resources"],
["VIRAT Opportunity Engine","🚀","Discover opportunities"],
["VIRAT Citizen Problem Hub","📝","Prepare a complaint draft"],
["VIRAT Maps","🗺️","Maps provider integration planned"],
["VIRAT Mail","✉️","Email service integration planned"],
["VIRAT Docs","📄","Document editor planned"],
["VIRAT Sheets","📊","Spreadsheet tools planned"],
["VIRAT Slides","🖥️","Presentation tools planned"],
["VIRAT Calendar","📅","Calendar integration planned"],
["VIRAT Meet","📹","Video meeting integration planned"],
["VIRAT Browser","🌐","Web browsing resources"],
["VIRAT Account","👤","Account system planned"],
["VIRAT Photos","🖼️","Photo storage planned"],
["VIRAT Translate","🌍","Translation integration planned"],
["VIRAT Voice","🎙️","Voice tools planned"],
["VIRAT AI Studio","🧪","AI development tools planned"],
["VIRAT News","📰","News sources planned"],
["VIRAT Books & Research","📖","Books and research resources"]
];
const grid = document.getElementById("grid");
const search = document.getElementById("search");
const empty = document.getElementById("empty");

function render(query = "") {
  const q = query.trim().toLowerCase();
  const matches = services.filter(s => s.join(" ").toLowerCase().includes(q));
  grid.innerHTML = matches.map(s =>
    `<article class="card"><div class="emoji">${s[1]}</div><h3>${s[0]}</h3><p>${s[2]}</p></article>`
  ).join("");
  empty.hidden = matches.length !== 0;
}
search.addEventListener("input", () => render(search.value));
document.getElementById("theme").addEventListener("click", () => {
  document.body.classList.toggle("light");
});
document.getElementById("demoPay").addEventListener("click", () => {
  const id = "DEMO-" + Date.now().toString().slice(-8);
  document.getElementById("paymentResult").textContent =
    `DEMO transaction created: ${id}. No money was transferred.`;
});
document.getElementById("year").textContent = new Date().getFullYear();
render();
