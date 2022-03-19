import React from 'react';

import { QUEST_ROW_COLORS } from '../../lib/utils/constants';
import getRowColor from '../../lib/utils/color';

function getOutline(isSelected) {
    return isSelected ? "border-black" : "border-transparent";
}

const SORT_FUNCTIONS = [compareUpdated, compareName, compareProgress];

function compareName(first, second) {
    return ('' + first["user_login"]).localeCompare(second["user_login"]);
}

function compareProgress(first, second) {
    function getQuest(streamer) {
        if (streamer) {
            if (streamer["quest"] && streamer["quest"]["index"]) {
                return streamer["quest"]["index"];
            }
        }
        return 0;
    }

    return getQuest(first) - getQuest(second);
}

function compareUpdated(first, second) {
    return (new Date(second["last_updated"]) - new Date(first["last_updated"])) || 0;
}

const StreamerRow = ({ streamer, index, onStreamerRowSelect, isSelected }) => {
    let twitchUrl = 'https://twitch.tv/' + streamer['user_login'];
    return (
        <li className={"flex justify-between items-center p-2 bg-gray-100"}>
            <div className={"flex items-center p-2 h-full w-full shadow rounded-lg select-none border-2 hover:bg-opacity-40 " + getRowColor(streamer["quest"]["index"], QUEST_ROW_COLORS) + " " + getOutline(isSelected)} 
                onClick={() => onStreamerRowSelect(index, streamer)}>
                <a title={twitchUrl} href={twitchUrl} target="_blank" rel="noopener noreferrer">
                    <img className={"object-cover w-8 h-8 rounded-full outline outline-4 " + (streamer["is_live"] ? "outline-green-500" : "outline-gray-500")}
                        src={streamer["profile_image_url"]} alt="Profile image" />
                </a>
                <div className="ml-2">
                    {streamer["user_login"]}
                </div>
            </div>
        </li>
    )
}

function StreamerList({ streamers, setSelectedQuestIndex, setSelectedStreamer }) {
    const [highlightedStreamer, setHighlightedStreamer] = React.useState({});
    const [data, setData] = React.useState([]);
    const [sortByIndex, setSortByIndex] = React.useState(0);

    const onStreamerRowSelect = (index, streamer) => {
        setSelectedQuestIndex(streamer["quest"]["index"]);
        setHighlightedStreamer(streamer);
        setSelectedStreamer(streamer);
    };

    React.useEffect(() => {
        const sorted = [...streamers].sort(SORT_FUNCTIONS[sortByIndex]);
        setData(sorted);
    }, [sortByIndex, streamers]);

    return (
        <div className="flex flex-col w-1/6 h-3/6 px-5 pb-5 pt-3 gap-2 min-w-max bg-gray-100 rounded-lg shadow md:h-5/6">
            <h1 className="text-xl font-semibold">Streamers</h1>
            { /* Sort selection */}
            <label>
                <span>Sort by:</span>
                <select className="ml-1 rounded-sm shadow" onChange={e => setSortByIndex(e.target.value)}>
                    <option value={0}>Updated</option>
                    <option value={1}>Name</option>
                    <option value={2}>Progress</option>
                </select>
            </label>
            <ul className="overflow-y-scroll">
                {data.map((x, i) => <StreamerRow key={"streamerRow" + i} streamer={x} index={i} onStreamerRowSelect={onStreamerRowSelect} isSelected={x == highlightedStreamer} />) }
            </ul>
        </div>
    );
}

export default StreamerList;