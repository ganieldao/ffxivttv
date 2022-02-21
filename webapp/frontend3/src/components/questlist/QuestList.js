import React from 'react';

import { QUEST_ROW_COLORS, SECTION_ROW_COLORS, QUEST_ICONS } from '../../lib/utils/constants';
import getRowColor from '../../lib/utils/color';

function getQuestTypeIcon(questType) {
  return QUEST_ICONS[questType];
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
                  <img className="w-5 h-5 mr-1" title={unlock["unlock"]} src={getQuestTypeIcon(unlock["type"]).default}></img> : null}
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
    let selectedQuest = rowRefs.current[0]
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

export default QuestList;