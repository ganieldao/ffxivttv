const TwitchApi = require("node-twitch").default;
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

const twitch = new TwitchApi({
	client_id: process.env.TWITCH_CLIENT_ID,
	client_secret: process.env.TWITCH_SECRET
});

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get("/api/streamers", async (req, res) => {
  try {
    const streamers = await streamerModel.find({"quest" : { "$nin": [ null, "" ] }}).sort('user_login').exec();
    const streamerMap = streamers.reduce((map, streamer) => (map[streamer.user_login] = streamer.toObject(), map), {});
  
    if (streamers.length > 0) {
      twitch.getUsers(Object.keys(streamerMap)).then((data) => console.log(data));
      const twitchUsers = await twitch.getUsers(Object.keys(streamerMap));

      twitchUsers.data.forEach(twitchUser => {
        streamerMap[twitchUser["login"]]["profile_image_url"] = twitchUser["profile_image_url"];
      });
    }

    res.status(200).json({status: 'success', data: Object.values(streamerMap)});
  } catch (err) {
    res.status(404).json({status: 'fail', message: err.message + err.stack});
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});

app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);
});