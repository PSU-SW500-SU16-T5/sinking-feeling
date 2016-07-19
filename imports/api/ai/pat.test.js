import { assert } from 'meteor/practicalmeteor:chai';

import * as AI from './pat.js';

describe('api/ai/pat.js', function() {
  describe('largestUnsunkShip', function() {
    it('should return 5 when no ships sunk', function() {
      const length = AI.largestUnsunkShip([]);
      assert.equal(length, 5);
    });
    it('should return 4 when carrier sunk', function() {
      const sunk = ["carrier"];
      const length = AI.largestUnsunkShip(sunk);
      assert.equal(length, 4);
    });
    it('should return 3 when carrier and battleship sunk', function() {
      const sunk = ["carrier", "battleship"];
      const length = AI.largestUnsunkShip(sunk);
      assert.equal(length, 3);
    });
    it('should return 2 when only destroyer remains', function() {
      const sunk = ["carrier", "battleship", "cruiser", "submarine"];
      const length = AI.largestUnsunkShip(sunk);
      assert.equal(length, 2);
    });
    it('should return 5 when only carrier remains', function() {
      const sunk = ["battleship", "cruiser", "submarine", "destroyer"];
      const length = AI.largestUnsunkShip(sunk);
      assert.equal(length, 5);
    });
  });

  describe('largestTwoPower', function() {
    it('should return 4 for 5', function() {
      const val = AI.largestTwoPower(5);
      assert.equal(val, 4);
    });
    it('should return 4 for 4', function() {
      const val = AI.largestTwoPower(4);
      assert.equal(val, 4);
    });
    it('should return 2 for 3', function() {
      const val = AI.largestTwoPower(3);
      assert.equal(val, 2);
    });
    it('should return 2 for 2', function() {
      const val = AI.largestTwoPower(2);
      assert.equal(val, 2);
    });
    it('should return 1 for 1', function() {
      const val = AI.largestTwoPower(1);
      assert.equal(val, 1);
    });
    it('should return 16 for 25', function() {
      const val = AI.largestTwoPower(25);
      assert.equal(val, 16);
    });
  });
});
