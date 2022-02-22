import React from 'react';

function getLocalDateString(date) {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

function ScreenContainer({ selectedStreamer }) {
    const imageUrl = "image" in selectedStreamer ? selectedStreamer["image"]["url"] : '';
    const dateString = "last_updated" in selectedStreamer ? 
        getLocalDateString(new Date(selectedStreamer["last_updated"])) : '';

    return imageUrl == '' ? null : (
        <div className="flex flex-col px-5 pb-5 pt-3 max-w-md gap-2 bg-gray-100 rounded-lg shadow">
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                <img src={imageUrl} className="object-contain" />
            </a>
            <label>Updated on {dateString}</label>
        </div>
    );
}

export default ScreenContainer;
