/** Configuration for JSHint to recognize automatic globals: */
/* globals FlowRouter */

import { Games } from '../api/games.js';
import { getOwnBoard, getAttackBoard, fire, update } from '../api/game.js';
import { $ } from 'meteor/jquery';

import './game.html';
import './game.less';
import './board.js';

function getGame() {
  const gameID = FlowRouter.getParam('id');
  return Games.findOne({_id: gameID});
}

Template.game.helpers({
  invalid() {
    return !getGame();
  },
  game() {
    return getGame();
  },
  ownBoard() {
    const game = getGame();
    return getOwnBoard(game, game.current_player);
  },
  attackBoard() {
    const game = getGame();
    return getAttackBoard(game, game.current_player);
  }
});

Template.game.events({
  'submit form'(event) {
    event.preventDefault();

    const game = getGame();
    const selection = event.target.elements.selection.value;

    if (selection.length === 2)
    {
      const row = parseInt(selection.slice(1, 2), 10);
      const col = convertToIndex(selection.slice(0, 1));

      console.log(game.current_player + " taking shot.\nAttempting to hit position: " + selection);

      try 
      {
        const res = fire(game, row, col);
        update(game);

        switch (res)
        {
          case 'HIT':
            sAlert.success("Well done! That's a hit!", {effect: 'slide'})
            break;
          case 'MISS':
            sAlert.info("Nice try, maybe next time!", {effect: 'slide'});
            break;
          case 'SUNK':
            sAlert.success("Great shot! You sunk a ship!", {effect: 'slide'});
            break;
          default:
            sAlert.warning("The shot was recorded but we received no status! There's something fishy here...", {effect: 'slide'});
            break;
        }

        $('#selection').val("");
      }
      catch (e)
      {
        sAlert.error(e.message, {effect: 'slide'});
      }
    }
  }
});

function convertToIndex(val) {
  return 'ABCDEFGHIJ'.indexOf(val);
}
