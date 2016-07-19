import {_} from 'meteor/underscore';

export const name = 'ralph';
export const full_name = 'Random Ralph';
export const difficulty = 1;
export const difficulty_name = "Easy";
export const description = "Random Ralph is an easy player to beat: he " +
"selects squares to target at random. Even if he hits a ship, he'll continue " +
"to fire randomly.";

/* Converts an integer in the range 0 to 99 to a move: {row: <val>, col: <val>}
 * Each integer uniquely identifies a move
 */
export function intToMove(val) {
  return {row: Math.floor(val/10), col: (val%10)};
}

/* Converts a list of integers into a shuffled list of moves */
export function shuffleIntToMoves(vals) {
  return _.shuffle(_.map(vals, intToMove));
}

/* Returns the first valid move, or undefined if none found */
export function firstValidMove(board, moves) {
  const squares = board.squares;
  const move = _.find(moves, (move) => {
    return squares[move.row][move.col].state === "E";
  });
  if(move === undefined) {
    throw new Meteor.Error('no-moves-left', 'No more moves are possible');
  }
  return move;
}

export function allMoves() {
  return shuffleIntToMoves(_.range(0,100));
}

export function makeMove(board) {
  return firstValidMove(board, allMoves());
}