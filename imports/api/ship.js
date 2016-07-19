import { _ } from 'meteor/underscore';

import * as Square from './square.js';
import * as Util from './util.js';

export const lengths = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};
export const types = Object.keys(lengths);

export function create() {
  const ships = {};
  place("carrier", 0, 0, true, ships);
  place("battleship", 0, 1, true, ships);
  place("cruiser", 0, 2, true, ships);
  place("submarine", 0, 3, true, ships);
  place("destroyer", 0, 4, true, ships);
  return ships;
}

export function overlap(ship, row, col, vertical, ships) {
  for(let i = 0; i < lengths[ship]; i++) {
    let ship_space = {row, col};
    if(vertical) {
      ship_space.row += i;
    } else {
      ship_space.col += i;
    }
    if(Square.spaceIsOnShip(ship_space, ships)) {
      return true;
    }
  }
  return false;
}

export function checkOverlap(ship_type, row, col, vertical, positions) {
  if(positions[ship_type]) {
    // This is moving a ship, we don't want to include the pre-move ship in the
    // overlap test. This makes a copy that we can remove it from.
    positions = Util.clone(positions);
    delete positions[ship_type];
  }
  if(overlap(ship_type, row, col, vertical, positions)) {
    throw 'Ships Overlapping';
  }
}

export function place(ship_type, row, col, vertical, positions) {
  checkOverlap(ship_type, row, col, vertical, positions);

  if(!positions[ship_type]) {
    positions[ship_type] = {};
  }
  if(types.indexOf(ship_type) < 0) {
    throw 'Unrecognised ship type';
  }

  positions[ship_type].row = row;
  positions[ship_type].col = col;
  positions[ship_type].vertical = vertical;
}

export function randomize(ships) {
  const makePossibilities = function (length) {
    let i, j;
    const result = [];
    for (i = 0; i < 10; i++) {
      for (j = 0; j < 10 - length; j++) {
        result.push([i, j, false]);
        result.push([j, i, true]);
      }
    }
    return result;
  };
  types.forEach(type => {
    const possibs = _.shuffle(makePossibilities(lengths[type]));
    _.some(possibs, possib => {
      try {
        place(type, possib[0], possib[1], possib[2], ships);
        return true;
      } catch(e) {
        return false;
      }
    });
  });
}
