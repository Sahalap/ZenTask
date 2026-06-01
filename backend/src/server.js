require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  ZenTask Backend API is running on:`);
  console.log(`  🚀 http://localhost:${PORT}`);
  console.log(`  📖 Swagger Documentation:`);
  console.log(`  🔗 http://localhost:${PORT}/api-docs`);
  console.log(`=========================================`);
});
