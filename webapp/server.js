const express = require("express");
const path = require('path');
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .catch(e => {
    console.error('Mongo connection error', e.message)
  })
  
const db = mongoose.connection

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get("/api/streamers", (req, res) => {
  res.json({test: "test"});
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});

app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);
});