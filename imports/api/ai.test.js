import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { _ } from 'meteor/underscore';
import * as Board from './board.js';
import * as AI from './ai.js';

describe('api/ai.js', function() {
  describe('getNames', function() {
    it('should return an array', function() {
      const names = AI.getNames();
      assert.isArray(names);
    });
    it('should contain sue', function() {
      const names = AI.getNames();
      assert.include(names, 'sue');
    });
  });

  describe('default_name', function() {
    it('should be a string', function() {
      assert.isString(AI.default_name);
    });
  });

  describe('getPlayer', function() {
    const names = AI.getNames();
    names.push('invalid-name');
    names.forEach(function(name) {
      context('with name = ' + name, function() {
        it('should return an object', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
        });
        it('should return an object with string attribute name', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'name');
          assert.isString(ai.name);
        });
        it('should return an object with string attribute full_name', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'full_name');
          assert.isString(ai.full_name);
        });
        it('should return an object with numeric attribute difficulty', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'difficulty');
          assert.isNumber(ai.difficulty);
        });
        it('should return an object with string attribute difficulty_name', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'difficulty_name');
          assert.isString(ai.difficulty_name);
        });
        it('should return an object with string attribute description', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'description');
          assert.isString(ai.description);
        });
        it('should return an object with method makeMove', function() {
          const ai = AI.getPlayer(name);
          assert.isObject(ai);
          assert.property(ai, 'makeMove');
          assert.isFunction(ai.makeMove);
        });
        it('should return a valid move when makeMove called on empty board', function() {
          const ai = AI.getPlayer(name);
          const board = {
            squares: Board.makeEmptyBoard(),
            sunk: [],
          };
          const state = {};
          const move = ai.makeMove(board, state);
          assert.isObject(move);
          assert.property(move, 'row');
          assert.property(move, 'col');
          assert.isNumber(move.row);
          assert.isNumber(move.col);
        });
        it('should throw error no-moves-left when makeMove called 101st time', function() {
          const ai = AI.getPlayer(name);
          const board = {
            squares: Board.makeEmptyBoard(),
            sunk: [],
          };
          const state = {};
          const makeMove = function() {
            const move = ai.makeMove(board, state);
            board.squares[move.row][move.col].state = 'X';
          };
          for(let i = 0; i < 100; i++) {
            makeMove();
          }
          assert.throws(makeMove, Meteor.Error, 'no-moves-left');
        });
        if(name != 'invalid-name') {
          it('should treat name without case sensitivity', function() {
            // Create a copy of the name where each character has alternating
            // case
            const garbled = _.map(name.split(''), function(c,i) {
              if(i % 2 === 0) {
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

  describe('getPlayers', function() {
    it('should return an array of objects', function() {
      const players = AI.getPlayers();
      assert.isArray(players);
      for(let player of players) {
        assert.isObject(player);
      }
    });
    it('should return objects with correct fields', function() {
      const players = AI.getPlayers();
      for(let player of players) {
        assert.lengthOf(Object.keys(player), 6);
        assert.property(player, 'name');
        assert.property(player, 'full_name');
        assert.property(player, 'difficulty');
        assert.property(player, 'difficulty_name');
        assert.property(player, 'description');
        assert.property(player, 'makeMove');
      }
    });
    it('should sort by full_name ascending by default', function() {
      const players = AI.getPlayers();
      assert.isArray(players);
      for(let i = 0; i < players.length-1; i++) {
        assert(players[i].full_name <= players[i+1].full_name);
      }
    });
    it('should sort by name descending upon request', function() {
      const players = AI.getPlayers('name', true);
      assert.isArray(players);
      for(let i = 0; i < players.length-1; i++) {
        assert(players[i].name >= players[i+1].name);
      }
    });
  });
});