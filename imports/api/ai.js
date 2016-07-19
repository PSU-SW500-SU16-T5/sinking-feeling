/**
 * This module provides the entry point to the AI players.
 *
 * Code that wants to use AI functionality should access it through this
 * module. The individual AI players should not be accessed directly (except by
 * tests).
 */

// Import all of the AI players
import * as AI_Sue from './ai/sue.js';
import * as AI_Ralph from './ai/ralph.js';
import * as AI_Jack from './ai/jack.js';
import * as AI_Paul from './ai/paul.js';
import * as AI_Pat from './ai/pat.js';
import * as AI_Felicity from './ai/felicity.js';
import * as AI_Chad from './ai/chad.js';

// Manually map each AI player with its name
const ai_players = {
  'sue': AI_Sue,
  'ralph': AI_Ralph,
  'jack': AI_Jack,
  'paul': AI_Paul,
  'pat': AI_Pat,
  'felicity': AI_Felicity,
  'chad': AI_Chad,
};

export const default_name = 'sue';

export function getNames() {
  return Object.keys(ai_players);
}

export function getPlayer(name) {
  name = name.toLowerCase();
  if (!(name in ai_players)) {
    name = default_name;
  }

  // Instead of returning the player as-is, construct a new object with just
  // the fields we want to expose. This also prevents the user from
  // inadvertently changing the stored data.
  const player = ai_players[name];

  name = player.name;
  const full_name = player.full_name;
  const difficulty = player.difficulty;
  const difficulty_name = player.difficulty_name;
  const description = player.description;
  const makeMove = player.makeMove;

  return {name, full_name, difficulty, difficulty_name, description, makeMove};
}

export function getPlayers(field='full_name', descending=true) {
  const names = getNames();
  const players = [];
  for(let name in names) {
    players.push(getPlayer(name));
  }

  let cmp;
  if(descending) {
    cmp = (a, b) => {
      if(a === b) return 0;
      return (b < a) ? -1 : 1;
    };
  } else {
    cmp = (a, b) => {
      if(a === b) return 0;
      return (a < b) ? -1 : 1;
    };
  }

  players.sort((a, b) => (cmp(a[field], b[field])));
  return players;
}