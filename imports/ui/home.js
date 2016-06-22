import { Template } from 'meteor/templating';

import { Games } from '../api/games.js';

import './home.html';

Template.home.helpers({
  games() {
    return Games.find({});
  },
});