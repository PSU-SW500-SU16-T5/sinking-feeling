import {_} from 'meteor/underscore';

import * as Ralph from './ralph.js';

export const name = 'jack';
export const full_name = 'Geometric Jack';
export const difficulty = 2;
export const difficulty_name = "Easy";
export const description = "Geometric Jack is a fairly easy player to beat. " +
"Like Ralph, he starts out firing at random. However, after hitting a ship, " +
"he focuses his shots on the surrounding area until he's convinced there's " +
"nothing left to sink there. Unfortunately, he's a bit overzealous and tends " +
"to waste time clearing around a ship even after it's been sunk.";

export function addOpenNeighbors(targets, squares, row, col) {
  if(row > 0 && squares[row-1][col].state === 'E') {
    targets.push({row: row-1, col: col});
  }
  if(col > 0 && squares[row][col-1].state === 'E') {
    targets.push({row: row, col: col-1});
  }
  if(row < 9 && squares[row+1][col].state === 'E') {
    targets.push({row: row+1, col: col});
  }
  if(col < 9 && squares[row][col+1].state === 'E') {
    targets.push({row: row, col: col+1});
  }
}

export function checkMove(squares, state, move) {
  // Peek at move to see if state needs to change
  // If we hit a ship, switch to target mode
  if('ship' in squares[move.row][move.col]) {
    state.mode = 'target';
    addOpenNeighbors(state.targets, squares, move.row, move.col);
  }
}

export function initState(state) {
  if(!('mode' in state)) {
    state.mode = 'hunt';
  }
  if(!('targets' in state)) {
    state.targets = [];
  }
}

export function checkState(state) {
  if(state.targets.length === 0) {
    state.mode = 'hunt';
  }
}

export function hunt(board, state) {
  const move = Ralph.makeMove(board, {});
  checkMove(board.squares, state, move);
  return move;
}

export function target(board, state) {
  // Randomly select a target from the list, to avoid having a set pattern
  const idx = _.random(state.targets.length-1);
  const move = state.targets[idx];
  state.targets.splice(idx, 1);

  checkMove(board.squares, state, move);
  return move;
}

export function makeMove(board, state) {
  initState(state);
  checkState(state);

  if(state.mode === 'hunt') {
    return hunt(board, state);
  } else {
    return target(board, state);
  }
}