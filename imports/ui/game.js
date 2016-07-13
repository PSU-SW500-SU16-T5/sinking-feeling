/** Configuration for JSHint to recognize automatic globals: */
/* globals FlowRouter */

import { Games } from '../api/games.js';
import * as Game from '../api/game.js';
import { $ } from 'meteor/jquery';

import './game.html';
import './game.less';
import './board.js';

function getGame() {
  const gameID = FlowRouter.getParam('id');
  return Games.findOne({_id: gameID});
}

function getPlayer(game) {
  const user = Meteor.user();
  if (user._id === game.creator.id) {
    return 'creator';
  }
  if (user._id === game.challenger.id) {
    return 'challenger';
  }
  // TODO: Must be a guest, default to creator for now. Do we even want guests
  // to view the board?
  return 'creator';
}

Template.game.helpers({
  invalid() {
    return !getGame();
  },
  game() {
    return getGame();
  },
  ownBoard() {
    const game = getGame();
    return Game.getOwnBoard(game, getPlayer(game));
  },
  attackBoard() {
    const game = getGame();
    return Game.getAttackBoard(game, getPlayer(game));
  },
});

Template.game.events({
  'submit form'(event) {
    event.preventDefault();

    const game = getGame();
    const selection = event.target.elements.selection.value;

    if (selection.length === 2) {
      const row = parseInt(selection.slice(1, 2), 10);
      const col = convertToIndex(selection.slice(0, 1));

      // Get shot information (TODO: Check if shot is valid!)
      Game.fire(game, row, col);
      Game.checkState(game);
      Game.update(game);

      $('#selection').val("");
    }
  }
});

Template.game_meta_data.helpers({
  ownName() {
    const game = getGame();
    const player = getPlayer(game);
    return game[player].name;
  },
  opponentName() {
    const game = getGame();
    const player = Game.oppositeUser(getPlayer(game));
    return game[player].name;
  },
});

Template.game_boards.helpers({
  ownPlayer() {
    const game = getGame();
    return getPlayer(game);
  },
  otherPlayer() {
    const game = getGame();
    return Game.oppositeUser(getPlayer(game));
  },
});

function convertToIndex(val) {
  return 'ABCDEFGHIJ'.indexOf(val);
}
