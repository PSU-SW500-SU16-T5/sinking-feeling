import { assert } from 'meteor/practicalmeteor:chai';
import { _ } from 'meteor/underscore';
import * as AI from './ralph.js';

describe('api/ai/ralph.js', function() {
  describe('intToMove', function() {
    it('should map 0 to {row: 0, col: 0}', function() {
      const move = AI.intToMove(0);
      assert.deepEqual(move, {row: 0, col: 0});
    });
    it('should map 1 to {row: 0, col: 1}', function() {
      const move = AI.intToMove(1);
      assert.deepEqual(move, {row: 0, col: 1});
    });
    it('should map 10 to {row: 1, col: 0}', function() {
      const move = AI.intToMove(1);
      assert.deepEqual(move, {row: 0, col: 1});
    });
    it('should map 99 to {row: 9, col: 9}', function() {
      const move = AI.intToMove(1);
      assert.deepEqual(move, {row: 0, col: 1});
    });
  });

  describe('shuffleIntToMoves', function() {
    it('should return an array of the right length', function() {
      const moves = AI.shuffleIntToMoves([0, 42, 99]);
      assert.isArray(moves);
      assert.lengthOf(moves, 3);
    });
    it('should return an array of objects', function() {
      const moves = AI.shuffleIntToMoves([0, 42, 99]);
      for(let i = 0; i < 3; i++) {
        assert.isObject(moves[i]);
        assert.property(moves[i], 'row');
        assert.property(moves[i], 'col');
      }
    });
    it('should return an array of objects with row and col props', function() {
      const moves = AI.shuffleIntToMoves([0, 42, 99]);
      for(let i = 0; i < 3; i++) {
        assert.property(moves[i], 'row');
        assert.property(moves[i], 'col');
      }
    });
    it('should correctly convert ints to moves', function() {
      const moves = AI.shuffleIntToMoves([0, 42, 99]);
      const exp = [
        {row: 0, col: 0},
        {row: 4, col: 2},
        {row: 9, col: 9},
      ];
      assert.sameDeepMembers(moves, exp);
    });
    it('should shuffle the list', function() {
      // Construct 10 lists of 0 to 100
      const listsOfVals = _.times(10, () => _.range(0, 100));
      // Convert those lists into 10 lists of moves
      const listsOfMoves = _.map(listsOfVals, AI.shuffleIntToMoves);
      // Convert those move lists back into (presumably randomly shuffled)
      // integer lists
      const revertedVals = _.map(listsOfMoves, (move) => (move.row * 10 + move.col));
      // This "rotates" the array so that instead of a list of 10 lists of 100
      // integers, it's now 100 lists of 10 integers. So rotated[0] contains
      // revertedVals[0][0], revertedVals[1][0], revertedVals[2][0], etc.
      // In other words, rotated[i] contains the ith value from each subarray in
      // revertedVals
      const rotated = _.zip.apply(_, revertedVals);
      let succeed = true;
      for(let i = 0; i < 100; i++) {
        // If there's only 1 unique value from the ith values, then they were
        // all the same. We need to encounter at least one instance of them not
        // being all the same to demonstrate that there's at least some measure
        // of shuffling happening.
        if(_.uniq(rotated[i]).length > 1) {
          succeed = false;
          break;
        }
      }
      // If we reach here, we failed to find uniqueness which means no random
      // shuffling occurred. This means this test fails.
      assert(succeed);
    });
  });

  describe('firstValidMove', function() {
    it('should return the first valid move', function() {
      const moves = [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}];
      const board = {squares: [[{state: "E"}, {state: "E"}, {state: "E"}]]};
      const move = AI.firstValidMove(board, moves);
      assert.deepEqual(move, {row: 0, col: 0});
    });
    it('should skip invalid moves', function() {
      const moves = [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}];
      const board = {squares: [[{state: "X"}, {state: "X"}, {state: "E"}]]};
      const move = AI.firstValidMove(board, moves);
      assert.deepEqual(move, {row: 0, col: 2});
    });
    it('should throw Meteor.Error("no-moves-left") if all moves are invalid', function() {
      const moves = [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}];
      const board = {squares: [[{state: "X"}, {state: "X"}, {state: "X"}]]};
      const action = () => { AI.firstValidMove(board, moves); };
      assert.throws(action, Meteor.Error, 'no-moves-left');
    });
  });
});