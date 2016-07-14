import { assert } from "meteor/practicalmeteor:chai";
import * as Board from "./board.js";

export function checkBoard(expected, board) {
  let r, c;
  for (r = 0; r < 10; r++) {
    for (c = 0; c < 10; c++) {
      assert.equal(expected[r][c], board[r][c].state, "row: " + r.toString() + " col: " + c.toString());
    }
  }
}

describe("api/board.js", function() {
  describe("makeBoard", function() {
    it("returns an array of size 10", function () {
      const board = Board.makeEmptyBoard();
      assert.isArray(board);
      assert(board.length, 10);
    });
    it("returns an array with rows of size 10", function () {
      const board = Board.makeEmptyBoard();
      assert.isArray(board);
      for (let row of board) {
        assert.isArray(row);
        assert(row.length, 10);
      }
    });
    it("returns an array with all cells empty", function () {
      const board = Board.makeEmptyBoard();
      assert.isArray(board);
      for (let row of board) {
        assert.isArray(row);
        for (let cell of row) {
          assert.propertyVal(cell, "state", "E");
        }
      }
    });
  });

  describe("setRange", function() {
    function testBoard(expected, x, y, len, width, value) {
      const board = Board.makeEmptyBoard();
      Board.setRange(board, x, y, len, width, "state", value);
      checkBoard(expected, board);
    }

    it("works correctly for a single cell", function() {
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
      testBoard(exp, 2, 4, 1, 1, "X");
    });
    it("works correctly for a horizontal ship", function() {
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
      testBoard(exp, 3, 1, 1, 4, "X");
    });
    it("works correctly for a vertical ship", function() {
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
      testBoard(exp, 0, 0, 5, 1, "X");
    });
    it("works correctly for a block", function() {
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
      testBoard(exp, 6, 3, 2, 3, "X");
    });
  });

  describe("checkSunk", function() {
    let ships = {};
    beforeEach(function() {
      ships = {
        carrier: { row: 0, col: 0, vertical: true },
        battleship: { row: 0, col: 1, vertical: true },
        cruiser: { row: 0, col: 2, vertical: true },
        submarine: { row: 0, col: 3, vertical: true },
        destroyer: { row: 0, col: 4, horizontal: true }
      };
    });
    it("should do nothing when the board is empty", function() {
      const exp = [
        "EEEEEEEEEE",
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
      const board = Board.makeEmptyBoard();
      const sunk = Board.checkSunk(board, ships);

      assert.sameMembers([], sunk);
      checkBoard(exp, board);
    });
    it("should do nothing when the board has only misses", function() {
      const exp = [
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEM",
        "EEEEEEEEEE",
        "MEEEEEEEEE",
      ];
      const board = Board.makeEmptyBoard();
      board[7][9].state = "M";
      board[9][0].state = "M";
      const sunk = Board.checkSunk(board, ships);

      assert.sameMembers([], sunk);
      checkBoard(exp, board);
    });
    it("should do nothing when the board has hits without sinking", function() {
      const exp = [
        "EHHEEEEEEE",
        "HEEEEEEEEE",
        "HEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      const board = Board.makeEmptyBoard();
      board[0][1].state = "H";
      board[0][2].state = "H";
      board[1][0].state = "H";
      board[2][0].state = "H";
      const sunk = Board.checkSunk(board, ships);

      assert.sameMembers([], sunk);
      checkBoard(exp, board);
    });
    it("should detect sunk ships", function() {
      const exp = [
        "EEXEXXEEEE",
        "EEXEEEEEEE",
        "EEXEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
        "EEEEEEEEEE",
      ];
      const board = Board.makeEmptyBoard();
      Board.setRange(board, 0, 2, 3, 1, "state", "H");
      Board.setRange(board, 0, 4, 1, 2, "state", "H");
      const sunk = Board.checkSunk(board, ships);

      assert.sameMembers(["cruiser", "destroyer"], sunk);
      checkBoard(exp, board);
    });
  });

  describe("spacesAreSame", function() {
    it("returns true when row and col are same", function() {
      const space1 = {row: 1, col: 2};
      const space2 = {row: 1, col: 2};
      assert.equal(true, Board.spacesAreSame(space1, space2));
    });
    it("returns false when cols are same but rows differ", function() {
      const space1 = {row: 3, col: 2};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Board.spacesAreSame(space1, space2));
    });
    it("returns false when rows are same but cols differ", function() {
      const space1 = {row: 1, col: 3};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Board.spacesAreSame(space1, space2));
    });
    it("returns false when rows and cols both differ", function() {
      const space1 = {row: 3, col: 3};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Board.spacesAreSame(space1, space2));
    });
    it("returns false when row and col are swapped", function() {
      const space1 = {row: 2, col: 1};
      const space2 = {row: 1, col: 2};
      assert.equal(false, Board.spacesAreSame(space1, space2));
    });
  });

  describe("spaceIsOnShip", function() {
    let ships;
    describe("with vertical carrier", function() {
      beforeEach(function() {
        ships = { carrier: { row: 0, col: 0, vertical: true } };
      });

      it("returns true with hit on anchor square", function() {
        const shot = { row: 0, col: 0 };
        assert(Board.spaceIsOnShip(shot, ships));
      });
      it("returns true with hit on non-anchor square", function() {
        const shot = { row: 4, col: 0 };
        assert(Board.spaceIsOnShip(shot, ships));
      });
      it("returns false with miss on anchor col", function() {
        const shot = { row: 5, col: 0 };
        assert.isFalse(Board.spaceIsOnShip(shot, ships));
      });
      it("returns false with miss on anchor row", function() {
        const shot = { row: 0, col: 1 };
        assert.isFalse(Board.spaceIsOnShip(shot, ships));
      });
    });
    describe("with horizontal destroyer", function() {
      beforeEach(function() {
        ships = { destroyer: { row: 0, col: 0, vertical: false } };
      });

      it("returns true with hit on anchor square", function() {
        const shot = { row: 0, col: 0 };
        assert(Board.spaceIsOnShip(shot, ships));
      });
      it("returns true with hit on non-anchor square", function() {
        const shot = { row: 0, col: 1 };
        assert(Board.spaceIsOnShip(shot, ships));
      });
      it("returns false with miss on anchor col", function() {
        const shot = { row: 1, col: 0 };
        assert.isFalse(Board.spaceIsOnShip(shot, ships));
      });
      it("returns false with miss on anchor row", function() {
        const shot = { row: 0, col: 2 };
        assert.isFalse(Board.spaceIsOnShip(shot, ships));
      });
    });
    describe("with multiple ships", function() {
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
        it("returns true with hit on ("+shot.row+","+shot.col+")", function() {
          assert(Board.spaceIsOnShip(shot, ships));
        });
      });
      fail_shots.forEach(function(shot) {
        it("returns false with miss on ("+shot.row+","+shot.col+")", function() {
          assert.isFalse(Board.spaceIsOnShip(shot, ships));
        });
      });
    });
  });
});
