import React from 'react';

import QuestList from "../components/questlist/QuestList";
import StreamerList from '../components/streamerlist/StreamerList';
import ScreenContainer from '../components/screencontainer/ScreenContainer';

const QUESTS = require('../res/quests_list.json');
const TEST_DATA = require('../res/test_data.json')['data'];

export async function getStaticProps(context) {
  return {
    props: {
      streamers: TEST_DATA
    },
  }
}

function Home({ streamers }) {
  const [selectedQuestIndex, setSelectedQuestIndex] = React.useState(-1);
  const [selectedStreamer, setSelectedStreamer] = React.useState({});

  return (
    <div className="flex flex-col justify-center items-center gap-10 pt-20 h-screen w-screen bg-white md:items-start md:flex-row">
      <StreamerList streamers={streamers} setSelectedQuestIndex={setSelectedQuestIndex} setSelectedStreamer={setSelectedStreamer} />
      <div className="flex flex-col gap-5">
        <QuestList quests={QUESTS} selectedQuestIndex={selectedQuestIndex} />
        <ScreenContainer selectedStreamer={selectedStreamer} />
      </div>
    </div>
  )
}

export default Home;
