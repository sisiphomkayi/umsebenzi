require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🚀 Umsebenzi API Running`);
  console.log(`  🌍 http://localhost:${PORT}`);
  console.log(`  🔧 Environment: ${process.env.NODE_ENV}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
