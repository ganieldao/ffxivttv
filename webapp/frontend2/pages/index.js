import React from 'react';
import Image from 'next/image'
import { FixedSizeList as List } from "react-window";

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

function StreamerList({ setSelectedQuestIndex }) {
  const StreamerRow = ({ index, style }) => (
    <div style={style} className="flex justify-between items-center p-2 bg-gray-100">
      <div className="flex items-center p-2 h-full w-full bg-white shadow rounded-lg select-none hover:bg-sky-100"
        onClick={() => setSelectedQuestIndex(TEST_DATA[index]["quest"]["index"])}>
        <img className="object-cover w-8 h-8 rounded-full outline outline-4 outline-green-600"
          src={TEST_DATA[index]["profile_image_url"]} alt="Profile image" />
        <div className="ml-2">
          {TEST_DATA[index]["user_login"]}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-5 pb-5 pt-3 bg-gray-100 rounded-lg shadow gap-2">
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
      <List
        height={500}
        itemCount={TEST_DATA.length}
        itemSize={80}
        width={250}
      >
        {StreamerRow}
      </List>
    </div>
  );
}

function QuestList({ quests, selectedQuestIndex }) {
  const questListRef = React.createRef();

  React.useEffect(() => {
    if (selectedQuestIndex >= 0 && selectedQuestIndex < QUESTS.length) {
      questListRef.current.scrollToItem(selectedQuestIndex, 'center')
    }
  }, [selectedQuestIndex]);

  const QuestRow = ({ index, style }) => (
    <div style={style} className={"flex select-none items-center " + (index == selectedQuestIndex ? "bg-green-100" : "")}>
      <div className="flex w-full items-center justify-between ml-2">
        {QUESTS[index]["quest"]}
        <div className="flex">
        {
          QUESTS[index]["unlocks"].map(unlock => {
            return (
              <div>
                {"type" in unlock ? 
                  <img className="w-5 h-5 mr-1" title={unlock["unlock"]} src={getQuestTypeIcon(unlock["type"])}></img> : null}
              </div>
            );
          })
        }
        </div>
      </div>
    </div>
  );

  return (
    <List
      ref={questListRef}
      height={500}
      itemCount={QUESTS.length}
      itemSize={35}
      width={250}
    >
      {QuestRow}
    </List>
  );
}

function QuestList2({ quests, selectedQuestIndex }) {

  function QuestTable({ section }) {
    const section_quests = section["quests"];

    const QuestRow = ({ quest, index }) => (
      <div key={index} className={"flex select-none items-center "}>
        <div className="flex w-full items-center justify-between ml-2">
          {quest["quest"]}
          <div className="flex">
            {
              quest["unlocks"].map(unlock => {
                return (
                  <div>
                    {"type" in unlock ?
                      <img className="w-5 h-5 mr-1" title={unlock["unlock"]} src={getQuestTypeIcon(unlock["type"])}></img> : null}
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <div className="sticky top-0 shadow-md bg-blue-300">{section["section"]}</div>
        {section_quests.map((x, i) =>
          <QuestRow quest={x} index={i} />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll">
      {quests.map((x, i) =>
        <QuestTable section={x} />
      )}
    </div>
  );
};

function Home({ streamers }) {
  const [selectedQuestIndex, setSelectedQuestIndex] = React.useState(-1);

  return (
    <div className="flex flex-col justify-center items-center pt-20 min-h-screen w-screen bg-white md:items-start md:flex-row">
      <StreamerList setSelectedQuestIndex={setSelectedQuestIndex} />
      <QuestList2 quests={QUESTS} />
    </div>
  )
}

export default Home;
