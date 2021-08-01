from flask import Flask
import numpy as np
import subprocess
import os
import cv2
try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract
  
app = Flask(__name__)
 
 
@app.route('/')
def hello_whale():
    print("getting stream-url")
    m3u8 = subprocess.getoutput("streamlink twitch.tv/Shiphtur best --stream-url")
    print(m3u8)
    os.system('ffmpeg -i "{}" -vframes 6 -r 0.1 -qmin 1 -q:v 1 output_%05d.jpg'.format(m3u8))
    img_rgb = cv2.imread('output_00006.jpg', cv2.IMREAD_UNCHANGED)
    match_msq_tracker_icon(img_rgb)
    
    
def match_msq_tracker_icon(img_rgb):
    print("Matching msq tracker icon")
    img = cv2.cvtColor(np.asarray(img_rgb), cv2.COLOR_BGR2GRAY)
    
    template_rgb = cv2.imread('msq_tracker_2.jpg', cv2.IMREAD_UNCHANGED)
    (tH, tW) = template_rgb.shape[:2]
    msq_box = ((tW + 10, 0), (tW + 215, tH))
    
    # Isolate red colors in image and template
    img_hsv = cv2.cvtColor(np.asarray(img_rgb), cv2.COLOR_BGR2HSV)
    template_hsv = cv2.cvtColor(np.asarray(template_rgb), cv2.COLOR_BGR2HSV)
    
    lower_red = np.array([100,100,100])
    upper_red = np.array([255,255,255])
    
    img_mask = cv2.inRange(img_hsv, lower_red, upper_red)
    template_mask = cv2.inRange(template_hsv, lower_red, upper_red)
    
    img_res = cv2.bitwise_and(img_hsv, img_hsv, mask=img_mask)
    template_res = cv2.bitwise_and(template_hsv, template_hsv, mask=template_mask)
    
    # Multi-scale Template Matching (from pyimagesearch.com)
    found = None
    for scale in np.linspace(0.2, 1.0, 20)[::-1]:
        resized = resize(img_res, width = int(img_res.shape[1] * scale))
        r = img_res.shape[1] / float(resized.shape[1])

        if resized.shape[0] < tH or resized.shape[1] < tW:
            break

        result = cv2.matchTemplate(resized, template_res, cv2.TM_SQDIFF_NORMED)
        (minVal, maxVal, minLoc, maxLoc) = cv2.minMaxLoc(result)

        if found is None or minVal < found[0]:
            found = (minVal, minLoc, r)
        
    (minVal, minLoc, r) = found
    
    # Using coords of msq icon, box the text
    p1 = np.add((minLoc[0], minLoc[1]), msq_box[0])
    p2 = np.add((minLoc[0], minLoc[1]), msq_box[1])
    p1 = (int(p1[0] * r), int(p1[1] * r))
    p2 = (int(p2[0] * r), int(p2[1] * r))
    
    cropped = img_rgb[p1[1]:p2[1], p1[0]:p2[0]]
    quest_text = pytesseract.image_to_string(cropped).strip().lstrip().rstrip()
    print("Text Parsed: ", quest_text)

    cv2.rectangle(img_rgb, p1, p2, (0, 0, 255), 2)
    cv2.imshow("Image", img_rgb)
    cv2.waitKey(0)
    
    
    
    
    
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
