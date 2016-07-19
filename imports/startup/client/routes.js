/** Configuration for JSHint to recognize automatic globals: */
/* globals FlowRouter, BlazeLayout */

import '/imports/ui/layout.js';

import '/imports/ui/home.js';
FlowRouter.route('/', {
  name: 'home',
  action: function() {
    BlazeLayout.render('layout', {content: 'home'});
  }
});

import '/imports/ui/game.js';
FlowRouter.route('/game/:id', {
  name: 'game',
  action: function() {
    BlazeLayout.render('layout', {content: 'game'});
  }
});

import '/imports/ui/rules.js';
FlowRouter.route('/rules', {
  name: 'rules',
  action: function() {
    BlazeLayout.render('layout', {content: 'rules'});
  }
});

import '/imports/ui/http404.js';
FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render('layout', {content: 'http404'});
  },
};