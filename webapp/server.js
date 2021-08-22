const express = require("express");
const path = require('path');
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(e => {
    console.error('Mongo connection error', e.message)
  })

var streamerSchema = new mongoose.Schema({
  "user_login": {
    type: String
  },
  "quest": {
    type: Object
  },
  "last_updated": {
    type: Date
  }
});

var streamerModel = mongoose.model('Streamers', streamerSchema);



const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get("/api/streamers", async (req, res) => {
  try {
    const streamers = await streamerModel.find({"quest" : { "$nin": [ null, "" ] }}).sort('user_login').exec();
    res.status(200).json({status: 'success', data: streamers});
  } catch (err) {
    res.status(404).json({status: 'fail', message: err});
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});

app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);
});