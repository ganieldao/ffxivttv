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

LOWER_RED = np.array([100, 100, 100])
UPPER_RED = np.array([255, 255, 255])
LOWER_YELLOW = np.array([15, 20, 100])
UPPER_YELLOW = np.array([50, 255, 255])

MSQ_TRACKER_TEMPLATE = cv2.imread('msq_tracker.jpg', cv2.IMREAD_UNCHANGED)
MSQ_ICON_TEMPLATE = cv2.imread('msq_icon.png', cv2.IMREAD_UNCHANGED)

MSQ_TRACKER_MATCH_VARS = MatchVars(MSQ_TRACKER_TEMPLATE, LOWER_RED, UPPER_RED, ((
    MSQ_TRACKER_TEMPLATE.shape[0] + 10, 0), (MSQ_TRACKER_TEMPLATE.shape[0] + 215, MSQ_TRACKER_TEMPLATE.shape[1])))
MSQ_ICON_MATCH_VARS = MatchVars(MSQ_ICON_TEMPLATE, LOWER_YELLOW, UPPER_YELLOW, (
    (-MSQ_ICON_TEMPLATE.shape[0] - 200, 0), (0, MSQ_ICON_TEMPLATE.shape[1])))

GAME_NAME = "Final Fantasy XIV Online"

streamer_progress = {}

last_ran = None
last_finished = None

twitch = Twitch(os.environ['TWITCH_CLIENT_ID'], os.environ['TWITCH_SECRET'])
twitch.authenticate_app([])

streamlink = Streamlink()

is_running = False

global db
try:
    # try to instantiate a client instance
    client = MongoClient(os.environ['MONGO_URI'])

    # print the version of MongoDB server if connection successful
    print("server version:", client.server_info()["version"])

    # get the database_names from the MongoClient()
    database_names = client.list_database_names()

    db = client['ffxivttvtracker']
except Exception as e:
    # set the client and DB name list to 'None' and `[]` if exception
    client = None
    database_names = []

    # catch pymongo.errors.ServerSelectionTimeoutError
    print ("pymongo ERROR", e)

print("\ndatabases:", database_names)


def periodic_job():
    print("Starting job", flush=True)
    global last_ran 
    last_ran = datetime.datetime.utcnow()

    streamer_logins = get_streamer_logins()
    print("Logins", streamer_logins)
    streams = twitch.get_streams(user_login=streamer_logins)['data']
    process_streams(streams)
  
    global last_finished
    last_finished = datetime.datetime.utcnow()
    print(streamer_progress, flush=True)


def get_streamer_logins():
    if not db:
        return []

    streamer_logins = [x["user_login"] for x in db["streamers"].find({}, {"_id": 0, "user_login": 1})]
    if not streamer_logins:
        return list(streamer_progress.keys())

    return streamer_logins


def process_streams(streams):
    if len(streams) > 0:
        for stream in streams:
            if stream['game_name'] == GAME_NAME:
                try:
                    quest = get_quest(stream['user_login'])
                    if quest != None:
                        streamer_progress[stream['user_login']] = {"quest": quest, "last_updated": datetime.datetime.utcnow()}
                        db["streamers"].find_one_and_update({"user_login": stream['user_login'].lower()}, 
                            {"$set": {"quest": quest, "last_updated": datetime.datetime.utcnow()}})
                except Exception as e:
                    print("error", e)


def get_quest(streamer):
    print("Getting quest for", streamer, flush=True)
    num = 8
    screenshot_stream(streamer, num)
    img_file = '{}_{}.jpg'.format(streamer, num)
    img_rgb = cv2.imread(img_file, cv2.IMREAD_UNCHANGED)
    quest_text = match(img_rgb, MSQ_TRACKER_MATCH_VARS)
    if quest_text == None or quest_text not in QUESTS:
        quest_text = match(img_rgb, MSQ_ICON_MATCH_VARS)

    if quest_text in QUESTS:
        return QUESTS[quest_text]


def screenshot_stream(streamer, num=6):
    os.system('rm {}*.jpg'.format(streamer))
    print("getting stream-url", flush=True)
    m3u8 = streamlink.streams("twitch.tv/{}".format(streamer))["best"].url
    print(m3u8, flush=True)
    ffmpeg_cmd = 'ffmpeg -i "{}" -hide_banner -loglevel error -vframes {} -r 0.1 {}_%d.jpg'.format(
        m3u8, num, streamer)
    print(ffmpeg_cmd, flush=True)
    subprocess.call(ffmpeg_cmd, shell=True)


def match(img_rgb, match_vars):
    print("Matching msq tracker icon", flush=True)
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
    for scale in np.linspace(0.2, 1.0, 20)[::-1]:
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
    print("Started", flush=True)
    while(True):
        periodic_job()
        time.sleep(10)
        pass