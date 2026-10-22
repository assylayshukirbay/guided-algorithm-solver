const { createApp } = require('./src/app');
const { app } = createApp();
const port = Number(process.env.PORT || 3001);
// Bind to all interfaces for connection from a phone on the same Wi-Fi network.
app.listen(port, '0.0.0.0', () => {
  console.log(`Guided Algorithm Solver API: http://localhost:${port}/api/health`);
});
