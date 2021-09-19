import requests
from bs4 import BeautifulSoup

URL = "https://ffxiv.consolegameswiki.com/wiki/Main_Scenario_Quests"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find_all(['h3', 'table'])

for result in results:
    print(result)
