import cloudinary
import cloudinary.api
import cloudinary.uploader
import cv2
import datetime
import json
import numpy as np
import os
import pytesseract
import subprocess
import time
from pymongo import MongoClient, errors
from twitchAPI.twitch import Twitch
from streamlink import Streamlink
try:
    from PIL import Image
except ImportError:
    import Image


class MatchVars:
    def __init__(self, template, lower, upper, box):
        self.template = template
        self.lower = lower
        self.upper = upper
        self.box = box

with open('quests_formatted.json') as f:
    QUESTS = json.load(f)

LOWER_RED = np.array([0, 50, 50])
UPPER_RED = np.array([255, 255, 255])
LOWER_YELLOW = np.array([15, 20, 100])
UPPER_YELLOW = np.array([50, 255, 255])

MSQ_TRACKER_TEMPLATE = cv2.imread('msq_tracker2.jpg', cv2.IMREAD_UNCHANGED)
MSQ_ICON_TEMPLATE = cv2.imread('msq_icon.png', cv2.IMREAD_UNCHANGED)

MSQ_TRACKER_MATCH_VARS = MatchVars(MSQ_TRACKER_TEMPLATE, LOWER_RED, UPPER_RED, ((
    MSQ_TRACKER_TEMPLATE.shape[0] + 18, -10), (MSQ_TRACKER_TEMPLATE.shape[0] + 215, MSQ_TRACKER_TEMPLATE.shape[1])))
MSQ_ICON_MATCH_VARS = MatchVars(MSQ_ICON_TEMPLATE, LOWER_YELLOW, UPPER_YELLOW, (
    (-MSQ_ICON_TEMPLATE.shape[0] - 200, 0), (0, MSQ_ICON_TEMPLATE.shape[1])))

GAME_NAME = "Final Fantasy XIV Online"

# Tracking state in for logging purposes
streamer_progress = {}

last_ran = None
last_finished = None

twitch = Twitch(os.environ['TWITCH_CLIENT_ID'], os.environ['TWITCH_SECRET'])
twitch.authenticate_app([])

streamlink = Streamlink()

is_running = False

# MONGO
global db
try:
    # try to instantiate a client instance
    client = MongoClient(os.environ['MONGO_URI'])

    # print the version of MongoDB server if connection successful
    print("server version:", client.server_info()["version"], flush=True)

    # get the database_names from the MongoClient()
    database_names = client.list_database_names()

    db = client['ffxivttvtracker']
except Exception as e:
    # set the client and DB name list to 'None' and `[]` if exception
    client = None
    database_names = []

    # catch pymongo.errors.ServerSelectionTimeoutError
    print("pymongo ERROR", e)

print("\ndatabases:", database_names)

# Cloudinary
try:
    cloudinary.config( 
        cloud_name = os.environ['CLOUDINARY_NAME'], 
        api_key = os.environ['CLOUDINARY_API'], 
        api_secret = os.environ['CLOUDINARY_SECRET'] 
    )
except Exception as e:
    print("Error setting cloudinary", e)


def periodic_job():
    print("Starting job", flush=True)
    global last_ran 
    last_ran = datetime.datetime.utcnow()

    streamers = get_streamers_from_db()

    streamers_dict = {streamer['user_login']:streamer for streamer in streamers if 'user_login' in streamer}
    streams = twitch.get_streams(user_login=list(streamers_dict.keys()))['data']

    streamers_to_process = [streamers_dict[stream['user_login']] for stream in streams 
        if stream['game_name'] == GAME_NAME]
    print("Currently Streaming:", [streamer['user_login'] for streamer in streamers_to_process], flush=True)
    process_streams(streamers_to_process)
  
    global last_finished
    last_finished = datetime.datetime.utcnow()
    print("App state:", streamer_progress, flush=True)


def get_streamers_from_db():
    if not db:
        return []

    return list(db["streamers"].find({}, {"_id": 0, "user_login": 1, "image": 1, "last_updated": 1}))


def process_streams(streamers):
    for streamer in streamers:
        try:
            streamer_login = streamer['user_login']

            # Don't process streamer for 5 minutes after we successfully got quest
            if streamer.get('last_updated'):
                if datetime.datetime.utcnow() - streamer['last_updated'] < datetime.timedelta(minutes=5):
                    print("Skipping ", streamer_login, flush=True)
                    continue 

            quest, img_file = get_quest(streamer_login)

            # Check if streamer is still streaming ffxiv to prevent false-positives when hosting
            streams = twitch.get_streams(user_login=[streamer_login])['data']
            still_streaming = len(streams) > 0 and streams[0]['game_name'] == GAME_NAME
            values = {}

            if quest != None and still_streaming:
                if streamer.get("quest"):
                    if streamer['quest'].index > quest.index:
                        print("Parsed quest is before last checked quest. Last: ", streamer['quest'].index, ", parsed: ", quest.index)
                        continue

                streamer_progress[streamer_login] = {"quest": quest, "last_updated": datetime.datetime.utcnow()}
                values["quest"] = quest
                values["last_updated"] = datetime.datetime.utcnow()  

                # Upload the image file
                try:
                    result = cloudinary.uploader.upload(img_file)
                    if result.get('public_id') and result.get('secure_url'):
                        # Delete previous image from cloudinary
                        if streamer.get('image'):
                            cloudinary.api.delete_resources([streamer['image']['public_id']])

                        values["image"] = {
                            "public_id": result['public_id'],
                            "url": result['secure_url']
                        }
                except Exception as e:
                    print("Failed to upload image", e)
       
                db["streamers"].find_one_and_update({"user_login": streamer_login.lower()}, {"$set": values})
        except Exception as e:
            print("Error processing stream", e)


def get_quest(streamer):
    print("Getting quest for", streamer, flush=True)

    screenshot_stream(streamer)
    img_file = '{}.jpg'.format(streamer)
    img_rgb = cv2.imread(img_file, cv2.IMREAD_UNCHANGED)

    print("Matching msq tracker", flush=True)
    quest_text = match(img_rgb, MSQ_TRACKER_MATCH_VARS)
    if quest_text == None or quest_text not in QUESTS:
        print("Matching quest log", flush=True)
        quest_text = match(img_rgb, MSQ_ICON_MATCH_VARS)

    if quest_text in QUESTS:
        return QUESTS[quest_text], img_file

    return None, img_file


def screenshot_stream(streamer):
    os.system('rm {}*.jpg'.format(streamer))
    print("Screenshotting stream", flush=True)
    m3u8 = streamlink.streams("twitch.tv/{}".format(streamer))["best"].url
    ffmpeg_cmd = 'ffmpeg -i "{}" -ss 00:00:40.00 -qscale:v 2 -hide_banner -loglevel error -vframes 1 {}.jpg'.format(
        m3u8, streamer)
    print(ffmpeg_cmd, flush=True)
    subprocess.call(ffmpeg_cmd, shell=True)


def match(img_rgb, match_vars):
    (iH, iW) = img_rgb.shape[:2]

    # Isolate red colors in image and template
    img_res = isolate_color(img_rgb, match_vars.lower, match_vars.upper)
    template_res = isolate_color(
        match_vars.template, match_vars.lower, match_vars.upper)

    # Multi-scale Template Matching
    (minVal, minLoc, r) = multiscale_template_match(img_res, template_res)

    # Using coords of msq icon, box the text
    p1 = np.add((minLoc[0], minLoc[1]), match_vars.box[0])
    p2 = np.add((minLoc[0], minLoc[1]), match_vars.box[1])
    p1 = (max(0, int(p1[0] * r)), max(0, int(p1[1] * r)))
    p2 = (min(iW - 1, int(p2[0] * r)), min(iH - 1, int(p2[1] * r)))
    print(p1, p2, flush=True)

    cropped = img_rgb[p1[1]:p2[1], p1[0]:p2[0]]
    quest_text = pytesseract.image_to_string(cropped).strip().lstrip().rstrip()
    print("Text Parsed:[{}]".format(quest_text), flush=True)

    if len(quest_text) > 0:
        return quest_text


def isolate_color(img_rgb, lower, upper):
    img_hsv = cv2.cvtColor(np.asarray(img_rgb), cv2.COLOR_BGR2HSV)
    img_mask = cv2.inRange(img_hsv, lower, upper)
    return cv2.bitwise_and(img_hsv, img_hsv, mask=img_mask)


# From pyimagesearch.com
def multiscale_template_match(img, template):
    (tH, tW) = template.shape[:2]

    found = None
    for scale in np.linspace(0.5, 1.5, 20)[::-1]:
        resized = resize(img, width=int(img.shape[1] * scale))
        r = img.shape[1] / float(resized.shape[1])

        if resized.shape[0] < tH or resized.shape[1] < tW:
            break

        result = cv2.matchTemplate(resized, template, cv2.TM_SQDIFF_NORMED)
        (minVal, maxVal, minLoc, maxLoc) = cv2.minMaxLoc(result)

        if found is None or minVal < found[0]:
            found = (minVal, minLoc, r)
    return found


# From imutils
def resize(image, width=None, height=None, inter=cv2.INTER_AREA):
    # initialize the dimensions of the image to be resized and grab the image size
    dim = None
    (h, w) = image.shape[:2]
    # if both the width and height are None, then return the original image
    if width is None and height is None:
        return image
    # check to see if the width is None
    if width is None:
        # calculate the ratio of the height and construct the dimensions
        r = height / float(h)
        dim = (int(w * r), height)
    # otherwise, the height is None
    else:
        # calculate the ratio of the width and construct the dimensions
        r = width / float(w)
        dim = (width, int(h * r))
    # resize the image
    resized = cv2.resize(image, dim, interpolation=inter)
    # return the resized image
    return resized


if __name__ == '__main__':
    while(True):
        periodic_job()
        time.sleep(30)