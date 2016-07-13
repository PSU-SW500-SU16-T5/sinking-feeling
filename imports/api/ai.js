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

// Manually map each AI player with its name
const ai_players = {
  'sue': AI_Sue,
  'ralph': AI_Ralph,
};

/**
 * Name of the AI player to use as fallback when an unknown name is provided.
 * @const {string}
 * @default
 */
export const default_name = 'sue';

/**
 * Retrieve AI player symbolic names.
 * @returns {string[]} Array of AI player names, in an arbitrary order.
 */
export function getNames() {
  return Object.keys(ai_players);
}

/**
 * Return the move that the AI would like to make next.
 * @callback AIPlayer_makeMove
 * @see {@link AIPlayer}
 *
 * @param {Object[][]} board - Two-dimensional array representing the board.
 * @param {string} board[][].state - State value for a board square.
 * @param {Object} state - Opaque internal state maintained by AI.
 *
 * @returns {number[]} Two-element array representing [row,col] of move.
 *
 * @throws {Meteor.error} No more moves are possible
 */

/**
 * Object representing an AI player.
 * @typedef AIPlayer
 * @type Object
 * @property {string} name - Symbolic name of the AI player.
 * @property {string} full_name - User-friendly name of AI player.
 * @property {AIPlayer_makeMove} makeMove - Makes a move for the AI player.
 */

/**
 * Return the AI player associated with the given symbolic name.
 *
 * If the name is not recognized, the default AI player is returned instead.
 *
 * @param {string} name - Symbolic name of an AI player.
 * @returns {AIPlayer} AI player object.
 */
export function getPlayer(name) {
  name = name.toLowerCase();
  if (!(name in ai_players)) {
    name = default_name;
  }
  return ai_players[name];
}
