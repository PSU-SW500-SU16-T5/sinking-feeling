/* globals FlowRouter */

import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import './listing.html';
import './listing.less';

Template.listing.helpers({
  stateStyle(state) {
    switch(state) {
      case 'created':
        return "label-primary";
      case 'waiting':
      case 'pending':
        return "label-warning";
      case 'declined':
        return "label-danger";
      case 'setup':
        return "label-info";
      case 'active':
        return "label-success";
      case 'ended':
        return "label-default";
      default:
        return "label-default";
    }
  },
  turn(turn_number) {
    if(!_.isNumber(turn_number)) return turn_number;
    return turn_number + 1;
  },
  gameUrl(id) {
    return FlowRouter.path('game', {id});
  },
  removeUrl(id) {
    return FlowRouter.path('game', {id}, {action: 'remove'});
  },
});
