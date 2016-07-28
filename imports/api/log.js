import * as Ship from './ship.js';
import * as Square from './square.js';

// The format of the log will look like this (depending on when in the game it
// is being shown).
// [
//   {event: 'created', time: ....},
//   {event: 'creator ready', time: ....},
//   {event: 'challenger ready', time: ....},
//   {event: 'started', time: ....},
//   {event: 'shot', initiator: 'creator', result: 'miss', time: ....},
//   {event: 'shot', initiator: 'challenger', result: 'miss', time: ....},
//   {event: 'shot', initiator: 'creator', result: 'hit', time: ....},
//   {event: 'shot', initiator: 'challenger', result: 'miss', time: ....},
//   {event: 'shot', initiator: 'creator', result: 'sunk', time: ....},
//   {event: 'shot', initiator: 'challenger', result: 'miss', time: ....},
//   {event: 'shot', initiator: 'creator', result: 'hit', time: ....},
//   {event: 'shot', initiator: 'challenger', result: 'miss', time: ....},
//   {event: 'shot', initiator: 'creator', result: 'hit', time: ....},
//   {event: 'shot', initiator: 'challenger', result: 'miss', time: ....},
//   {event: 'shot', initiator: 'creator', result: 'all ships sunk', time: ....},
//   {event: 'ended', time: ....}
// ]

export function getLog(game) {
  const log = [];
  if (typeof game.created_at != 'undefined') {
    log.push({time: game.created_at, event: 'created'});
    usersReady(game, log);
    if ((game.state == 'active') || (game.state == 'ended')) {
      log.push({time: game.time_started, event: 'started'});
      logShots(game, log);
      if (game.state == 'ended'){
        log.push({time: game.time_finished, event: 'ended'});
      }
    }
  }
  return log;
}

function usersReady(game, log) {
  if(game.creator && game.creator.ready &&
    game.challenger && game.challenger.ready) {
    if(game.creator.ready_at <= game.challenger.ready_at) {
      log.push({time: game.creator.ready_at, event: 'creator ready'});
      log.push({time: game.challenger.ready_at, event: 'challenger ready'});
    } else {
      log.push({time: game.challenger.ready_at, event: 'challenger ready'});
      log.push({time: game.creator.ready_at, event: 'creator ready'});
    }
  } else if (game.creator && game.creator.ready){
    log.push({time: game.creator.ready_at, event: 'creator ready'});
  } else if (game.challenger && game.challenger.ready){
    log.push({time: game.challenger.ready_at, event: 'challenger ready'});
  }
}

export function logShots(game, log) {
  const player_order = playerOrder(game);
  const ship_status = [
    makeStatus(game[player_order[0]].ships),
    makeStatus(game[player_order[1]].ships)
  ];
  for(let i = 0; i < game.turn_number; i++) {
    var shooter = player_order[i%2];
    var status = ship_status[(i+1)%2];
    var shot = game[shooter].shots[Math.floor(i/2)];

    var result = determineResult(shot, status);
    game.debug_status = status;
    game.debug_shooter = shooter;

    log.push({time: shot.time, event: 'shot', initiator: shooter,
      result: result, shot: shot, turn: i});
  }
}

export function playerOrder(game) {
  if (game.first_player == 'creator')
  {
    return ['creator', 'challenger'];
  }
  return ['challenger', 'creator'];
}

function makeStatus(ships) {
  var status = [];
  for (var type in ships) {
    status.push({length: Ship.lengths[type], row: ships[type].row,
      col: ships[type].col, vertical: ships[type].vertical, hits: 0});
  }
  return status;
}

export function determineResult(shot, status) {
  var result = 'miss';
  status.forEach(function(ship) {
    if(Square.spaceIsOnAShip(shot, ship, ship.length)) {
      result = 'hit';
      ship.hits++;
      if(ship.hits >= ship.length){
        result = 'sunk';
      }
      return;
    }
  });

  var all_sunk = true;
  status.forEach(function(ship) {
    if(ship.hits != ship.length) {
      all_sunk = false;
    }
  });

  if(all_sunk){
    result = 'all ships sunk';
  }

  return result;
}
