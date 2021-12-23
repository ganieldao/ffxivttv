import requests
import json
from bs4 import BeautifulSoup

BASE_URL = "https://ffxiv.consolegameswiki.com"
URL = BASE_URL + "/wiki/Main_Scenario_Quests"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find_all(['h3', 'table'])

quest_index = 0
quests_dict = {}
quests_arr = []

curr_section = ''
for result in results:
    if result.name == 'h3':
        curr_section = result.getText().rstrip()
    elif result.name == 'table':
        rows = result.find_all('tr')
        # Ignore header row
        for row in rows[1:]:
            # Quest, Type, Level, Quest Giver, Unlocks
            cells = row.find_all('td')
            if len(cells) == 5:
                unlocks = []
                for unlock in cells[4].find_all('a', recursive=False):
                    unlocks.append(unlock.get_text())
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
                quests_arr.append(quest_obj)
                quest_index += 1
                
def write(file, obj):
    f = open(file, "w")
    json.dump(obj, f)
    f.close()

write("quests_formatted.json", quests_dict)
write("quests_list.json", quests_arr) 
        