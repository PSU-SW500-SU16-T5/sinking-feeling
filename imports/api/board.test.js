import { assert, expect } from 'meteor/practicalmeteor:chai';
import * as Board from './board.js';

export function checkBoard(expected, board)
{
  let r, c;
  for(r = 0; r < 10; r++) {
    for(c = 0; c < 10; c++) {
      assert.equal(expected[r][c], board[r][c].val, "row: " + r.toString() + " col: " + c.toString());
    }
  }  
};

describe('board', function() {
  describe('makeBoard', function() {
    it('returns an array of size 10', function () {
      const board = Board.makeEmptyBoard();
      assert.isArray(board);
      assert(board.length, 10);
    });
    it('returns an array with rows of size 10', function () {
      const board = Board.makeEmptyBoard();
      assert.isArray(board);
      for(let row of board) {
        assert.isArray(row);
        assert(row.length, 10);
      }
    });
    it('returns an array with all cells empty', function () {
      const board = Board.makeEmptyBoard();
      assert.isArray(board);
      for(let row of board) {
        assert.isArray(row);
        for(let cell of row) {
          assert.propertyVal(cell, 'val', 'E');
        }
      }
    });
  });
  
  
  describe('setRange', function	     () {
    function testBoard(expected, x, y, len, width, value)
    {
      const board = Board.makeEmptyBoard();
      Board.setRange(board, x, y, len, width, value);
      checkBoard(expected, board);
    };
    
    it('works correctly for a single cell', function () {
      const exp = [
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEXEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      testBoard(exp, 2, 4, 1, 1, 'X');
    });
    it('works correctly for a horizontal ship', function () {
      const exp = [
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EXXXXEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      testBoard(exp, 3, 1, 1, 4, 'X');
    });
    it('works correctly for a vertical ship', function () {
      const exp = [
        "XEEEEEEEEE",
        "XEEEEEEEEE",
        "XEEEEEEEEE",
        "XEEEEEEEEE",
        "XEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",	
        "EEEEEEEEEE",
      ];
      testBoard(exp, 0, 0, 5, 1, 'X');
    });
    it('works correctly for a block', function () {
      const exp = [
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEXXXEEEE",
        "EEEXXXEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      testBoard(exp, 6, 3, 2, 3, 'X');
    });
  });
});