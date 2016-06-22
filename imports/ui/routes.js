/** Configuration for JSHint to recognize automatic globals: */
/* globals FlowRouter, BlazeLayout */

import './layout.html';

import './home.js';
FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render('layout', {content: 'home'});
  }
});

import './game.js';
FlowRouter.route('/game/:id', {
  action: function() {
    BlazeLayout.render('layout', {content: 'game'});
  }
})