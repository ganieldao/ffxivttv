const express = require("express");
const app = express();
const cors = require('cors');

const PORT = 8080;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Node.js app \n");
});

app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);
});