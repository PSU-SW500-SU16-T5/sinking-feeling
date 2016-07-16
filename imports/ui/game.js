/** Configuration for JSHint to recognize automatic globals: */
/* globals FlowRouter, moment */

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

function getPlayerOne(game) {
  const user = Meteor.user();
  const player = Game.getUserPlayer(game, user);
  return player || 'creator';
}

function canFire(game) {
  const user = Meteor.user();
  return Game.userCanFire(game, user);
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
    return Game.getOwnBoard(game, getPlayerOne(game));
  },
  attackBoard() {
    const game = getGame();
    return Game.getAttackBoard(game, getPlayerOne(game));
  },
});

Template.game_actions.events({
  'click .fireShot'(event) {
    event.preventDefault();

    const game = getGame();
    if(!canFire(game)) {
      throw new Meteor.Error('invalid-fire', 'User tried to shoot when not their turn');
    }

    const selection = $('#selection').val();

    if (selection.length === 2)
    {
      const row = parseInt(selection.slice(1, 2), 10);
      const col = convertToIndex(selection.slice(0, 1));

      console.log(game.current_player + " taking shot.\nAttempting to hit position: " + selection);

      // Get shot information (TODO: Check if shot is valid!)
      Game.fire(game, row, col);
      Game.checkState(game);
      Game.update(game);

      $('#selection').val("");
    }
  }
});

Template.game_actions.helpers({
  canFire() {
    const game = getGame();
    return canFire(game);
  },
  ended() {
    const game = getGame();
    return game.state === 'ended';
  },
});

Template.game_meta_data.helpers({
  ownName() {
    const game = getGame();
    const player = getPlayerOne(game);
    return game[player].name;
  },
  opponentName() {
    const game = getGame();
    const player = Game.oppositeUser(getPlayerOne(game));
    return game[player].name;
  },
  turnName() {
    const game = getGame();
    return game[game.current_player].name;
  }
});

Template.game_boards.helpers({
  ownPlayer() {
    const game = getGame();
    return getPlayerOne(game);
  },
  otherPlayer() {
    const game = getGame();
    return Game.oppositeUser(getPlayerOne(game));
  },
});

Template.game_meta_foot.helpers({
  dateFormat(ts) {
    return moment(ts).format("dddd, MMMM M, YYYY [at] h:kk A [UTC]Z");
  },
  winner() {
    return this.game[this.game.winner].name;
  },
});

function convertToIndex(val) {
  return 'ABCDEFGHIJ'.indexOf(val);
}
