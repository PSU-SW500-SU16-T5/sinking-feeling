import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { _ } from 'meteor/underscore';
import * as Board from './board.js';
import * as AI from './ai.js';

describe('api/ai.js', function() {
  describe('method getNames', function() {
    it('returns an array', function() {
      const names = AI.getNames();
      assert.isArray(names);
    });
    it('contains sue', function() {
      const names = AI.getNames();
      assert.include(names, 'sue');
    });
  });
  describe('attribute default_name', function() {
    it('is a string', function() {
      assert.isString(AI.default_name);
    });
  });
  describe('method getPlayer', function() {
    const names = AI.getNames();
    names.push('invalid-name');
    names.forEach(function(name) {
      describe('with name = ' + name, function() {
        it('returns an object', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
        });
        it('returns an object with string attribute name', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'name');
          assert.isString(ai.name);
        });
        it('returns an object with string attribute full_name', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'full_name');
          assert.isString(ai.full_name);
        });
        it('returns an object with method makeMove', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'makeMove');
          assert.isFunction(ai.makeMove);
        });
        it('makeMove returns a valid move on an empty board', function() {
          const ai = AI.getPlayer(name);
          const board = Board.makeEmptyBoard();
          const state = {};
          const move = ai.makeMove(board, state);
          assert.isObject(move);
          assert.property(move, 'row');
          assert.property(move, 'col');
          assert.isNumber(move.row);
          assert.isNumber(move.col);
        });
        it('makeMove throws error no-moves-left after 100 moves', function() {
          const ai = AI.getPlayer(name);
          const board = Board.makeEmptyBoard();
          const state = {};
          const makeMove = function() {
            const move = ai.makeMove(board, state);
            board[move.row][move.col].state = 'X';
          };
          for (let i = 0; i < 100; i++) {
            makeMove();
          }
          assert.throws(makeMove, Meteor.error, 'no-moves-left');
        });
        if (name != 'invalid-name') {
          it('treats name without case sensitivity', function() {
            // Create a copy of the name where each character has alternating
            // case
            const garbled = _.map(name.split(''), function(c,i) {
              if (i % 2 === 0) {
                return c.toUpperCase();
              } else {
                return c.toLowerCase();
              }
            }).join('');
            const ai = AI.getPlayer(garbled);
            assert(ai.name, name);
          });
        }
      });
    });
  });
});
