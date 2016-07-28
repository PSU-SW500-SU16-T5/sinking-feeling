/* globals FlowRouter */
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import * as AI from '../api/ai.js';
import * as Game from '../api/game.js';

import './create.html';

function checkSubmit() {
  const first = Session.get('first_player');
  const type = Session.get('opponent_type');
  const user = Meteor.user();

  if(!user) {
    return "User not logged in";
  }

  if(!first) {
    return "Need to select first player";
  }

  if(type === 'waiting') {
    return false;
  }

  if(type === 'ai') {
    const player = Session.get('selected_ai');
    if(player) {
      return false;
    } else {
      return "No opponent is selected";
    }
  }

  if(type === 'invite') {
    const id = Session.get('selected_user');
    if(id) {
      const user = Meteor.users.findOne({ '_id': id });
      if(user) {
        return false;
      } else {
        return "Opponent selected was not found";
      }
    } else {
      return "No opponent is selected";
    }
  }

  return "Invalid opponent type: " + type;
}

Template.create_game.onCreated(function() {
  Session.set('first_player', 'random');
  Session.set('opponent_type', null);
  Session.set('selected_ai', AI.default_name);
  Session.set('selected_user', null);
});

Template.create_game.helpers({
  showAi() {
    return Session.get('opponent_type') === 'ai';
  },
  showPlayers() {
    return Session.get('opponent_type') === 'invite';
  },
  submitDisabled() {
    const fail = checkSubmit();
    return fail ? "disabled" : "";
  },
});

Template.create_game.events({
  'change input[name=first-player]'(event) {
    const first = event.target.value;
    Session.set('first_player', first);
  },
  'change input[name=opponent-type]'(event) {
    const type = event.target.value;
    Session.set('opponent_type', type);
  },
  'click #createGame'() {
    const fail = checkSubmit();
    if(fail) throw new Meteor.error('cannot-submit', fail);

    const user = Meteor.user();
    const first = Session.get('first_player');
    const type = Session.get('opponent_type');
    const title = $("#game-title")[0].value;

    const game = Game.create(user, first, title);

    if(type === 'ai') {
      const player = Session.get('selected_ai');
      Game.initVsAi(game, player);
    } else if(type === 'invite') {
      const id = Session.get('selected_user');
      const user = Meteor.users.findOne({ '_id': id });
      Game.initToPending(game, user);
    } else {
      Game.initToWaiting(game);
    }

    FlowRouter.go('game', { id: game._id });
  },
});

Template.create_game_ai.onCreated(function() {
  Session.set('selected_ai', AI.default_name);
});

Template.create_game_ai.helpers({
  players() {
    return AI.getPlayers("difficulty");
  },
  selected(player) {
    return player.name === AI.default_name ? 'selected' : '';
  },
  description() {
    const name = Session.get('selected_ai');
    const player = AI.getPlayer(name);
    return player.description;
  },
});

Template.create_game_ai.events({
  'change #select-ai'(event) {
    const name = event.target.value;
    Session.set('selected_ai', name);
  },
});

Template.create_game_invite.onCreated(function() {
  Session.set('selected_user', null);
});

Template.create_game_invite.helpers({
  players() {
    const query = { _id: { $ne: Meteor.userId() } };
    return Meteor.users.find(query);
  },
});

Template.create_game_invite.events({
  'change #select-player'(event) {
    const id = event.target.value;
    Session.set('selected_user', id);
  },
});