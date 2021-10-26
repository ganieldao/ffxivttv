import './App.css';
import React from 'react';
import { 
  AppBar, 
  CssBaseline, 
  Toolbar, 
  Typography 
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import StreamerTable from './components/StreamerTable';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  appBar: {
    flex: 5
  },
  container: {
    flex: 90
  },
  bottom: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar color="primary" position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h5">
            FFXIV TwitchTV Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
        <StreamerTable/>
      </div>
      <AppBar color="primary" position="static"  className={classes.bottom}>
        <Typography variant='p' align='center'>
          Might be off by a couple quests if the streamer is in cutscenes or stalling with react content
        </Typography>
      </AppBar>
    </div>
  );
}

export default App;
