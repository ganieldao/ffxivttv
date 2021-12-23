import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
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
  <div style={style} className="flex justify-between items-center">
    <div className="p-2 flex h-3/4 items-center w-full bg-white shadow rounded-lg hover:bg-sky-700"
      onClick={() => questListRef.current.scrollToItem(TEST_DATA[index]["quest"]["index"])}>
      <div>
        {TEST_DATA[index]["user_login"]}
      </div>
    </div>
  </div>
);

const Row = ({ index, style }) => (
  <div style={style}>
    {QUESTS[index]["quest"]}
  </div>
);

function Home({ streamers }) {
  return (
    <div className="min-h-screen w-screen bg-gray-200 flex flex-col pt-20 justify-center items-center md:items-start md:flex-row">
      <List
        height={500}
        itemCount={TEST_DATA.length}
        itemSize={80}
        width={300}
      >
        {StreamerRow}
      </List>
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
