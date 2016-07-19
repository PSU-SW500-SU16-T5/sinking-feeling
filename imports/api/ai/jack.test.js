import { assert } from 'meteor/practicalmeteor:chai';
import * as Board from '../board.js';
import * as AI from './jack.js';

describe('api/ai/jack.js', function() {
  describe('addOpenNeighbors', function() {
    let board = [];
    let targets = [];

    beforeEach(function() {
      board = Board.makeEmptyBoard();
      targets = [];
    });
    it('should add 4 open neighbors in middle', function() {
      AI.addOpenNeighbors(targets, board, 5, 5);
      assert.lengthOf(targets, 4);
      const exp = [
        {row: 4, col: 5},
        {row: 5, col: 4},
        {row: 5, col: 6},
        {row: 6, col: 5},
      ];
      assert.sameDeepMembers(exp, targets);
    });
    it('should add 3 open neighbors on left', function() {
      AI.addOpenNeighbors(targets, board, 5, 0);
      assert.lengthOf(targets, 3);
      const exp = [
        {row: 4, col: 0},
        {row: 5, col: 1},
        {row: 6, col: 0},
      ];
      assert.sameDeepMembers(exp, targets);
    });
    it('should add 3 open neighbors on right', function() {
      AI.addOpenNeighbors(targets, board, 5, 9);
      assert.lengthOf(targets, 3);
      const exp = [
        {row: 4, col: 9},
        {row: 5, col: 8},
        {row: 6, col: 9},
      ];
      assert.sameDeepMembers(exp, targets);
    });
    it('should add 3 open neighbors on top', function() {
      AI.addOpenNeighbors(targets, board, 0, 5);
      assert.lengthOf(targets, 3);
      const exp = [
        {row: 0, col: 4},
        {row: 1, col: 5},
        {row: 0, col: 6},
      ];
      assert.sameDeepMembers(exp, targets);
    });
    it('should add 3 open neighbors on bottom', function() {
      AI.addOpenNeighbors(targets, board, 9, 5);
      assert.lengthOf(targets, 3);
      const exp = [
        {row: 9, col: 4},
        {row: 8, col: 5},
        {row: 9, col: 6},
      ];
      assert.sameDeepMembers(exp, targets);
    });
    it('should omit neighbors that are not open', function() {
      board[4][5].state = 'M';
      board[5][4].state = 'H';
      board[5][6].state = 'X';
      AI.addOpenNeighbors(targets, board, 5, 5);
      assert.lengthOf(targets, 1);
      const exp = [{row: 6, col: 5}];
      assert.sameDeepMembers(exp, targets);
    });
  });

  describe('checkMove', function() {
    let board = [];
    let state = {};

    beforeEach(function() {
      board = Board.makeEmptyBoard();
      state = {
        mode: 'hunt',
        targets: [],
      };
    });
    it('should do nothing on a miss', function() {
      AI.checkMove(board, state, {row: 5, col: 5});
      assert.equal(state.mode, 'hunt');
      assert.lengthOf(state.targets, 0);
    });
    it('should change state and add neighbors on a hit', function() {
      board[5][5].ship = 'Top';
      AI.checkMove(board, state, {row: 5, col: 5});
      assert.equal(state.mode, 'target');
      assert.lengthOf(state.targets, 4);
      const exp = [
        {row: 4, col: 5},
        {row: 5, col: 4},
        {row: 5, col: 6},
        {row: 6, col: 5},
      ];
      assert.sameDeepMembers(exp, state.targets);
    });
  });
});