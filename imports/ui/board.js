/** Configuration for JSHint to recognize automatic globals: */

import * as Game from '/imports/api/game.js';
import * as Square from '/imports/api/square.js';

import './board.html';
import './board.less';

function isSelected(row, col) {
  let move = Session.get('move');
  if(!move) return false;
  return move.row === row && move.col === col;
}

Template.board_row.helpers({
  rowName(row) {
    return 'ABCDEFGHIJ'[row];
  },
});

Template.board_cell.helpers({
  classes(game, row, col, square, own) {
    const user = Meteor.user();
    let list = "cell-" + square.state;
    if(square.state === "S") {
      list += " cell-S-" + square.ship;
    }
    if(Game.userCanFire(game, user) && !own) {
      if(square.state === "E") {
        list += " clickable";
      }
      if(isSelected(row, col)) {
        list += " selected";
      }
    }
    return list;
  },
  cell() {
    return Square.squareObjToName(this);
  },
});

Template.board_cell.events({
  "click .clickable.cell"(event) {
    const target = event.currentTarget;
    const move = Square.squareNameToObj(target.dataset.cell);
    Session.set('move', move);
  }
});