import { assert } from 'meteor/practicalmeteor:chai';
import * as Square from './square.js';

describe('api/square.js', function() {
  describe('spacesAreSame', function() {
    it('returns true when row and col are same', function() {
      const space1 = {row: 1, col: 2};
      const space2 = {row: 1, col: 2};
      assert.equal(true, Square.spacesAreSame(space1, space2));
    });
    it('returns false when cols are same but rows differ', function() {
      const space1 = {row: 3, col: 2};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Square.spacesAreSame(space1, space2));
    });
    it('returns false when rows are same but cols differ', function() {
      const space1 = {row: 1, col: 3};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Square.spacesAreSame(space1, space2));
    });
    it('returns false when rows and cols both differ', function() {
      const space1 = {row: 3, col: 3};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Square.spacesAreSame(space1, space2));
    });
    it('returns false when row and col are swapped', function() {
      const space1 = {row: 2, col: 1};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Square.spacesAreSame(space1, space2));
    });
  });

  describe('spaceIsOnShip', function() {
    let ships;
    describe('with vertical carrier', function() {
      beforeEach(function() {
        ships = { carrier: { row: 0, col: 0, vertical: true } };
      });

      it('returns true with hit on anchor square', function() {
        const shot = { row: 0, col: 0 };
        assert(Square.spaceIsOnShip(shot, ships));
      });
      it('returns true with hit on non-anchor square', function() {
        const shot = { row: 4, col: 0 };
        assert(Square.spaceIsOnShip(shot, ships));
      });
      it('returns false with miss on anchor col', function() {
        const shot = { row: 5, col: 0 };
        assert.isFalse(Square.spaceIsOnShip(shot, ships));
      });
      it('returns false with miss on anchor row', function() {
        const shot = { row: 0, col: 1 };
        assert.isFalse(Square.spaceIsOnShip(shot, ships));
      });
    });
    describe('with horizontal destroyer', function() {
      beforeEach(function() {
        ships = { destroyer: { row: 0, col: 0, vertical: false } };
      });

      it('returns true with hit on anchor square', function() {
        const shot = { row: 0, col: 0 };
        assert(Square.spaceIsOnShip(shot, ships));
      });
      it('returns true with hit on non-anchor square', function() {
        const shot = { row: 0, col: 1 };
        assert(Square.spaceIsOnShip(shot, ships));
      });
      it('returns false with miss on anchor col', function() {
        const shot = { row: 1, col: 0 };
        assert.isFalse(Square.spaceIsOnShip(shot, ships));
      });
      it('returns false with miss on anchor row', function() {
        const shot = { row: 0, col: 2 };
        assert.isFalse(Square.spaceIsOnShip(shot, ships));
      });
    });
    describe('with multiple ships', function() {
      beforeEach(function() {
        ships = {
          carrier: { row: 0, col: 0, vertical: true },
          cruiser: { row: 0, col: 1, vertical: true },
          destroyer: { row: 0, col: 2, vertical: false }
        };
      });
      const success_shots = [
        {row: 0, col: 0}, {row: 1, col: 0}, {row: 4, col: 0}, {row: 0, col: 1},
        {row: 2, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}
      ];
      const fail_shots = [
        {row: 5, col: 0}, {row: 3, col: 1}, {row: 1, col: 2}, {row: 1, col: 3},
        {row: 0, col: 4}
      ];

      success_shots.forEach(function(shot) {
        it('returns true with hit on ('+shot.row+','+shot.col+')', function() {
          assert(Square.spaceIsOnShip(shot, ships));
        });
      });
      fail_shots.forEach(function(shot) {
        it('returns false with miss on ('+shot.row+','+shot.col+')', function() {
          assert.isFalse(Square.spaceIsOnShip(shot, ships));
        });
      });
    });
  });

  describe('squareNameToObj', function() {
    it('should work for A1', function() {
      const obj = Square.squareNameToObj('A1');
      assert.isObject(obj);
      assert.propertyVal(obj, 'row', 0);
      assert.propertyVal(obj, 'col', 0);
    });
    it('should work for C10', function() {
      const obj = Square.squareNameToObj('C10');
      assert.isObject(obj);
      assert.propertyVal(obj, 'row', 2);
      assert.propertyVal(obj, 'col', 9);
    });
  });
  describe('squareObjToName', function() {
    it('should work for A1', function() {
      const name = Square.squareObjToName({row: 0, col: 0});
      assert.equal(name, 'A1');
    });
    it('should work for C10', function() {
      const name = Square.squareObjToName({row: 2, col: 9});
      assert.equal(name, 'C10');
    });
  });
});