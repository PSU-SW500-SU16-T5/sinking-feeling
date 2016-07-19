import { Meteor } from 'meteor/meteor';

export const name = 'sue';
export const full_name = 'Sequential Sue';
export const difficulty = 0;
export const difficulty_name = "Trivial";
export const description = "Sequential Sue is a trivially easy player to " +
"beat: she makes her turns in a predicatable sequence, starting at the top " +
"right corner of the board.";

export function makeMove(board) {
  const squares = board.squares;
  let row = 0;
  let col = 0;
  // Look for the first empty square in row-column order
  for (row = 0; row < squares.length; row++) {
    for (col = 0; col < squares[row].length; col++) {
      if (squares[row][col].state === "E") return {row: row, col: col};
    }
  }
  throw new Meteor.Error('no-moves-left', 'No more moves are possible');
}