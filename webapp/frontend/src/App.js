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
    flex: 95
  }
}));

function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar color="primary" position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6">
            FFXIV TwitchTV Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
        <StreamerTable/>
      </div>
    </div>
  );
}

export default App;
