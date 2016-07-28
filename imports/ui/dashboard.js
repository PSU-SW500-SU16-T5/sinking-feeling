import { Template } from 'meteor/templating';
import { Games } from '/imports/api/games.js';
import * as Game from '/imports/api/game.js';

import './dashboard.html';
import './dashboard.less';
import './listing.js';

Template.dashboard.helpers({
  allGames() {
    const id = Meteor.userId();
    if(!id) return [];
    return Games.find({
      $or: [
        {
          'creator.id': id,
          'creator.remove': { $exists: false },
        },
        {
          'challenger.id': id,
          'challenger.remove': { $exists: false },
        },
      ],
    });
  },
  invited() {
    const id = Meteor.userId();
    if(!id) return [];
    return Games.find({
      state: 'pending',
      'challenger.id': Meteor.userId(),
      'challenger.remove': { $exists: false },
    });
  },
  active() {
    const id = Meteor.userId();
    if(!id) return [];
    return Games.find({
      $or: [
        {
          'state': 'setup',
          'creator.id': id,
          'creator.remove': { $exists: false },
          'creator.ready': false,
        },
        {
          'state': 'setup',
          'challenger.id': id,
          'challenger.remove': { $exists: false },
          'challenger.ready': false,
        },
        {
          'state': 'active',
          'creator.id': id,
          'creator.remove': { $exists: false },
          'current_player': 'creator',
        },
        {
          'state': 'active',
          'challenger.id': id,
          'challenger.remove': { $exists: false },
          'current_player': 'challenger',
        },
      ],
    });
  },
  waiting() {
    const id = Meteor.userId();
    if(!id) return [];
    return Games.find({
      $or: [
        {
          'state': 'setup',
          'creator.id': id,
          'creator.remove': { $exists: false },
          'creator.ready': true,
        },
        {
          'state': 'setup',
          'challenger.id': id,
          'challenger.remove': { $exists: false },
          'challenger.ready': true,
        },
        {
          'state': 'active',
          'creator.id': id,
          'creator.remove': { $exists: false },
          'current_player': 'challenger',
        },
        {
          'state': 'active',
          'challenger.id': id,
          'challenger.remove': { $exists: false },
          'current_player': 'creator',
        },
        {
          'state': { $in: ['waiting', 'pending'] },
          'creator.id': id,
          'creator.remove': { $exists: false },
        }
      ],
    });
  },
  done() {
    const id = Meteor.userId();
    if(!id) return [];
    return Games.find({
      'state': { $in: ['declined', 'ended'] },
      $or: [
        {
          'creator.id': id,
          'creator.remove': { $exists: false },
        },
        {
          'challenger.id': id,
          'challenger.remove': { $exists: false },
        },
      ],
    });
  },
});

Template.dash_invited.helpers({
  title(game) {
    return Game.getTitle(game);
  },
  players(game) {
    return "Invited by " + game.creator.name;
  },
});

Template.dash_active.helpers({
  title(game) {
    return Game.getTitle(game);
  },
  players(game) {
    return game.creator.name + " vs. " + game.challenger.name;
  },
});

Template.dash_waiting.helpers({
  title(game) {
    return Game.getTitle(game);
  },
  players(game) {
    switch(game.state) {
      case 'waiting':
        return "Waiting on player to join";
      case 'pending':
        return "You are waiting on " + game.challenger.name;
      default:
        return game.creator.name + " vs. " + game.challenger.name;
    }
  },
});

Template.dash_done.helpers({
  title(game) {
    return Game.getTitle(game);
  },
  players(game) {
    const player = Game.getUserPlayer(game, Meteor.user());
    /* jshint -W086 */
    switch(game.state) {
      case 'declined':
        if(player === 'creator') {
          return game.challenger.name + " declined your invitation";
        } else {
          return "You declined " + game.creator.name + "'s invitation";
        }
      default:
        return game.creator.name + " vs. " + game.challenger.name;
    }
    /* jshint +W086 */
  },
});

