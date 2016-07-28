/* globals FlowRouter */
import { Template } from 'meteor/templating';
import { Games } from '/imports/api/games.js';
import * as Game from '/imports/api/game.js';

import './waiting.html';
import './listing.js';

Template.waiting_room.helpers({
  games() {
    const user = Meteor.user();
    let query = { 'state': 'waiting' };
    if(user) {
      query['creator.id'] = { $ne: user._id };
    }
    return Games.find(query);
  },

  title(game) {
    return Game.getTitle(game);
  },

  players(game) {
    return "Listed by " + game.creator.name;
  },

  linkTo(game) {
    const params = { id: game._id };
    return FlowRouter.path('game', params);
  },
});
