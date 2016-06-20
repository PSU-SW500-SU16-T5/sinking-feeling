import { assert, expect } from 'meteor/practicalmeteor:chai';
import * as Game from './game.js';
import {checkBoard} from './board.test.js';

describe('game', function() {
  describe('shot', function() {
    it('added to array', function () {
      var row = 7;
      var col = 8;
      game = {creator: {shots: [{row: 0, col: 0}]}};
      
      Game.shot(game, "creator", row, col);
      
      assert.equal(2, game.creator.shots.length);
      assert.equal(row, game.creator.shots[1].row);
      assert.equal(col, game.creator.shots[1].col);
    });
    it('challenger shot', function () {
      var row = 7;
      var col = 8;
      var player = "challenger";
      game = {};
      game[player] = {shots: [{row: 0, col: 0}]};
      
      Game.shot(game, player, row, col);
      
      assert.equal(2, game[player].shots.length);
      assert.equal(row, game[player].shots[1].row);
      assert.equal(col, game[player].shots[1].col);
    });
    it('first shot', function () {
      var row = 7;
      var col = 8;
      var player = "creator";
      game = {};
      
      Game.shot(game, player, row, col);
      
      assert.equal(1, game[player].shots.length);      
    });
  });
  
  describe('placeShip', function() {
    it('vertical at origin', function(){
      var positions = {};
      var row = 0;
      var col = 0;
      var vertical = true;

      Game.placeShip("carrier", row, col, vertical, positions);

      assert.equal(1, Object.keys(positions).length);
      assert.equal(row, positions.carrier.row);
      assert.equal(col, positions.carrier.col);
      assert.equal(vertical, positions.carrier.vertical);
    });
    it('all five', function(){
      var positions = {};
      var ships = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
      var row = 0;
      var col = 0;
      var vertical = true;

      ships.forEach(function(shipType){
        Game.placeShip(shipType, row, col, vertical, positions);
        col++;
      });

      assert.equal(ships.length, Object.keys(positions).length);
      assert.equal(0, positions.carrier.col);
      assert.equal(1, positions.battleship.col);
      assert.equal(2, positions.cruiser.col);
      assert.equal(3, positions.submarine.col);
      assert.equal(4, positions.destroyer.col);                    
    });
    it('change existing', function(){
      var positions = {};
      var ship = "carrier";
      var row = 0;
      var col1 = 0;
      var col2 = 5;
      var vertical = true;

      Game.placeShip(ship, row, col1, vertical, positions);
      Game.placeShip(ship, row, col2, vertical, positions);

      assert.equal(1, Object.keys(positions).length);
      assert.equal(col2, positions.carrier.col);
    });
    it('invalid type', function(){
      var invalid_ship = "pt boat";
      expect(function(){
        Game.placeShip(invalid_ship, 0, 0, true, {});
      }).to.throw('Unrecognised ship type');
    });
    it('no overlaps', function(){
      // TODO: We need to test to see if ships are overlapping, and throw an exception
    });
  });
  
  describe('users board', function(){
    it('empty board', function(){
      var game = { creator: { ships: {}, shots: []}, challenger: { ships: {}, shots: []} };
      var user = 'creator';
      
      var board = Game.getOwnBoard(game, user);
      
    });
    it('only single ship', function(){
      const exp = [
        "SEEEEEEEEE",
        "SEEEEEEEEE",
        "SEEEEEEEEE",
        "SEEEEEEEEE",
        "SEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      
      var game = {
        creator: {
          ships: {
            carrier: { row: 0, col: 0, vertical: true }
          },
          shots: {}
        },
        challenger: { ships: {}, shots: []} };
      var user = 'creator';
      
      var board = Game.getOwnBoard(game, user);
      
      checkBoard(exp, board);
    });
    it('only single ship horizontal', function(){
      const exp = [
        "SSSSSEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      
      var game = {
        creator: {
          ships: {
            carrier: { row: 0, col: 0, vertical: false }
          },
          shots: {}
        },
        challenger: { ships: {}, shots: []} };
      var user = 'creator';
      
      var board = Game.getOwnBoard(game, user);
      
      checkBoard(exp, board);
    });
    it('only multiple ships', function(){
      const exp = [
        "SSSSSEEEEE",
        "SSSSSEEEEE",
        "SSSSEEEEEE",
        "SSEEEEEEEE",
        "SEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      
      var game = {
        creator: {
          ships: {
            carrier: { row: 0, col: 0, vertical: true },
            battleship: { row: 0, col: 1, vertical: true },
            cruiser: { row: 0, col: 2, vertical: true },
            submarine: { row: 0, col: 3, vertical: true },
            destroyer: { row: 0, col: 4, vertical: true }
          }
        },
        challenger: { ships: {}, shots: []} };
      var user = 'creator';
      
      var board = Game.getOwnBoard(game, user);
      
      checkBoard(exp, board);
    });
    it('with shots', function(){
      const exp = [
        "HEEEEEEEEE",
        "SMEEEEEEEE",
        "SEEEEEEEEE",
        "SEEEEEEEEE",
        "SEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      
      var game = {
        creator: {
          ships: {
            carrier: { row: 0, col: 0, vertical: true }
          }
        },
        challenger: { ships: {}, shots: [{row: 0, col: 0}, {row: 1, col: 1}] }
      };
      var user = 'creator';
      
      var board = Game.getOwnBoard(game, user);
      
      checkBoard(exp, board);
    });
  });
  describe('shot to ship', function(){
    it('shot hit space', function(){
      var shot = {row: 1, col: 2};
      var space = {row: 1, col: 2};
      
      assert.equal(true, Game.shotHitInSpace(shot, space));
      
      shot.row = 3;
      assert.equal(false, Game.shotHitInSpace(shot, space));
      
      shot.row = 1;
      shot.col = 3;
      assert.equal(false, Game.shotHitInSpace(shot, space));

      shot.row = 3;
      shot.col = 3;
      assert.equal(false, Game.shotHitInSpace(shot, space));
      
      shot.row = 2;
      shot.col = 1;
      assert.equal(false, Game.shotHitInSpace(shot, space));      
    });
    it('shot to carrier vertical', function(){
      var ships = { carrier: { row: 0, col: 0, vertical: true } };
      var shot = { row: 0, col: 0 };
      
      assert.equal(true, Game.shotWasHit(shot, ships));
      
      shot.row = 1;
      assert.equal(true, Game.shotWasHit(shot, ships));
      
      shot.row = 4;
      assert.equal(true, Game.shotWasHit(shot, ships));
      
      shot.row = 5;
      assert.equal(false, Game.shotWasHit(shot, ships));
      
      shot.row = 0;
      shot.col = 1;
      assert.equal(false, Game.shotWasHit(shot, ships));
    });
    it('shot to destroyer horizontal', function(){
      var ships = { destroyer: { row: 0, col: 0, vertical: false } };
      var shot = { row: 0, col: 0 };
      
      assert.equal(true, Game.shotWasHit(shot, ships));
      
      shot.row = 1;
      assert.equal(false, Game.shotWasHit(shot, ships));
      
      shot.row = 0;
      shot.col = 1;
      assert.equal(true, Game.shotWasHit(shot, ships));
      
      shot.col = 2;
      assert.equal(false, Game.shotWasHit(shot, ships));
    });
    it('multiple ships', function(){
      var ships = { 
        carrier: { row: 0, col: 0, vertical: true },
        cruiser: { row: 0, col: 1, vertical: true },
        destroyer: { row: 0, col: 2, vertical: false }
      };
      var success_shots = [
        {row: 0, col: 0}, {row: 1, col: 0}, {row: 4, col: 0}, {row: 0, col: 1},
        {row: 2, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}
      ];
      var fail_shots = [
        {row: 5, col: 0}, {row: 3, col: 1}, {row: 1, col: 2}, {row: 1, col: 3},
        {row: 0, col: 4}
      ];
      
      success_shots.forEach( function(shot){
        assert.equal(true, Game.shotWasHit(shot, ships));
      });
      fail_shots.forEach( function(shot){
        assert.equal(false, Game.shotWasHit(shot, ships));
      });
    });
  });

});

 
