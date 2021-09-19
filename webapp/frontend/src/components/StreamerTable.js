import { Component } from 'react'
import './StreamerTable.css'
import { Avatar, Tooltip } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
    streamerCell: {
        display: 'flex',
        width: '100%', 
        alignItems: 'center'
    },
    live: {
        border: '4px solid #4caf50'
    },
    notLive: {
        border: '4px solid #666'
    }
});

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
            rows.push(this.createData(id++, streamer["user_login"], streamer["quest"], 
                new Date(streamer["last_updated"]), streamer["image"], streamer["profile_image_url"], streamer["is_live"]));
        });
        this.setState({
            rows: rows
        });
    }

    createData(id, userLogin, quest, lastUpdated, image, profileUrl, isLive) {
        return { id, userLogin, quest, lastUpdated, image, profileUrl, isLive };
    }

    getColumns() {
        const { classes } = this.props;

        return [
            {
                field: 'userLogin',
                headerName: 'Streamer',
                width: '200',
                renderCell: (params) => {
                    var liveStatus = params.row['isLive'] ? 'live' : 'notLive';
                    var liveMessage = params.row['isLive'] ? 'Currently streaming FFXIV' : 'Not streaming FFXIV';
                    var twitchUrl = 'https://twitch.tv/' + params.row['userLogin'];
                    if (params.row['profileUrl']) {
                        return (
                            <div className={classes.streamerCell}>
                                <Tooltip title={liveMessage} arrow>
                                    <Avatar alt={params.row['userLogin']} src={params.row['profileUrl']} className={classes[liveStatus]} />
                                </Tooltip>
                                <a href={twitchUrl} target="_blank" rel="noopener noreferrer" style={{marginLeft: '10px'}}>{params.row['userLogin']}</a>
                                
                            </div>
                        );
                    } else {
                        return (
                            <div>{params.row['userLogin']}</div>
                        );
                    }
                },
                sortComparator: (v1, v2, param1, param2) => {
                    return param1.api.getRow(param1.id)['userLogin'].localeCompare(param2.api.getRow(param2.id)['userLogin']);
                }
            },
            {
                field: 'quest',
                headerName: 'Quest',
                width: '400',
                renderCell: (params) => {
                    var quest = params.row['quest']['quest'];
                    var quest_url = params.row['quest']['quest_link'];
                    return (
                        <a href={quest_url} target="_blank" rel="noopener noreferrer">{quest}</a>
                    );
                },
                sortComparator: (v1, v2, param1, param2) => {
                    return param1.api.getRow(param1.id)['quest']['index'] - 
                        param2.api.getRow(param2.id)['quest']['index'];
                }
            },
            {
                field: 'section',
                headerName: 'Section',
                width: '500',
                valueGetter: (params) => params.row['quest']['section'],
                sortComparator: (v1, v2, param1, param2) => {
                    return param1.api.getRow(param1.id)['quest']['index'] - 
                        param2.api.getRow(param2.id)['quest']['index'];
                }
            },
            {
                field: 'image',
                headerName: 'Screenshot',
                width: '400',
                renderCell: (params) => {
                    if (params.row['image']) {
                        var imageUrl = params.row['image']['url'];
                        return (
                            <a href={imageUrl} target="_blank" rel="noopener noreferrer" alt={params.row['lastUpdated']} style={{height: '100%'}}>
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
                valueGetter: (params) => this.getLocalDateString(params.value),
                sortComparator: (v1, v2, param1, param2) => {
                    return param1.api.getRow(param1.id)['lastUpdated'] - 
                        param2.api.getRow(param2.id)['lastUpdated']
                }
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
                    hideFooter
                    rowHeight={150}
                    rows={this.state.rows}
                    columns={this.getColumns()}
                />
            </div>
        );
    }
}

export default withStyles(useStyles)(StreamerTable);