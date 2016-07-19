import { assert } from 'meteor/practicalmeteor:chai';

import * as AI from './felicity.js';

describe('api/ai/felicity.js', function() {
  describe('smallestUnsunkShip', function() {
    it('should return 2 when no ships sunk', function() {
      const length = AI.smallestUnsunkShip([]);
      assert.equal(length, 2);
    });
    it('should return 3 when destroyer sunk', function() {
      const sunk = ["destroyer"];
      const length = AI.smallestUnsunkShip(sunk);
      assert.equal(length, 3);
    });
    it('should return 4 when destroyer, cruiser, and submarine sunk', function() {
      const sunk = ["destroyer", "submarine", "cruiser"];
      const length = AI.smallestUnsunkShip(sunk);
      assert.equal(length, 4);
    });
    it('should return 5 when only carrier remains', function() {
      const sunk = ["destroyer", "battleship", "cruiser", "submarine"];
      const length = AI.smallestUnsunkShip(sunk);
      assert.equal(length, 5);
    });
    it('should return 2 when only destroyer remains', function() {
      const sunk = ["battleship", "cruiser", "submarine", "carrier"];
      const length = AI.smallestUnsunkShip(sunk);
      assert.equal(length, 2);
    });
  });

  describe('checkDirPriority', function() {
    it('should return 0 if closed in', function() {
      const lookup = () => ("C");
      const priority = AI.checkDirPriority(2, lookup, 5, 5);
      assert.equal(priority, 0);
    });
    it('should return 1 if enclosed left of a single hit', function() {
      const row = "CCCOACCCCC";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(2, lookup, 3);
      assert.equal(priority, 1);
    });
    it('should return 1 if enclosed right of a single hit', function() {
      const row = "CCCAOCCCCC";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(2, lookup, 4);
      assert.equal(priority, 1);
    });
    it('should return 1 if open left of a single hit', function() {
      const row = "OOOAOOOOOO";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(2, lookup, 2);
      assert.equal(priority, 1);
    });
    it('should return 1 if open right of a single hit', function() {
      const row = "OOOAOOOOOO";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(2, lookup, 4);
      assert.equal(priority, 1);
    });
    it('should return 2 if next to two hits and smallest ship is 5', function() {
      const row = "OOOAAOOOOO";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(5, lookup, 2);
      assert.equal(priority, 2);
    });
    it('should return 3 if next to two hits and smallest ship is 2', function() {
      const row = "OOOAAOOOOO";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(2, lookup, 2);
      assert.equal(priority, 3);
    });
    it('should return 2 if next to three hits and smallest ship is 5', function() {
      const row = "OOOAAAOOOO";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(5, lookup, 2);
      assert.equal(priority, 2);
    });
    it('should return 3 if next to three hits and smallest ship is 3', function() {
      const row = "OOOAAAOOOO";
      const lookup = (i) => (row[i]);
      const priority = AI.checkDirPriority(3, lookup, 2);
      assert.equal(priority, 3);
    });
  });
});
