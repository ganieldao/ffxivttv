# FFXIV TwitchTV Tracker

An automated FFXIV story progress tracker for TwitchTV streamers using OpenCV and Tesseract

Try it out: https://ffxivttv.fly.dev

![Screenshot](./screenshots/Screenshot.png)

## Local Setup
Create .env files in worker/ and webapp/ with the following information

`worker/.env`
```
CLOUDINARY_API=
CLOUDINARY_NAME=
CLOUDINARY_SECRET=
MONGO_URI=mongodb://root:1234@mongodb:27017/ffxivttvtracker?authSource=admin
TWITCH_CLIENT_ID=
TWITCH_SECRET=
```

`webapp/.env`
```
MONGO_URI=mongodb://root:1234@mongodb:27017/ffxivttvtracker?authSource=admin
TWITCH_CLIENT_ID=
TWITCH_SECRET=
```

Run `npm install` in `webapp/` and `webapp/frontend`

In the root directory, run
```
docker-compose up
```
This will spin up the frontend UI, the frontend server, the python worker, and the mongodb in separate containers. 

In the mongodb container, create a `ffxivttvtracker` database with a `streamers` collection. An example schema that can be imported is `initial_db.json`.

In prod, the frontend UI is served directly from the frontend server in one container.

# Misc

Apparently apscheduler + pytesseract + my code = memory leak