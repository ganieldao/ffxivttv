import './App.css';
import React from 'react';
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import StreamerTable from './components/StreamerTable';

function App() {
  return (
    <div className="App">
      <AppBar color="primary" position="static">
        <Toolbar>
          <Typography variant="h6">
            FFXIV TwitchTV Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      <StreamerTable/>
    </div>
  );
}

export default App;
