import requests
import json
from bs4 import BeautifulSoup
from requests.api import get

BASE_URL = "https://ffxiv.consolegameswiki.com"
URL = BASE_URL + "/wiki/Main_Scenario_Quests"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

UNLOCK_TYPES = {
    "Achievement": "achievement",
    "Dungeon": "dungeon",
    "Trial": "trial",
    "Mount_speed": "mount",
    "Aether_current": "aether",
    "Location": "location"
}

def get_unlock_type(url):
    for key in UNLOCK_TYPES.keys():
        if key in url:
            return UNLOCK_TYPES[key]
    return None

results = soup.find_all(['h3', 'table'])
print(results)

quest_index = 0
quests_dict = {}
quests_arr = []

curr_section = ''
curr_section_obj = {}
for result in results:
    if result.name == 'h3':
        curr_section = result.getText().rstrip()
        curr_section_obj = {
            "section": curr_section,
            "quests": []
        }
        quests_arr.append(curr_section_obj)
    elif result.name == 'table':
        rows = result.find_all('tr')
        # Ignore header row
        for row in rows[1:]:
            # Quest, Type, Level, Quest Giver, Unlocks
            cells = row.find_all('td')
            if len(cells) == 5:
                unlocks = []

                unlock_obj = {}
                for unlock in cells[4].find_all(['a','div'], recursive=False):
                    img_tag = unlock.find('img')
                    if img_tag:
                        unlock_type = get_unlock_type(img_tag['src'])
                        if unlock_type:
                            unlock_obj['type'] = unlock_type
                    else:
                        unlock_obj['unlock'] = unlock.get_text()
                        unlocks.append(unlock_obj)
                        unlock_obj = {}

                quest_link = row.find('a')
                quest = quest_link.getText().rstrip()
                link = BASE_URL + quest_link['href']
                quest_obj = {
                    "quest": quest,
                    "quest_link": link,
                    "section": curr_section,
                    "index": quest_index,
                    "unlocks": unlocks
                }
                quests_dict[quest] = quest_obj
                curr_section_obj["quests"].append(quest_obj)
                quest_index += 1
                
def write(file, obj):
    f = open(file, "w")
    json.dump(obj, f)
    f.close()

write("quests_formatted.json", quests_dict)
write("quests_list.json", quests_arr) 
        