import React from 'react';

const QUESTS = require('../res/quests_list.json');
const TEST_DATA = require('../res/test_data.json')['data'];
const EXPANSION_START_INDICES = [856, 748, 591, 429, 291, 0] // TBC, EW, ShB, SB, HW, ARR
const QUEST_ROW_COLORS = ["bg-green-200", "bg-gray-200", "bg-purple-200", "bg-red-200", "bg-blue-200", "bg-yellow-100"]
const SECTION_ROW_COLORS = ["bg-green-300", "bg-gray-300", "bg-purple-300", "bg-red-300", "bg-blue-300", "bg-yellow-200"]

export async function getStaticProps(context) {
  return {
    props: {
      streamers: TEST_DATA
    },
  }
}

function getRowColor(rowIndex, rowColors) {
  for (let i = 0; i < EXPANSION_START_INDICES.length; i ++) {
    if (rowIndex >= EXPANSION_START_INDICES[i]) {
      return rowColors[i];
    }
  }
}

function getOutline(isSelected) {
  return isSelected ? "border-black" : "border-transparent";
}

function getQuestTypeIcon(questType) {
  return './' + questType + '.png';
}

const StreamerRow = ({ streamer, index, onStreamerSelect, isSelected }) => {
  return (
    <li className={"flex justify-between items-center p-2 bg-gray-100"}>
      <div className={"flex items-center p-2 h-full w-full shadow rounded-lg select-none border-2 hover:bg-opacity-40 " + getRowColor(streamer["quest"]["index"], QUEST_ROW_COLORS) + " " + getOutline(isSelected)} 
        onClick={() => onStreamerSelect(index)}>
        <img className={"object-cover w-8 h-8 rounded-full outline outline-4 " + (streamer["is_live"] ? "outline-green-500" : "outline-gray-500")}
          src={streamer["profile_image_url"]} alt="Profile image" />
        <div className="ml-2">
          {streamer["user_login"]}
        </div>
      </div>
    </li>
  )
}

function StreamerList({ streamers, setSelectedQuestIndex }) {
  const [selectedStreamerIndex, setSelectedStreamerIndex] = React.useState(-1);

  const onStreamerSelect = (streamerIndex) => {
    console.log("Select " + streamerIndex)
    setSelectedQuestIndex(streamers[streamerIndex]["quest"]["index"]);
    setSelectedStreamerIndex(streamerIndex);
  };

  return (
    <div className="flex flex-col w-1/6 h-5/6 px-5 pb-5 pt-3 gap-2 bg-gray-100 rounded-lg shadow">
      <h1 className="text-xl font-semibold">Streamers</h1>
      { /* Sort selection */}
      <label>
        <span>Sort by:</span>
        <select className="ml-1 rounded-sm shadow">
          <option value={0}>Updated</option>
          <option value={1}>Name</option>
          <option value={2}>Progress</option>
        </select>
      </label>
      <ul className="overflow-y-scroll">
        {streamers.map((x, i) => <StreamerRow key={"streamerRow" + i} streamer={x} index={i} onStreamerSelect={onStreamerSelect} isSelected={i == selectedStreamerIndex} />) }
      </ul>
    </div>
  );
}

const QuestRow = ({ quest, rowRef, selectedQuestIndex }) => (
  <li ref={rowRef} className={"flex select-none items-center " + getRowColor(quest["index"], QUEST_ROW_COLORS) + (selectedQuestIndex == quest["index"] ? " bg-opacity-90" : "")}>
    <div className="flex w-full items-center justify-between ml-2">
      <h1>{quest["quest"]}</h1>
      <div className="flex">
        {
          quest["unlocks"].map((unlock, i) => {
            return (
              <div key={"unlock" + quest["index"] + "_" + i}>
                {"type" in unlock ?
                  <img className="w-5 h-5 mr-1" title={unlock["unlock"]} src={getQuestTypeIcon(unlock["type"])}></img> : null}
              </div>
            );
          })
        }
      </div>
    </div>
  </li>
);

function QuestTable({ section, rowRefs, selectedQuestIndex }) {
  const section_quests = section["quests"];

  return (
    <li className="list-none bg-black">
      <ul>
        <li className={"sticky top-0 shadow-md text-sm p-1 font-semibold border border-slate-900 " + getRowColor(section_quests[0]["index"], SECTION_ROW_COLORS)}>{section["section"]}</li>
        {section_quests.map((x, i) => {
          return <QuestRow key={"questRow" + x["index"]} quest={x} rowRef={el => rowRefs.current[x["index"]] = el} selectedQuestIndex={selectedQuestIndex} />
        })}
      </ul>
    </li>
  );
}

function QuestList({ quests, selectedQuestIndex }) {
  // Create refs for each quest, total is the quest index of the last quest in the last section
  const rowRefs = React.useRef(new Array(quests.slice(-1)[0]["quests"].slice(-1)[0]["index"]));

  // Scroll to selected quest
  React.useEffect(() => {
    const selectedQuest = rowRefs.current[0]
    if (selectedQuestIndex >= 0 && selectedQuestIndex < rowRefs.current.length) {
      selectedQuest = rowRefs.current[selectedQuestIndex]
    } else if (selectedQuestIndex >= rowRefs.current.length) {
      selectedQuest = rowRefs.current.slice(-1)[0];
    }
    selectedQuest.scrollIntoView({ behavior: 'smooth', block: "center" });
  }, [selectedQuestIndex]);

  return (
    <div className="flex flex-col px-5 pb-5 pt-3 h-96 gap-2 bg-gray-100 rounded-lg shadow">
      <h1 className="text-xl font-semibold">Main Scenario Quests</h1>
      <div className="overflow-y-scroll">
        {quests.map((x, i) =>
          <QuestTable key={"questTable" + i} section={x} rowRefs={rowRefs} selectedQuestIndex={selectedQuestIndex} />
        )}
      </div>
    </div>
  );
};

function Home({ streamers }) {
  const [selectedQuestIndex, setSelectedQuestIndex] = React.useState(-1);

  return (
    <div className="flex flex-col justify-center items-center gap-10 pt-20 h-screen w-screen bg-white md:items-start md:flex-row">
      <StreamerList streamers={streamers} setSelectedQuestIndex={setSelectedQuestIndex} />
      <QuestList quests={QUESTS} selectedQuestIndex={selectedQuestIndex} />
    </div>
  )
}

export default Home;
