/**
 * Utility code for board squares.
 */

import * as Ship from './ship.js';

export function spaceShip(space, ships) {
  for(let type in ships) {
    if(spaceIsOnAShip(space, ships[type], Ship.lengths[type])) {
      return type;
    }
  }
  return false;
}

// only exported for testing, don't call this
export function spaceIsOnShip(space, ships) {
  for(let type in ships) {
    if(spaceIsOnAShip(space, ships[type], Ship.lengths[type])) {
      return true;
    }
  }
  return false;
}

export function spaceIsOnAShip(space, ship, length) {
  for(let i = 0; i < length; i++) {
    const ship_space = { row: ship.row, col: ship.col };
    if(ship.vertical) {
      ship_space.row += i;
    } else {
      ship_space.col += i;
    }
    if(spacesAreSame(space, ship_space)) {
      return true;
    }
  }
  return false;
}

// only exported for testing, don't call this
export function spacesAreSame(space1, space2) {
  return (space1.row === space2.row) && (space1.col === space2.col);
}

export function squareObjToName(obj) {
  const row = 'ABCDEFGHIJ'[obj.row];
  const col = obj.col + 1;
  return row + col;
}

export function squareNameToObj(name) {
  const row = 'ABCDEFGHIJ'.indexOf(name[0]);
  const col = parseInt(name.substring(1), 10) - 1;
  return {row, col};
}
