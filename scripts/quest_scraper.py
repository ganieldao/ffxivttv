import requests
import json
from bs4 import BeautifulSoup

BASE_URL = "https://ffxiv.consolegameswiki.com"
URL = BASE_URL + "/wiki/Main_Scenario_Quests"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find_all(['h3', 'table'])

quest_index = 0
quests = {}

curr_section = ''
for result in results:
    if result.name == 'h3':
        curr_section = result.getText().rstrip()
    elif result.name == 'table':
        rows = result.find_all('tr')
        # Ignore header row
        for row in rows[1:]:
            # Quest, Type, Level, Quest Giver, Unlocks
            if len(row.find_all('td')) == 5:
                quest_link = row.find('a')
                quest = quest_link.getText().rstrip()
                link = BASE_URL + quest_link['href']
                quests[quest] = {
                    "quest": quest,
                    "quest_link": link,
                    "section": curr_section,
                    "index": quest_index
                }
                quest_index += 1
                
f = open("quests_formatted.json", "w")
json.dump(quests, f)
f.close()
                
        