import React from 'react';

const QUESTS = require('../res/quests_list.json');
const TEST_DATA = require('../res/test_data.json')['data'];

function getQuestTypeIcon(questType) {
  return './' + questType + '.png';
}

export async function getStaticProps(context) {
  return {
    props: {
      streamers: TEST_DATA
    },
  }
}

const StreamerRow = ({ streamer, setSelectedQuestIndex }) => (
  <li className="flex justify-between items-center p-2 bg-gray-100">
    <div className="flex items-center p-2 h-full w-full bg-white shadow rounded-lg select-none hover:bg-sky-100"
      onClick={() => setSelectedQuestIndex(streamer["quest"]["index"])}>
      <img className="object-cover w-8 h-8 rounded-full outline outline-4 outline-green-600"
        src={streamer["profile_image_url"]} alt="Profile image" />
      <div className="ml-2">
        {streamer["user_login"]}
      </div>
    </div>
  </li>
);

function StreamerList({ streamers, setSelectedQuestIndex }) {
  return (
    <div className="flex flex-col h-5/6 px-5 pb-5 pt-3 gap-2 bg-gray-100 rounded-lg shadow">
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
        {streamers.map((x, i) => <StreamerRow key={"streamerRow" + i} streamer={x} setSelectedQuestIndex={setSelectedQuestIndex} />) }
      </ul>
    </div>
  );
}

const QuestRow = ({ quest, rowRef, selectedQuestIndex }) => (
  <li ref={rowRef} className={"flex select-none items-center " + (selectedQuestIndex == quest["index"] ? "bg-blue-100" : "")}>
    <div className="flex w-full items-center justify-between ml-2">
      {quest["quest"]}
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
    <li className="list-none">
      <ul>
        <li className="sticky top-0 shadow-md text-sm p-1 font-semibold bg-blue-300">{section["section"]}</li>
        {section_quests.map((x, i) => {
          return <QuestRow key={"questRow" + x["index"]} quest={x} rowRef={el => rowRefs.current[x["index"]] = el} selectedQuestIndex={selectedQuestIndex} />
        })}
      </ul>
    </li>
  );
}

function QuestList({ quests, selectedQuestIndex }) {
  // Create refs for each quest, total is the quest index of the last quest in the last section
  const rowRefs = React.useRef(new Array(quests.at(-1)["quests"].at(-1)["index"]));

  // Scroll to selected quest
  React.useEffect(() => {
    const selectedQuest = rowRefs.current[0]
    if (selectedQuestIndex >= 0 && selectedQuestIndex < rowRefs.current.length) {
      selectedQuest = rowRefs.current[selectedQuestIndex]
    } else if (selectedQuestIndex >= rowRefs.current.length) {
      selectedQuest = rowRefs.current.at(-1);
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
