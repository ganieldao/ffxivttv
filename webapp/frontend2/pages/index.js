import React from 'react';
import { FixedSizeList as List } from "react-window";

const QUESTS = require('../res/quests_list.json');
const TEST_DATA = require('../res/test_data.json')['data'];

const questListRef = React.createRef();

export async function getStaticProps(context) {
  return {
    props: {
      streamers: TEST_DATA
    },
  }
}

const StreamerRow = ({ index, style }) => (
  <div style={style} className="flex justify-between items-center p-2 bg-gray-50">
    <div className="flex items-center p-2 h-full w-full bg-white shadow rounded-lg select-none hover:bg-sky-100"
      onClick={() => questListRef.current.scrollToItem(TEST_DATA[index]["quest"]["index"])}>
      <img class="object-cover w-8 h-8 rounded-full outline outline-4 outline-green-600" 
      src={TEST_DATA[index]["profile_image_url"]} alt="Profile image"/>
      <div className="ml-2">
        {TEST_DATA[index]["user_login"]}
      </div>
    </div>
  </div>
);

const Row = ({ index, style }) => (
  <div style={style} className="select-none">
    {QUESTS[index]["quest"]}
  </div>
);

function Home({ streamers }) {
  return (
    <div className="flex flex-col justify-center items-center pt-20 min-h-screen w-screen bg-white md:items-start md:flex-row">
      {/* Streamer List */}
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
          itemCount={streamers.length}
          itemSize={80}
          width={300}
            className="rounded-lg shadow"
        >
          {StreamerRow}
        </List>
      </div>
      {/* Quest List */}
      <List
        ref={questListRef}
        height={500}
        itemCount={QUESTS.length}
        itemSize={35}
        width={300}
      >
        {Row}
      </List>
    </div>
  )
}

export default Home;
