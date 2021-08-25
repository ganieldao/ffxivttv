import { Component } from 'react'
import './StreamerTable.css'
import { DataGrid } from '@material-ui/data-grid';
import arr from '../assets/images/arr.png';
import heavensward from '../assets/images/heavensward.png';

const SAMPLE_DATA = {"status":"success","data":[{"_id":"6119b80dab9597e7fc4a8764","user_login":"richwcampbell","last_updated":"2021-08-22T00:26:41.275Z","quest":{"index":562,"quest":"Storm on the Horizon","quest_link":"https://ffxiv.consolegameswiki.com/wiki/Storm_on_the_Horizon","level":70,"quest_giver":"Hien","giver_link":"https://ffxiv.consolegameswiki.com/wiki/Hien","unlocks":[],"subsection":"","section":"Patch 4.2 (Rise of a New Sun)"},"image":{"public_id":"wodmqj6tpjg2waijv3k0","url":"http://res.cloudinary.com/ffxivttv/image/upload/v1629671144/wodmqj6tpjg2waijv3k0.jpg"}},{"_id":"6119b80dab9597e7fc4a8765","user_login":"fextralife","quest_name":"","last_updated":"2021-08-18T02:56:31.305Z","quest":{"index":156,"quest":"Representing the Representative","quest_link":"https://ffxiv.consolegameswiki.com/wiki/Representing_the_Representative","level":42,"quest_giver":"Ceana","giver_link":"https://ffxiv.consolegameswiki.com/wiki/Ceana","unlocks":[],"subsection":"","section":"Levels 41-50"}},{"_id":"6119b80dab9597e7fc4a8766","user_login":"sloot","last_updated":"2021-08-22T00:16:09.284Z","quest":{"index":336,"quest":"New Winds, Old Friends","quest_link":"https://ffxiv.consolegameswiki.com/wiki/New_Winds,_Old_Friends","level":54,"quest_giver":"Estinien","giver_link":"https://ffxiv.consolegameswiki.com/wiki/Estinien","unlocks":[],"subsection":"","section":"Levels 54-55"}},{"_id":"6119b80dab9597e7fc4a8768","user_login":"shiphtur","last_updated":"2021-08-17T00:00:38.828Z","quest":{"index":587,"quest":"The Syrcus Trench","quest_link":"https://ffxiv.consolegameswiki.com/wiki/The_Syrcus_Trench","level":70,"quest_giver":"Tataru","giver_link":"https://ffxiv.consolegameswiki.com/wiki/Tataru","unlocks":[],"subsection":"Main Quest Chain","section":"Levels 70-71"}}]}

class StreamerTable extends Component {
    constructor() {
        super();
        this.state = {
            rows: []
        };
    }

    componentDidMount() {
        fetch("/api/streamers")
            .then(response => response.json())
            .then(json => {
                this.updateRows(json.data)
            });
    }

    updateRows(streamers) {
        var rows = [];
        var id = 1;
        streamers.forEach(streamer => {
            rows.push(this.createData(id++, streamer["user_login"], streamer["quest"]["quest"], 
                streamer["quest"]["section"], new Date(streamer["last_updated"]), streamer["image"]));
        });
        this.setState({
            rows: rows
        });
        return rows
    }

    createData(id, userLogin, quest, section, lastUpdated, image) {
        return { id, userLogin, quest, section, lastUpdated, image };
    }

    getColumns() {
        return [
            {
                field: 'userLogin',
                headerName: 'Streamer',
                width: '200'
            },
            {
                field: 'quest',
                headerName: 'Quest',
                width: '400'
            },
            {
                field: 'section',
                headerName: 'Section',
                width: '500'
            },
            {
                field: 'image',
                headerName: 'Screenshot',
                width: '400',
                renderCell: (params) => {
                    if (params.row['image']) {
                        var imageUrl = params.row['image']['url'];
                        return (
                            <a href={imageUrl} alt={params.row['lastUpdated']} style={{height: '100%'}}>
                                <img alt={params.row['lastUpdated']} src={imageUrl} style={{maxWidth:'100%', maxHeight:'100%'}} />
                            </a>
                        );
                    } else {
                        return (
                            <div>No Screenshot Available</div>
                        )
                    }
                }
            },
            {
                field: 'lastUpdated',
                headerName: 'Last Updated',
                width: '300',
                valueGetter: (params) => this.getLocalDateString(params.value)
            }
        ]
    }

    getLocalDateString(date) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }

    render() {
        return (
            <div style={{ height: '100%', width: '100%' }}>
                <DataGrid 
                    rowHeight={150}
                    rows={this.state.rows}
                    columns={this.getColumns()}
                />
            </div>
        );
    }
}

export default StreamerTable;