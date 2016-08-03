import {_} from 'meteor/underscore';

import * as AI from './ai.js';
import * as Board from './board.js';
import * as Ship from './ship.js';
import {Games} from './games.js';

export function create(user, first_player=null, title=null) {
  var game = {
    created_at: new Date(),
    creator: {
      id: user._id,
      name: user.username,
      ships: Ship.create(),
      ready: false,
      shots: [],
    },
    challenger: {
      ships: Ship.create(),
      ready: false,
      shots: [],
    },
    first_player: first_player,
    state: 'created',
  };

  if(title) {
    game.title = title;
  }

  const player_names = ['creator', 'challenger'];
  if(!_.contains(player_names, game.first_player)) {
    game.first_player = _.sample(player_names);
  }

  Ship.randomize(game.creator.ships);
  Ship.randomize(game.challenger.ships);

  game._id = Games.insert(game);
  return game;
}

export function initVsAi(game, ai) {
  game.challenger.ai = ai;
  game.challenger.name = AI.getPlayer(ai).full_name;
  game.challenger.ready = true;
  game.challenger.ready_at = new Date();
  game.state = 'setup';
  return game;
}

export function initToPending(game, user) {
  game.challenger.id = user._id;
  game.challenger.name = user.username;
  game.challenger.response = 'none';
  game.state = 'pending';
  return game;
}

export function respondToPending(game, join) {
  game.challenger.response = join ? 'accept' : 'decline';
  return game;
}

export function initToWaiting(game) {
  game.state = 'waiting';
  return game;
}

export function joinWaiting(game, user) {
  game.challenger.id = user._id;
  game.challenger.name = user.username;
  game.state = 'setup';
  return game;
}

/* The following functions are intended to handle state changes and associated
 * changes in game data. */

export function checkStateCreated(game) {
  // Fool JShint into thinking we're using the parameter.
  game = game;
}

export function checkStateWaiting(game) {
  if(game && game.challenger && 'id' in game.challenger) {
    game.state = 'setup';
  }
}

export function checkStatePending(game) {
  if(game.challenger.response === 'accept') {
    delete game.challenger.response;
    game.state = 'setup';
  }
  if(game.challenger.response === 'decline') {
    delete game.challenger.response;
    game.state = 'declined';
  }
  if('remove' in game.challenger && game.challenger.remove) {
    delete game.challenger.response;
    game.state = 'declined';
  }
}

export function checkStateDeclined(game) {
  // Fool JShint into thinking we're using the parameter.
  game = game;
}

export function checkStateSetup(game) {
  if(!game.creator.ready) return;
  if(!game.challenger.ready) return;

  delete game.creator.ready;
  delete game.challenger.ready;

  game.state = 'active';

  if(!('first_player' in game)) {
    game.first_player = 'creator';
  }
  game.current_player = game.first_player;

  game.turn_number = 0;
  game.time_started = new Date();

  checkAiFirstShot(game);
}

export function checkAiFirstShot(game){
  if(game.first_player == 'challenger'){
    if (typeof game.challenger.ai != 'undefined'){
      computerShot(game);
      game.turn_number++;
      game.current_player = 'creator';
    }
  }
}

export function checkStateActive(game) {
  const creator = getAttackBoard(game, 'creator').sunk;
  const challenger = getAttackBoard(game, 'challenger').sunk;

  let winner = false;
  if(creator.length == 5) {
    winner = 'creator';
  } else if(challenger.length == 5) {
    winner = 'challenger';
  }

  if(!winner) return;

  game.state = 'ended';
  game.winner = winner;
  game.time_finished = new Date();

  delete game.current_player;
}

export function checkStateEnded(game) {
  // Fool JShint into thinking we're using the parameter.
  game = game;
}

export function checkState(game) {
  const states = {
    // created = Game has been created but not fully initialized yet. Should go
    // to waiting, pending, declined, or setup next.
    created: checkStateCreated,

    // waiting - Game listed in the waiting room. Waiting for another player to
    // join. Should go to setup next.
    waiting: checkStateWaiting,

    // pending - Creator has invited someone and is waiting for them to accept
    // or decline (i.e., the invite is pending). Should go to declined or setup
    // next.
    pending: checkStatePending,

    // declined - Creator invited someone but they declined. This is a terminal
    // state.
    declined: checkStateDeclined,

    // setup - Game is in setup phase, which means players can move their ships
    // around. Should go to active next.
    setup: checkStateSetup,

    // active - The game is on! Players may fire at one another. Should go to
    // ended next.
    active: checkStateActive,

    // ended - The game has concluded, either because a player sunk all ships
    // or because a player forfeit. This is a terminal state.
    ended: checkStateEnded,
  };

  if(game.state in states) {
    states[game.state](game);
  } else {
    throw Meteor.Error('invalid-state', 'The game has an invalid state');
  }
}

export function remove(game, player) {
  if(opponentRemoved(game, player)) {
    Games.remove(game._id);
  } else {
    game[player].remove = true;
    if(game.state === 'active' || game.state === 'setup') {
      resign(game, player);
    }
    update(game);
  }
}

export function opponentRemoved(game, player) {
  /* jshint -W086 */
  const opponent = oppositePlayer(player);
  switch(game.state) {
    case 'created':
    case 'waiting':
      return true;
    case 'pending':
    case 'declined':
      if(player === 'creator') {
        return true;
      } else {
        return ('remove' in game[opponent] && game[opponent].remove);
      }
    default:
      if('ai' in game[opponent]) {
        return true;
      }
      return ('remove' in game[opponent] && game[opponent].remove);
  }
  /* jshint +W086 */
}

export function resign(game, player) {
  const opponent = oppositePlayer(player);

  game.resignation = player;
  game.state = 'ended';
  game.winner = opponent;
  game.time_finished = new Date();

  delete game.current_player;
}

export function checkAndUpdate(game) {
  checkState(game);
  update(game);
}

export function update(game) {
  Games.update( {_id: game._id}, game);
}

export function saveShot(shot, shots) {
  shot.time = new Date();
  shots.push(shot);
}

export function computerShot(game) {
  const ai = AI.getPlayer(game.challenger.ai);
  let state = {};
  if ('computer_state' in game) state = game.computer_state;
  const board = getAttackBoard(game, 'challenger');
  const shot = ai.makeMove(board, state);
  saveShot(shot, game.challenger.shots);
  game.computer_state = state;
}

export function checkShotUnique(shot, previous_shots)
{
  for(let i = 0; i < previous_shots.length; i++)
  {
    if((shot.row == previous_shots[i].row) &&
      (shot.col == previous_shots[i].col))
    {
      return false;
    }
  }
  return true;
}

export function playerShot(game, player, row, col) {
  if (typeof game[player] == 'undefined')
  {
    game[player] = {};
  }

  if (typeof game[player].shots == 'undefined')
  {
    game[player].shots = [];
  }

  var shot = {row: row, col: col};
  if(!checkShotUnique(shot, game[player].shots))
  {
    throw "Shot Exists";
  }

  saveShot(shot, game[player].shots);
}

export function fire(game, row, col) {
  let player = game.current_player;
  playerShot(game, player, row, col);
  game.turn_number += 1;

  checkState(game);
  if(game.state !== 'active') return;

  if ('ai' in game.challenger) {
    computerShot(game);
    game.turn_number += 1;
  } else {
    game.current_player = oppositePlayer(player);
  }
}

// only exported for testing, don't call this
export function oppositePlayer(user){
  var opposite_user = "";
  if(user == "creator")
  {
    opposite_user = "challenger";
  }
  else
  {
    opposite_user = "creator";
  }
  return opposite_user;
}

export function getOwnBoard(game, user) {
  const board = Board.makeEmptyBoard();
  Board.addShips(board, game[user].ships, true);
  Board.addShots(board, game[oppositePlayer(user)].shots, game[user].ships);
  const sunk = Board.checkSunk(board, game[user].ships);
  return {squares: board, sunk: sunk};
}

export function getAttackBoard(game, user) {
  const board = Board.makeEmptyBoard();
  Board.addShips(board, game[oppositePlayer(user)].ships, false);
  Board.addShots(board, game[user].shots, game[oppositePlayer(user)].ships);
  const sunk = Board.checkSunk(board, game[oppositePlayer(user)].ships);
  return {squares: board, sunk: sunk};
}

export function getUserPlayer(game, user) {
  if(!user) return false;
  if(user._id === game.creator.id) return 'creator';
  if(user._id === game.challenger.id) return 'challenger';
  return false;
}

export function getTitle(game) {
  if('title' in game) {
    return game.title;
  }
  return 'Unnamed Game ' + game._id.substring(0, 6);
}

export function userIsPlayer(game, user) {
  if(!user) return false;
  if(user._id === game.creator.id) return true;
  if(user._id === game.challenger.id) return true;
  return false;
}

export function userCanFire(game, user) {
  if(!user) return false;
  if(game.state !== 'active') return false;
  if(!userIsPlayer(game, user)) return false;
  const player = getUserPlayer(game, user);
  return game.current_player === player;
}

export function userCanSetup(game, user) {
  if(!user) return false;
  if(game.state !== 'setup') return false;
  if(!userIsPlayer(game, user)) return false;
  const player = getUserPlayer(game, user);
  return !game[player].ready;
}

export function userCanJoin(game, user) {
  if(!user) return false;
  if(game.state !== 'waiting') return false;
  return user._id !== game.creator.id;
}
