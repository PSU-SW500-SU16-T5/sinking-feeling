import {_} from 'meteor/underscore';

import * as Ralph from './ralph.js';

export const name = 'chad';
export const full_name = 'Cheating Chad';
export const difficulty = 100;
export const difficulty_name = "Impossible";
export const description = "What's Chad's secret to success? It's simple: he " +
"cheats!";

export function firstShipMove(board, moves) {
  const squares = board.squares;
  const move = _.find(moves, (move) => {
    return (
      'ship' in squares[move.row][move.col] &&
      squares[move.row][move.col].state === "E"
    );
  });
  if(move === undefined) {
    return Ralph.firstValidMove(board, moves);
  }
  return move;
}

export function makeMove(board) {
  return firstShipMove(board, Ralph.allMoves());
}