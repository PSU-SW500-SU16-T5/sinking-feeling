
import * as Board from '/imports/api/board.js';

import './home.html';
import './home.less';
import './board.js';

Template.home.helpers({
  fake() {
    const squares = Board.makeEmptyBoard();
    const game = {
      state: 'ended',
    };

    squares[0][0].state = 'M';
    squares[1][1].state = 'M';
    squares[3][2].state = 'M';

    squares[2][2] = {state: 'X', ship: 'Left'};
    squares[2][3] = {state: 'X', ship: 'Horizontal'};
    squares[2][4] = {state: 'X', ship: 'Right'};

    squares[5][5].state = 'M';
    squares[6][6].state = 'M';
    squares[7][7].state = 'M';
    squares[8][8].state = 'M';
    squares[9][9].state = 'M';

    squares[6][0].state = 'M';
    squares[7][1].state = 'H';
    squares[7][2].state = 'M';
    squares[8][1].state = 'H';

    return { squares, game };
  },
});