import {_} from 'meteor/underscore';

export const name = 'ralph';
export const full_name = 'Random Ralph';

// eslint-disable-next-line no-unused-vars
export function makeMove(board, state) {
  let row, col;
  let squares = [];
  for (row = 0; row < 10; row++) {
    for (col = 0; col < 10; col++) {
      squares.push([row, col]);
    }
  }
  squares = _.shuffle(squares);

  for(let square of squares) {
    const row = square[0];
    const col = square[1];
    if (board[row][col].state == "E") return {row: row, col: col};
  }

  throw new Meteor.Error('no-moves-left', 'No more moves are possible');
}