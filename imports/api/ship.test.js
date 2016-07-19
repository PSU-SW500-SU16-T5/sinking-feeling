import { _ } from 'meteor/underscore';
import { assert } from 'meteor/practicalmeteor:chai';

import * as Ship from './ship.js';

describe('api/ships.js', function() {
  describe('types', function() {
    it('is an array', function() {
      assert.isArray(Ship.types);
    });
    it('contains strings', function() {
      Ship.types.forEach(function(type) {
        assert.isString(type);
      });
    });
  });
  
  describe('lengths', function() {
    it('is an object', function() {
      assert.isObject(Ship.lengths);
    });
    describe('has entries for each type in types', function() {
      Ship.types.forEach(function(type) {
        it(type + ' exists', function() {
          assert.property(Ship.lengths, type);
        });
        it(type + ' is numeric', function() {
          assert.isNumber(Ship.lengths[type]);
        });
      });
    });
  });

  describe('create', function() {
    it('should return an object with all defined ship types', function() {
      const ships = Ship.create();
      assert.sameMembers(Object.keys(ships), Ship.types);
    });
    it('should provide each ship with keys row, col, and vertical', function() {
      const ships = Ship.create();
      Ship.types.forEach(type => {
        assert.sameMembers(Object.keys(ships[type]), ['row', 'col', 'vertical']);
      });
    });
  });

  describe('overlap', function() {
    it('should return true when there is an overlap', function() {
      const expected = true;
      const positions = {cruiser: { row: 0, col: 0, vertical: true}};
      const test_type = "submarine";
      const test_row = 2;
      const test_col = 0;
      const test_vertical = true;

      const result = Ship.overlap(test_type, test_row, test_col, test_vertical,
         positions);

      assert.equal(expected, result);
    });
    it('should return false when there is not an overlap', function(){
      const expected = false;
      const positions = {cruiser: { row: 0, col: 0, vertical: true}};
      const test_type = "submarine";
      const test_row = 3;
      const test_col = 0;
      const test_vertical = true;

      const result = Ship.overlap(test_type, test_row, test_col, test_vertical,
         positions);

      assert.equal(expected, result);
    });
  });

  describe('place', function() {
    it('should correctly place a ship vertical at origin', function() {
      var positions = {};
      var row = 0;
      var col = 0;
      var vertical = true;

      Ship.place("carrier", row, col, vertical, positions);

      assert.equal(1, Object.keys(positions).length);
      assert.equal(row, positions.carrier.row);
      assert.equal(col, positions.carrier.col);
      assert.equal(vertical, positions.carrier.vertical);
    });
    it('should correctly place all five ships', function() {
      var positions = {};
      var ships = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
      var row = 0;
      var col = 0;
      var vertical = true;

      ships.forEach(function(shipType) {
        Ship.place(shipType, row, col, vertical, positions);
        col++;
      });

      assert.equal(ships.length, Object.keys(positions).length);
      assert.equal(0, positions.carrier.col);
      assert.equal(1, positions.battleship.col);
      assert.equal(2, positions.cruiser.col);
      assert.equal(3, positions.submarine.col);
      assert.equal(4, positions.destroyer.col);
    });
    it('should reposition an existing ship', function() {
      var positions = {};
      var ship = "carrier";
      var row = 0;
      var col1 = 0;
      var col2 = 5;
      var vertical = true;

      Ship.place(ship, row, col1, vertical, positions);
      Ship.place(ship, row, col2, vertical, positions);

      assert.equal(1, Object.keys(positions).length);
      assert.equal(col2, positions.carrier.col);
    });
    it('should throw an error for an invalid ship', function() {
      var invalid_ship = "pt boat";
      assert.throw(function() {
        Ship.place(invalid_ship, 0, 0, true, {});
      }, 'Unrecognised ship type');
    });
    it('should throw an error when placing a new ship that overlaps', function() {
      const positions = {};
      Ship.place("carrier", 0, 0, true, positions);
      Ship.place("battleship", 0, 1, true, positions);

      assert.throw(function() {
        Ship.place("battleship", 0, 0, true, positions);
      }, "Ships Overlapping");

      assert.equal(0, positions.carrier.col); // Still there
    });
    it('should move a ship despite overlap with former position', function() {
      const positions = {};
      Ship.place("carrier", 0, 0, true, positions);
      Ship.place("carrier", 1, 0, true, positions);

      assert.equal(1, Object.keys(positions).length); // Still there
    });
  });

  describe('randomizeShips', function() {
    it('should change the positions of the ships', function () {
      const ships1 = Ship.create();
      const ships2 = {};
      Ship.types.forEach(type => {
        ships2[type] = _.clone(ships1[type]);
      });
      Ship.randomize(ships1);
      assert(_.some(Ship.types, type => {
        return ships1[type].row != ships2[type].row ||
          ships1[type].col != ships2[type].col ||
          ships1[type].vertical != ships2[type].vertical;
      }));
    });
  });

});