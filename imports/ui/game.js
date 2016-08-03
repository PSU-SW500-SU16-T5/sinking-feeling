/** Configuration for JSHint to recognize automatic globals: */
/* globals FlowRouter, moment */

import { _ } from 'meteor/underscore';

import { Games } from '/imports/api/games.js';
import * as Game from '/imports/api/game.js';
import * as Log from '/imports/api/log.js';
import * as Ship from '/imports/api/ship.js';
import * as Square from '/imports/api/square.js';
import * as Util from '/imports/api/util.js';

import './game.html';
import './game.less';
import './board.js';
import './http404.js';

function getGame() {
  const gameID = FlowRouter.getParam('id');
  return Games.findOne({_id: gameID});
}

function getAction() {
  return FlowRouter.getQueryParam('action');
}

function getPlayerOne(game) {
  const user = Meteor.user();
  const player = Game.getUserPlayer(game, user);
  return player || 'challenger';
}

function canFire(game) {
  const user = Meteor.user();
  return Game.userCanFire(game, user);
}

Template.game.onCreated(function() {
  Session.set('move', null);
  Session.set('ship', null);
  Session.set('rotate', false);
  Session.set('alert', null);
});

Template.game.helpers({
  invalid() {
    return !getGame();
  },
  alert() {
    return Session.get('alert');
  },
  game() {
    return getGame();
  },
  showBothBoards(game) {
    if(game.state === 'active') return true;
    if(game.state === 'ended') return true;
    return false;
  },
  showPlayerBoard(game) {
    if(game.state === 'setup') return true;
    return false;
  },
  ownBoard() {
    const game = getGame();

    if(game.state === 'ended') {
      return Game.getOwnBoard(game, getPlayerOne(game));
    }

    const user = Meteor.user();
    if(!Game.userIsPlayer(game, user)) {
      const player = Game.oppositePlayer(getPlayerOne(game));
      return Game.getAttackBoard(game, player);
    }

    return Game.getOwnBoard(game, getPlayerOne(game));
  },
  attackBoard() {
    const game = getGame();

    if(game.state === 'ended') {
      const player = Game.oppositePlayer(getPlayerOne(game));
      return Game.getOwnBoard(game, player);
    }

    return Game.getAttackBoard(game, getPlayerOne(game));
  },
  setupBoard() {
    const game = Util.clone(getGame());
    const ship = Session.get('ship');

    const user = Meteor.user();
    const player = Game.getUserPlayer(game, user);
    if(ship) {
      delete game[player].ships[ship];
    }

    return Game.getOwnBoard(game, player);
  },
  title(game) {
    return Game.getTitle(game);
  },
  players(game) {
    let names = game.creator.name + " vs. " + game.challenger.name;
    if('ai' in game.challenger) {
      names += ' (AI)';
    }
    return names;
  },
  turn(game) {
    if(game.state === "active") {
      return "Move " + (game.turn_number + 1) + ": " +
        game[game.current_player].name + "'s turn.";
    }
    if(game.state === "setup") {
      if(game.creator.ready) {
        return "Waiting for " + game.challenger.name + " to finish setup.";
      } else if(game.challenger.ready) {
        return "Waiting for " + game.creator.name + " to finish setup.";
      } else {
        return "Waiting for players to finish setup.";
      }
    }
    if(game.state === 'ended') {
      let result = "Game over! The winner is: " + game[game.winner].name + "!";
      if('resignation' in game) {
        result += " (" + game[game.resignation].name + " resigned.)";
      }
      return result;
    }
    return false;
  },
});

Template.game_confirmations.helpers({
  actionRemove() {
    return getAction() === 'remove';
  },
  actionRemoveWillDelete(game) {
    const player = Game.getUserPlayer(game, Meteor.user());
    return Game.opponentRemoved(game, player);
  },
  actionRemoveWillResign(game) {
    return game.state === 'active' || game.state === 'setup';
  },
  actionResign() {
    return getAction() === 'resign';
  },
  urlSelf() {
    const id = FlowRouter.getParam('id');
    return FlowRouter.path('game', {id});
  },
});

Template.game_confirmations.events({
  'click .removeGame'() {
    const game = getGame();
    const user = Meteor.user();
    const player = Game.getUserPlayer(game, user);
    Game.remove(game, player);
    FlowRouter.go('dashboard');
  },
  'click .resignGame'() {
    const game = getGame();
    const user = Meteor.user();
    const player = Game.getUserPlayer(game, user);
    Game.resign(game, player);
    Game.checkAndUpdate(game);
    FlowRouter.go('game', {id: game._id});
  },
});

Template.game_both_boards.helpers({
  ownPlayer(game) {
    return getPlayerOne(game);
  },
  otherPlayer(game) {
    return Game.oppositePlayer(getPlayerOne(game));
  },
});

Template.game_own_board.helpers({
  ownPlayer(game) {
    return getPlayerOne(game);
  },
});

Template.game_board.helpers({
  playerName(game, player) {
    return game[player].name;
  },
  isSetup(game) {
    return game.state === 'setup';
  },
  movingShip() {
    return Session.get('ship');
  },
});

Template.sunk_ships.helpers({
  getUnsunk(sunk) {
    return _.difference(Ship.types, sunk);
  },
  getLengths(types) {
    const lens = _.map(types, (type) => ({
      type, len: Ship.lengths[type]
    }));
    lens.sort((a,b) => (a.len - b.len));
    return lens;
  },
});

Template.game_log.helpers({
  log(game) {
    return Log.getLog(game);
  },
  timestamp(entry) {
    return moment(entry.time).format("dddd, MMMM M, YYYY [at] h:kk A [UTC]Z");
  },
  format(game, entry) {
    if(entry.event === 'created') {
      return "Get ready for that Sinking Feeling!";
    }
    if(entry.event === 'started') {
      return "Game setup is complete and the game begins.";
    }
    if(entry.event === 'ended') {
      return "Game over!";
    }
    if(entry.event === 'challenger ready') {
      return game.challenger.name + " finished setup.";
    }
    if(entry.event === 'creator ready') {
      return game.creator.name + " finished setup.";
    }
    if(entry.event !== 'shot') {
      //return JSON.stringify(entry);
      return false;
    }
    let result = (entry.turn + 1) + '. ';
    result += game[entry.initiator].name + ": ";
    result += Square.squareObjToName(entry.shot) + ", ";
    result += entry.result;
    if(entry.result === 'sunk') {
      const opponent = Game.oppositePlayer(entry.initiator);
      const ship = Square.spaceShip(entry.shot, game[opponent].ships);
      result += " " + ship;
    }
    return result;
  },
});

function clickedMove(rotate) {
  const game = getGame();
  const user = Meteor.user();
  const player = Game.getUserPlayer(game, user);
  const ships = game[player].ships;
  const move = Session.get('move');
  const ship = Square.spaceShip(move, ships);
  if(!ship) throw new Meteor.Error('invalid-ship');

  Session.set('ship', ship);
  Session.set('move', null);
  Session.set('rotate', rotate);
  Session.set('alert', null);
}

Template.game_actions.events({
  'click .fireShot'(event) {
    event.preventDefault();

    const game = getGame();
    if(!canFire(game)) {
      throw new Meteor.Error('invalid-fire', 'User tried to shoot when not their turn');
    }

    const move = Session.get('move');
    if(!move) return;

    // Get shot information (TODO: Check if shot is valid!)
    Game.fire(game, move.row, move.col);
    Game.checkAndUpdate(game);

    Session.set('move', null);
  },
  'click .joinGame'(event) {
    event.preventDefault();

    const game = getGame();
    const user = Meteor.user();
    if(!Game.userCanJoin(game, user)) {
      throw new Meteor.Error('invalid-join', 'User cannot join game');
    }

    Game.joinWaiting(game, user);
    Game.checkAndUpdate(game);
  },
  'click .acceptInvite'(event) {
    event.preventDefault();
    const game = getGame();
    const user = Meteor.user();
    if(user._id === game.challenger.id) {
      Game.respondToPending(game, true);
      Game.checkAndUpdate(game);
    } else {
      throw new Meteor.Error('not-your-game');
    }
  },
  'click .declineInvite'(event) {
    event.preventDefault();
    const game = getGame();
    const user = Meteor.user();
    if(user._id === game.challenger.id) {
      Game.respondToPending(game, false);
      Game.checkAndUpdate(game);
    } else {
      throw new Meteor.Error('not-your-game');
    }
  },
  'click .MoveShip'() {
    clickedMove(false);
  },
  'click .RotateShip'() {
    clickedMove(true);
  },
  'click .ConfirmMove'() {
    const ship = Session.get('ship');
    const rotate = Session.get('rotate');
    const move = Session.get('move');

    const game = getGame();
    const user = Meteor.user();
    const player = Game.getUserPlayer(game, user);

    let vertical = game[player].ships[ship].vertical;
    if(rotate) vertical = !vertical;

    try {
      Ship.place(ship, move.row, move.col, vertical, game[player].ships);
      Game.update(game);
    } catch(e) {
      Session.set('alert', e);
    }

    Session.set('ship', null);
    Session.set('move', null);
  },
  'click .StartGame'() {
    const game = getGame();
    const user = Meteor.user();
    const player = Game.getUserPlayer(game, user);

    game[player].ready = true;
    Game.checkAndUpdate(game);
  },
});

Template.game_actions.helpers({
  canFire(game) {
    return canFire(game);
  },
  canResign(game) {
    const user = Meteor.user();
    if(!Game.userIsPlayer(game, user)) return false;
    return game.state === 'active' && getAction() !== 'resign';
  },
  waiting(game) {
    return game.state === 'waiting';
  },
  pending(game) {
    return game.state === 'pending';
  },
  canSetup(game) {
    const user = Meteor.user();
    return Game.userCanSetup(game, user);
  },
  canJoin(game) {
    const user = Meteor.user();
    return Game.userCanJoin(game, user);
  },
  amInviter(game) {
    const user = Meteor.user();
    if(!user) return false;
    return game.creator.id === user._id;
  },
  amInvitee(game) {
    const user = Meteor.user();
    if(!user) return false;
    return game.challenger.id === user._id;
  },
  notMyGame(game) {
    const user = Meteor.user();
    return !Game.userIsPlayer(game, user);
  },
  ended(game) {
    return game.state === 'ended';
  },
  move() {
    const move = Session.get('move');
    if(!move) return "";
    return Square.squareObjToName(move);
  },
  fireDisabled() {
    const move = Session.get('move');
    return move ? "" : "disabled";
  },
  moveDisabled() {
    const ship = Session.get('ship');
    const move = Session.get('move');
    return (move && !ship) ? "" : "disabled";
  },
  confirmDisabled() {
    const ship = Session.get('ship');
    const move = Session.get('move');
    return (ship && move) ? "" : "disabled";
  },
  urlResign(game) {
    return FlowRouter.path('game', {id: game._id}, {action: 'resign'});
  },
});
