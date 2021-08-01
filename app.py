from flask import Flask
import numpy as np
import subprocess
import os
import cv2
import asyncio
try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract

class MatchVars:
    def __init__(self, template, lower, upper, box):
        self.template = template
        self.lower = lower
        self.upper = upper
        self.box = box
  
LOWER_RED = np.array([100,100,100])
UPPER_RED = np.array([255,255,255])
LOWER_YELLOW = np.array([15,20,100])
UPPER_YELLOW = np.array([50,255,255])

MSQ_TRACKER_TEMPLATE = cv2.imread('msq_tracker.jpg', cv2.IMREAD_UNCHANGED)
MSQ_ICON_TEMPLATE = cv2.imread('msq_icon.png', cv2.IMREAD_UNCHANGED)

MSQ_TRACKER_MATCH_VARS = MatchVars(MSQ_TRACKER_TEMPLATE, LOWER_RED, UPPER_RED, ((MSQ_TRACKER_TEMPLATE.shape[0] + 10, 0), (MSQ_TRACKER_TEMPLATE.shape[0] + 215, MSQ_TRACKER_TEMPLATE.shape[1])))
MSQ_ICON_MATCH_VARS = MatchVars(MSQ_ICON_TEMPLATE, LOWER_YELLOW, UPPER_YELLOW, ((-MSQ_ICON_TEMPLATE.shape[0] - 200, 0), (0, MSQ_ICON_TEMPLATE.shape[1])))
  
app = Flask(__name__)
 
 
@app.route('/')
def hello_whale():
    #streamer = "Shiphtur"
    #num = 6
    #screenshot_stream(streamer)
    #img_rgb = cv2.imread('{}_0000{}.jpg'.format(streamer, num), cv2.IMREAD_UNCHANGED)
    img_rgb = cv2.imread('test5.jpg', cv2.IMREAD_UNCHANGED)
    match(img_rgb, MSQ_TRACKER_MATCH_VARS)
    match(img_rgb, MSQ_ICON_MATCH_VARS)
    
    
def screenshot_stream(streamer, num=6):
    os.system('rm {}*.jpg'.format(streamer))
    print("getting stream-url")
    m3u8 = subprocess.getoutput("streamlink twitch.tv/{} best --stream-url".format(streamer))
    print(m3u8)
    os.system('ffmpeg -i "{}" -vframes {} -r 0.1 -qmin 1 -q:v 1 {}_%05d.jpg'.format(m3u8, num, streamer))
    
    
def match(img_rgb, match_vars):
    print("Matching msq tracker icon")
    
    # Isolate red colors in image and template
    img_res = isolate_color(img_rgb, match_vars.lower, match_vars.upper)
    template_res = isolate_color(match_vars.template, match_vars.lower, match_vars.upper)
    
    # Multi-scale Template Matching
    (minVal, minLoc, r) = multiscale_template_match(img_res, template_res)
    
    # Using coords of msq icon, box the text
    p1 = np.add((minLoc[0], minLoc[1]), match_vars.box[0])
    p2 = np.add((minLoc[0], minLoc[1]), match_vars.box[1])
    p1 = (int(p1[0] * r), int(p1[1] * r))
    p2 = (int(p2[0] * r), int(p2[1] * r))
    
    cropped = img_rgb[p1[1]:p2[1], p1[0]:p2[0]]
    quest_text = pytesseract.image_to_string(cropped).strip().lstrip().rstrip()
    print("Text Parsed:", quest_text)

    cv2.rectangle(img_rgb, p1, p2, (0, 0, 255), 2)
    cv2.imshow("Image", img_rgb)
    cv2.waitKey(0)
   

def isolate_color(img_rgb, lower, upper):
    img_hsv = cv2.cvtColor(np.asarray(img_rgb), cv2.COLOR_BGR2HSV)
    img_mask = cv2.inRange(img_hsv, lower, upper)
    return cv2.bitwise_and(img_hsv, img_hsv, mask=img_mask)
    
    
# From pyimagesearch.com
def multiscale_template_match(img, template):
    (tH, tW) = template.shape[:2]
    
    found = None
    for scale in np.linspace(0.2, 1.0, 20)[::-1]:
        resized = resize(img, width = int(img.shape[1] * scale))
        r = img.shape[1] / float(resized.shape[1])

        if resized.shape[0] < tH or resized.shape[1] < tW:
            break

        result = cv2.matchTemplate(resized, template, cv2.TM_SQDIFF_NORMED)
        (minVal, maxVal, minLoc, maxLoc) = cv2.minMaxLoc(result)

        if found is None or minVal < found[0]:
            found = (minVal, minLoc, r)
    return found
    

# From imutils
def resize(image, width = None, height = None, inter = cv2.INTER_AREA):
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
    resized = cv2.resize(image, dim, interpolation = inter)
    # return the resized image
    return resized
    
 
if __name__ == '__main__':
    print(hello_whale())
    #app.run(debug=True, host='0.0.0.0')
