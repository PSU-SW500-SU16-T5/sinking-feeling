import {_} from 'meteor/underscore';

import * as AI from '../ai.js';
import * as Ship from '../ship.js';
import * as Jack from './jack.js';
import * as Pat from './pat.js';

export const name = 'felicity';
export const full_name = 'Focused Felicity';
export const difficulty = 5;
export const difficulty_name = "Hard";
export const description = "Focused Felicity is a challenging AI who is " +
"focused on winning. She starts out selecting squares at random much like " +
"Partioning Pat does (forming a pattern based on the lengths of the " +
"remaining ships). However, she's much smarter in how she responds to hit " +
"ships: she targets based on the arrangement of the hits and misses, and she " +
"stops focusing on the area once all hit ships are sunk.";

export function hunt(board, state) {
  return Pat.hunt(board, state);
}

export function smallestUnsunkShip(sunk) {
  const unsunk = _.difference(Ship.types, sunk);
  const lengths = _.map(unsunk, (type) => (Ship.lengths[type]));
  return _.min(lengths);
}

export function checkDirPriority(smallest, lookup, focal) {
  let hits = 1, full = 1, i = focal - 1;
  while(i >= 0 && lookup(i) === "A") {
    hits++;
    full++;
    i--;
  }
  while(i >= 0 && _.contains(["A","O"], lookup(i))) {
    full++;
    i--;
  }
  i = focal + 1;
  while(i < 10 && lookup(i) === "A") {
    hits++;
    full++;
    i++;
  }
  while(i < 10 && _.contains(["A","O"], lookup(i))) {
    full++;
    i++;
  }

  if(hits >= smallest) {
    if(hits > 2) {
      return 3;
    } else {
      return 1;
    }
  }

  if(full >= smallest) {
    if(hits > 2) {
      return 2;
    } else {
      return 1;
    }
  }

  return 0;
}

export function checkPriority(smallest, work, row, col) {
  if(work[row][col] !== "O") return 0;

  let priority = 0;

  let vert = false, horz = false;
  if(row > 0 && work[row-1][col] === "A") vert = true;
  if(row < 9 && work[row+1][col] === "A") vert = true;
  if(col > 0 && work[row][col-1] === "A") horz = true;
  if(col < 9 && work[row][col+1] === "A") horz = true;

  if(vert) {
    const lookup = (i) => (work[i][col]);
    priority = checkDirPriority(smallest, lookup, row);
  }
  if(horz) {
    const lookup = (i) => (work[row][i]);
    priority = Math.max(priority, checkDirPriority(smallest, lookup, col));
  }

  return priority;
}

export function mapStates(squares) {
  const mapping = {
    H: "A", // Hits are "Active": they're what we're interested in extending
    E: "O", // Empty squares are "Open": we can maybe extend into them
    X: "C", // Sunk and Miss squares are "Closed": we can't extend into them
    M: "C",
  };

  return _.map(squares, (row) => {
    return _.map(row, (cell) => {
      return mapping[cell.state];
    });
  });
}

export function target(board, state) {
  // Map squares into the Felicity's states
  const work = mapStates(board.squares);

  const smallest = smallestUnsunkShip(board.sunk);

  // Squares will be sorted into one of four priorities
  const targets = [
    [], // priority 0 = not interested
    [], // priority 1 = low interest, would only result in 2-in-a-row
    [], // priority 2 = moderate interest, would result in more than 2-in-a-row
    [], // priority 3 = high interest, would result in >= shortest ship left
  ];

  // Calculate priority for each square and assign to targets bin
  let priority;
  for(let row = 0; row < work.length; row++) {
    for(let col = 0; col < work[row].length; col++) {
      priority = checkPriority(smallest, work, row, col);
      targets[priority].push({row: row, col: col});
    }
  }

  // Find the highest priority that has targets
  priority = 3;
  while(priority > 0 && targets[priority].length === 0) priority--;

  if(priority === 0) {
    // This shouldn't happen!!! Fall back to hunting for now...
    return hunt(board, state);
  } else {
    // Pick a target at random
    return _.sample(targets[priority]);
  }
}

export function anyHits(squares) {
  for(let row = 0; row < 10; row++) {
    for(let col = 0; col < 10; col++) {
      if(squares[row][col].state === "H") return true;
    }
  }
  return false;
}

export function initState(state, ai) {
  Pat.initState(state, ai);
}

export function makeMove(board, state) {
  initState(state, 'felicity');
  if(state.ai !== 'felicity') {
    const ai = AI.getPlayer(state.ai);
    return ai.makeMove(board, state);
  }
  Jack.checkState(state);

  if(anyHits(board.squares)) {
    return target(board, state);
  } else {
    return hunt(board, state);
  }
}