/**
 * Utility code for working with boards.
 */

import { _ } from 'meteor/underscore';
import * as Ship from './ship.js';
import * as Square from './square.js';

/**
 * makeBoard()
 * Returns a game board initialized with all cells empty.
 */
export function makeEmptyBoard() {
  return _.times(10, function() {
    return _.times(10, function() {
       return {state: 'E'};
    });
  });
}

/**
 * setRange(board, row, col, rowCount, colCount, field, val)
 * Updates a game board to set a rectangular region's cell's specified field to
 * have the given value.
 */
export function setRange(board, row, col, rowCount, colCount, field, value) {
  let r, c;
  for(r = row; r < row + rowCount; r++) {
    for(c = col; c < col + colCount; c++) {
      board[r][c][field] = value;
    }
  }
}

export function addShips(board, ships, mark) {
  for(let j = 0; j < Ship.types.length; j++) {
    const type = Ship.types[j];
    if(!(type in ships)) continue;

    const ship = ships[type];
    const row = ship.row;
    const col = ship.col;
    const len = Ship.lengths[type];

    if(ship.vertical) {
      if(mark) {
        setRange(board, row, col, len, 1, 'state', 'S');
      }
      board[row][col].ship = 'Top';
      if(len > 2) {
        setRange(board, row+1, col, len-2, 1, 'ship', 'Vertical');
      }
      board[row+len-1][col].ship = 'Bottom';
    } else {
      if(mark) {
        setRange(board, row, col, 1, len, 'state', 'S');
      }
      board[row][col].ship = 'Left';
      if(len > 2) {
        setRange(board, row, col+1, 1, len-2, 'ship', 'Horizontal');
      }
      board[row][col+len-1].ship = 'Right';
    }
  }
}

export function addShots(board, shots, ships) {
  shots.forEach(function(shot){
    if(Square.spaceIsOnShip(shot, ships))
    {
      board[shot.row][shot.col].state = 'H';
    }
    else
    {
      board[shot.row][shot.col].state = 'M';
    }
  });
}

/**
 * Checks each ship to see if all squares are marked as sunk. If so, the ship
 * gets marked as sunk.
 *
 * Also returns a list of all ships that were sunk.
 */
export function checkSunk(board, ships) {
  const sunk_ships = [];

  const notHit = (board, ship, offset) => {
    if(ship.vertical) {
      if(board[ship.row+offset][ship.col].state !== 'H') {
        return true;
      }
    } else {
      if(board[ship.row][ship.col+offset].state !== 'H') {
        return true;
      }
    }
    return false;
  };

  for(let j = 0; j < Ship.types.length; j++) {
    const type = Ship.types[j];
    if(!(type in ships)) continue;

    const ship = ships[type];
    const len = Ship.lengths[type];

    let sunk = true;
    for(let i = 0; i < len; i++) {
      if(notHit(board, ship, i)) {
        sunk = false;
        break;
      }
    }

    if(sunk) {
      sunk_ships.push(type);
      if(ship.vertical) {
        setRange(board, ship.row, ship.col, len, 1, 'state', 'X');
      } else {
        setRange(board, ship.row, ship.col, 1, len, 'state', 'X');
      }
    }
  }

  return sunk_ships;
}