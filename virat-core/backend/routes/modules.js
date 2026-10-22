const express = require('express');
const router = express.Router();

const modules = [
  'V Search','VIRAT AI','Government','Career','Education',
  'Drive','Videos','INSTANT PAY','VIRAT CSC','Business',
  'Innovation','Research','Technology','Agriculture','Health',
  'Local','Connect','Trust','Memory','Notifications',
  'Admin','Developer Cloud','Opportunity Engine',
  'VIRAT Citizen Problem Hub','V Maps','V Mail','V Docs',
  'V Sheets','Slides','Calendar','V Meet','Browser',
  'Account','Photos','V Translate','Voice','V AI Studio',
  'News','Books & Research'
];

router.get('/', (req, res) => {
  res.json({
    project: 'VIRAT DIGITAL ECOSYSTEM',
    tagline: 'One Platform. Endless Possibilities.',
    count: modules.length,
    modules: modules.map((name, index) => ({
      id: index + 1,
      name,
      status: name === 'INSTANT PAY' ? 'demo-only' : 'planned'
    }))
  });
});

module.exports = router;
