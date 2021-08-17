const express = require("express");
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get("/api/test", (req, res) => {
  res.send("Hello from Node.js app \n");
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});


app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);
});