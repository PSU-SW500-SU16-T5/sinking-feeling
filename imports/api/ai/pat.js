import {_} from 'meteor/underscore';

import * as AI from '../ai.js';
import * as Ship from '../ship.js';

import * as Ralph from './ralph.js';
import * as Jack from './jack.js';
import * as Paul from './paul.js';

export const name = 'pat';
export const full_name = 'Partitioning Pat';
export const difficulty = 4;
export const difficulty_name = "Moderate";
export const description = "Partitioning Pat is smart enough to take the " +
"lengths of ships into consideration. She starts out by partitioning the " +
"board with her shots to catch the ships with length 4 or more (the carrier " +
"and the battleship). Once they're out of the way, she fills the remaining " +
"space in a checkerboard pattern. Her behavior upon hitting a ship is the " +
"same as Jack's: she focuses on clearing around the ship until she's certain " +
"nothing is left in that area.";

// Return the length of the longest unsunk ship
export function largestUnsunkShip(sunk) {
  const unsunk = _.difference(Ship.types, sunk);
  const lengths = _.map(unsunk, (type) => (Ship.lengths[type]));
  return _.max(lengths);
}

// Return the largest power of two <= val
export function largestTwoPower(val) {
  return Math.pow(2, Math.floor(Math.log(val)/Math.LN2));
}

export function hunt(board, state) {
  const mod = largestTwoPower(largestUnsunkShip(board.sunk));
  const moves = _.filter(
    Ralph.allMoves(),
    (m) => Paul.checkParity(m, state.shift, mod));
  const move = Paul.firstValidMove(board, moves, state);
  Jack.checkMove(board.squares, state, move);
  return move;
}

export function target(board, state) {
  return Jack.target(board, state);
}

export function initState(state, ai) {
  if(!('shift' in state)) {
    state.shift = _.random(0, 3);
  }
  Paul.initState(state, ai);
}

export function makeMove(board, state) {
  initState(state, 'paul');
  if(state.ai !== 'paul') {
    const ai = AI.getPlayer(state.ai);
    return ai.makeMove(board, state);
  }
  Jack.checkState(state);

  if(state.mode === 'hunt') {
    return hunt(board, state);
  } else {
    return target(board, state);
  }
}