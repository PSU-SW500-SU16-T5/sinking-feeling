import { assert } from 'meteor/practicalmeteor:chai';
import * as Ship from './ship.js';
import * as Log from './log.js';

describe('log', function() {
  describe('create log', function() {
    const start = new Date(2016, 01, 01, 01, 01, 01);
    function startGame(game) {
      game.created_at = start;
      game.state = 'setup';
      return game;
    }

    const creator_ready = new Date(2016, 01, 01, 01, 01, 02);
    function creatorReady(game) {
      game.creator = {};
      game.creator.ready = true;
      game.creator.ready_at = creator_ready;
      return game;
    }

    const challenger_ready = new Date(2016, 01, 01, 01, 01, 03);
    function challengerReady(game) {
      game.challenger = {};
      game.challenger.ready = true;
      game.challenger.ready_at = challenger_ready;
      return game;
    }

    const setup_complete = new Date(2016, 01, 01, 01, 01, 04);
    function setupShips(game) {
      game.creator.ships = Ship.create();
      game.challenger.ships = Ship.create();
      game.time_started = setup_complete;
      game.state = 'active';
      game.first_player = 'creator';
      game.creator.shots = [];
      game.challenger.shots = [];
      game.turn_number = 0;
      return game;
    }

    function prepGame(game) {
      return setupShips(challengerReady(creatorReady(startGame(game))));
    }

    function shot(game, player, shot) {
      game[player].shots.push(shot);
      game.turn_number++;
    }

    const first_shot = new Date(2016, 01, 01, 01, 02, 01);
    function firstShot(game) {
      shot(game, 'creator', {row: 9, col: 9, time: first_shot});
      return game;
    }
    function firstShotHit(game) {
      shot(game, 'creator', {row: 0, col: 0, time: first_shot});
      return game;
    }

    const pair = [new Date(2016, 01, 01, 01, 02, 02), new Date(2016, 01, 01, 01, 02, 03)];
    function pairOfMisses(game) {
      shot(game, 'creator', {row: 9, col: 8, time: pair[0]});
      shot(game, 'challenger', {row: 9, col: 8, time: pair[0]});
      return game;
    }

    it('created game', function() {
      const game = startGame({});

      var value = Log.getLog(game);

      assert.lengthOf(value, 1);
      assert.equal(value[0].time, start);
      assert.equal(value[0].event, 'created');
    });
    it('creator ready', function() {
      const game = creatorReady(startGame({}));

      var value = Log.getLog(game);

      assert.lengthOf(value, 2);
      assert.equal(value[1].time, creator_ready);
      assert.equal(value[1].event, 'creator ready');
    });
    it('both ready', function() {
      const game = challengerReady(creatorReady(startGame({})));

      var value = Log.getLog(game);

      assert.lengthOf(value, 3);
      assert.equal(value[1].time, creator_ready);
      assert.equal(value[1].event, 'creator ready');
      assert.equal(value[2].time, challenger_ready);
      assert.equal(value[2].event, 'challenger ready');
    });
    it('challenger ready', function() {
      const game = challengerReady(startGame({}));

      var value = Log.getLog(game);

      assert.lengthOf(value, 2);
      assert.equal(value[1].time, challenger_ready);
      assert.equal(value[1].event, 'challenger ready');
    });
    it('both ready other order', function() {
      const game = challengerReady(creatorReady(startGame({})));
      game.challenger.ready_at = new Date(2016, 01, 01, 01, 01, 06);
      game.creator.ready_at = new Date(2016, 01, 01, 01, 01, 07);

      var value = Log.getLog(game);

      assert.lengthOf(value, 3);
      assert.equal(value[1].event, 'challenger ready');
      assert.equal(value[2].event, 'creator ready');
    });
    it('game active no shots', function() {
      var log = Log.getLog(prepGame({}));

      assert.lengthOf(log, 4);
      assert.equal(log[3].time, setup_complete);
      assert.equal(log[3].event, 'started');
    });
    it('miss taken', function() {
      var log = Log.getLog(firstShot(prepGame({})));

      assert.lengthOf(log, 5);
      assert.equal(log[4].time, first_shot);
      assert.equal(log[4].event, 'shot');
      assert.equal(log[4].initiator, 'creator');
      assert.equal(log[4].result, 'miss');
      assert.equal(log[4].shot.row, 9);
      assert.equal(log[4].shot.col, 9);
      assert.equal(log[4].shot.time, first_shot);
    });
    it('multiple misses taken', function() {
        var log = Log.getLog(pairOfMisses(firstShot(prepGame({}))));

        assert.lengthOf(log, 7);
        assert.equal(log[5].initiator, 'challenger');
        assert.equal(log[6].initiator, 'creator');
    });
    it('hit taken', function() {
      var log = Log.getLog(firstShotHit(prepGame({})));

      assert.lengthOf(log, 5);
      assert.equal(log[4].time, first_shot);
      assert.equal(log[4].event, 'shot');
      assert.equal(log[4].initiator, 'creator');
      assert.equal(log[4].result, 'hit');
    });
    it('hits and misses', function(){
      var game = firstShot(prepGame({}));
      var same_time = Date(2016, 01, 01, 01, 02, 07);
      shot(game, 'challenger', {row: 9, col: 8, time: same_time});
      shot(game, 'creator', {row: 9, col: 8, time: same_time});
      shot(game, 'challenger', {row: 9, col: 7, time: same_time});
      shot(game, 'creator', {row: 9, col: 7, time: same_time});
      shot(game, 'challenger', {row: 9, col: 6, time: same_time});
      shot(game, 'creator', {row: 0, col: 0, time: same_time});

      var log = Log.getLog(game);

      assert.lengthOf(log, 11);
      assert.equal(log[5].initiator, 'challenger');
      assert.equal(log[5].result, 'miss');
      assert.equal(log[10].result, 'hit');
    });
    it('shots sunk', function() {
      var game = firstShot(prepGame({}));
      var same_time = Date(2016, 01, 01, 01, 02, 07);
      shot(game, 'challenger', {row: 9, col: 8, time: same_time});
      shot(game, 'creator', {row: 0, col: 1, time: same_time});
      shot(game, 'challenger', {row: 9, col: 7, time: same_time});
      shot(game, 'creator', {row: 1, col: 1, time: same_time});
      shot(game, 'challenger', {row: 9, col: 6, time: same_time});
      shot(game, 'creator', {row: 2, col: 1, time: same_time});
      shot(game, 'challenger', {row: 9, col: 4, time: same_time});
      shot(game, 'creator', {row: 3, col: 1, time: same_time});

      var log = Log.getLog(game);

      assert.equal(log[log.length - 1].result, 'sunk');
    });
    it('game won', function() {
      var game = firstShot(prepGame({}));
      var same_time = Date(2016, 01, 01, 01, 02, 07);
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 0, col: 0, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 1, col: 0, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 2, col: 0, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 3, col: 0, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 4, col: 0, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 0, col: 1, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 1, col: 1, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 2, col: 1, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 3, col: 1, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 0, col: 2, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 1, col: 2, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 2, col: 2, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 0, col: 3, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 1, col: 3, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 2, col: 3, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 0, col: 4, time: same_time});
      shot(game, 'challenger', {row: 9, col: 9, time: same_time});
      shot(game, 'creator', {row: 1, col: 4, time: same_time});

      var log = Log.getLog(game);

      assert.equal(log[log.length - 1].result, 'all ships sunk');
    });
    it('game ended possibly not won', function() {
      var ended_at = new Date(2016, 01, 01, 01, 03, 01);
      var game = firstShot(prepGame({}));
      game.ended_at = ended_at;
      game.state = 'ended';

      var log = Log.getLog(game);

      assert.equal(log[log.length - 1].event, 'ended');
      assert.equal(log[log.length - 1].time, ended_at);
    });
  });
  describe('player order', function() {
    it('creator first', function() {
      const game = {first_player: 'creator'};

      const result = Log.playerOrder(game);

      assert.lengthOf(result, 2);
      assert.equal(result[0], 'creator');
      assert.equal(result[1], 'challenger');
    });
    it('creator second', function() {
      const game = {first_player: 'challenger'};

      const result = Log.playerOrder(game);

      assert.lengthOf(result, 2);
      assert.equal(result[0], 'challenger');
      assert.equal(result[1], 'creator');
    });
  });
  describe('determine result', function() {
    it('miss very short check', function() {
      var shot = {row: 1, col: 1};
      var status = [{length: 1, row: 0, col: 0, vertical: true, hits: 0}];

      var output = Log.determineResult(shot, status);

      assert.equal(output, 'miss');
    });
    it('hit very short check', function() {
      var shot = {row: 0, col: 0};
      var status = [{length: 2, row: 0, col: 0, vertical: true, hits: 0}];

      var output = Log.determineResult(shot, status);

      assert.equal(output, 'hit');
    });
    it('last hit to sink', function() {
      var shot = {row: 0, col: 0};
      var status = [
        {length: 2, row: 0, col: 0, vertical: true, hits: 1},
        {length: 2, row: 0, col: 1, vertical: true, hits: 1},
      ];

      var output = Log.determineResult(shot, status);

      assert.equal(output, 'sunk');
    });
    it('last hit to sink all', function() {
      var shot = {row: 0, col: 0};
      var status = [
        {length: 2, row: 0, col: 0, vertical: true, hits: 1},
        {length: 2, row: 0, col: 1, vertical: true, hits: 2},
      ];

      var output = Log.determineResult(shot, status);

      assert.equal(output, 'all ships sunk');
    });
  });
});
