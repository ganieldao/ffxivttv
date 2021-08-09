import './App.css';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import arr from './assets/images/arr.png';
import heavensward from './assets/images/heavensward.png';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(streamer, questline, quest, lastChecked, backgroundImage) {
  return { streamer, questline, quest, lastChecked, backgroundImage };
}

const rows = [
  createData('Asmongold', 'Patch 3.1 (As Goes Light, So Goes Darkness)', 'As Goes Light, So Goes Darkness', '08-08-2021', heavensward),
  createData('Asmongold', 'Heavensward Main Scenario', 'asdf', 'asdf', 'asdf'),
  createData('Asmongold', 'Heavensward Main Scenario', 'asdf', 'asdf', 'asdf'),
  createData('Asmongold', 'Heavensward Main Scenario', 'asdf', 'asdf', 'asdf')
];


function App() {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Streamer</TableCell>
            <TableCell>Quest</TableCell>
            <TableCell>Quest-line</TableCell>
            <TableCell>Last Checked</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.streamer}
              </TableCell>
              <TableCell>{row.quest}</TableCell>
              <TableCell><img src={row.backgroundImage} style={{width: '100px', verticalAlign: 'middle'}} />{row.questline}</TableCell>
              <TableCell>{row.lastChecked}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default App;
