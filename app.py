from flask import Flask
import numpy as np
import cv2
try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract
 
app = Flask(__name__)
 
 
@app.route('/')
def hello_whale():
    img_rgb = cv2.imread('test1.jpg', cv2.IMREAD_UNCHANGED)
    match_msq_tracker(img_rgb)
    match_quest_tracker(img_rgb)
    
    
def match_msq_tracker(img_rgb):
    print("Matching msq tracker")
    img = cv2.cvtColor(np.asarray(img_rgb), cv2.COLOR_BGR2GRAY)
    template = cv2.imread('msq_box.jpg', 0)
    w, h = template.shape[::-1]
    
    res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    threshold = 0.8
    
    loc = np.where( res >= threshold)
    res = list(zip(*loc[::-1]))
    
    print(len(res), "results")
    for pt in zip(*loc[::-1]):
        y1 = max(pt[1], 0)
        y2 = min(pt[1] + h, img.shape[::-1][1])
        x1 = max(pt[0], 0)
        x2 = min(pt[0] + w, img.shape[::-1][0])
        
        cv2.rectangle(img_rgb, (x1, y1), (x2, y2), (0,0,255), 2)
        cropped = img[y1:y2, x1:x2]
        quest_text = pytesseract.image_to_string(cropped).strip().lstrip().rstrip()
        print(quest_text)
        
    cv2.imshow("quest_tracker", img_rgb)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    
def match_quest_tracker(img_rgb):
    print("Matching quest tracker")
    img = cv2.cvtColor(np.asarray(img_rgb), cv2.COLOR_BGR2GRAY)
    template = cv2.imread('msq_icon.png', 0)
    w, h = template.shape[::-1]
    
    res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    threshold = 0.8
    
    loc = np.where( res >= threshold)
    res = list(zip(*loc[::-1]))
    
    print(len(res), "results")
    for pt in zip(*loc[::-1]):
        y1 = max(pt[1], 0)
        y2 = min(pt[1] + h, img.shape[::-1][1])
        x1 = max(pt[0] - 350, 0)
        x2 = min(pt[0] + int(w/8), img.shape[::-1][0])
        
        cv2.rectangle(img_rgb, (x1, y1), (x2, y2), (0,0,255), 2)
        cropped = img[y1:y2, x1:x2]
        quest_text = pytesseract.image_to_string(cropped).strip().lstrip().rstrip()
        print(quest_text)
        
    cv2.imshow("quest_tracker", img_rgb)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    
 
if __name__ == '__main__':
    print(hello_whale())
    #app.run(debug=True, host='0.0.0.0')
