import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import * as Ship from './ship.js';
import * as Game from './game.js';
import * as Util from './util.js';
import {checkBoard} from './board.test.js';
import {Games} from './games.js';

Meteor.methods({
  'test.resetDatabase': () => resetDatabase(),
});

describe('api/game.js', function() {
  describe('create', function() {
    let user = {};
    beforeEach(function() {
      Meteor.call('test.resetDatabase');
      user = {_id: 'test', username: 'Test User'};
    });
    it('should return an object', function() {
      assert.isObject(Game.create(user));
    });
    it('should setup players correctly', function() {
      const game = Game.create(user);

      ["creator", "challenger"].forEach(function(player) {
        assert.isObject(game[player]);
        assert.isObject(game[player].ships);
      });
    });
    it('should set created_at properly', function() {
      const game = Game.create(user);
      const now = new Date();

      assert.equal(now.getDate(), game.created_at.getDate());
      assert.equal(now.getMonth(), game.created_at.getMonth());
      assert.equal(now.getYear(), game.created_at.getYear());
      assert.equal(now.getHours(), game.created_at.getHours());
      assert.equal(now.getMinutes(), game.created_at.getMinutes());
    });
    it('should initialize creator', function() {
      const game = Game.create(user);

      assert.equal(user._id, game.creator.id);
      assert.equal(user.username, game.creator.name);
    });
    it('should get saved to the database', function(){
      Game.create(user);

      const result = Games.findOne({"creator.id": user._id});

      assert.equal(user.username, result.creator.name);
    });
    it('should populate ships for both players', function(){
      const game = Game.create(user);

      Ship.types.forEach(function(type){
        assert.isDefined(game.creator.ships[type]);
        assert.isDefined(game.challenger.ships[type]);
      });
    });
    it('should set first player to random', function(){
      const runs = 30;
      const results = [];

      for(let i = 0; i < runs; i++){
        var game = Game.create(user);
        results.push(game.first_player);
      }

      assert.include(results, 'creator');
      assert.include(results, 'challenger');
    });
    it('should disregard invalid player choice', function() {
      const first_test_value = 'this is the test value for the first player';
      const game = Game.create(user, first_test_value);
      assert.property(game, 'first_player');
      assert.include(['creator','challenger'], game.first_player);
    });
    it('should use the provided player as first if creator', function() {
      for(let i = 0; i < 30; i++) {
        const game = Game.create(user, 'creator');
        assert.propertyVal(game, 'first_player', 'creator');
      }
    });
    it('should use the provided player as first if challenger', function() {
      for(let i = 0; i < 30; i++) {
        const game = Game.create(user, 'challenger');
        assert.propertyVal(game, 'first_player', 'challenger');
      }
    });
    it('should not set game.title if no title is provided', function() {
      const game = Game.create(user);
      assert.notProperty(game, 'title');
    });
    it('should set game.title if title is provided', function() {
      const title = 'game name';
      const game = Game.create(user, null, title);
      assert.propertyVal(game, 'title', title);
    });
    it('should not set game.title if provided title is empty', function() {
      const game = Game.create(user, null, '');
      assert.notProperty(game, 'title');
    });
  });

  describe('initVsAi', function() {
    let game;
    beforeEach(function() {
      game = { challenger: {} };
    });
    it('should set challenger.ai', function() {
      Game.initVsAi(game, 'sue');
      assert.propertyVal(game.challenger, 'ai', 'sue');
    });
    it('should set challenger.name', function() {
      Game.initVsAi(game, 'sue');
      assert.propertyVal(game.challenger, 'name', 'Sequential Sue');
    });
    it('should set challenger.ready to true', function() {
      Game.initVsAi(game, 'sue');
      assert.propertyVal(game.challenger, 'ready', true);
    });
    it('should set challenger.ready_at', function() {
      Game.initVsAi(game, 'sue');
      assert.property(game.challenger, 'ready_at');
    });
    it('should set state to setup', function() {
      Game.initVsAi(game, 'sue');
      assert.propertyVal(game, 'state', 'setup');
    });
  });

  describe('initToPending', function() {
    let game, user;
    beforeEach(function() {
      game = { challenger: {} };
      user = { _id: 'test', username: 'Test Challenger' };
    });
    it('should set challenger.id', function() {
      Game.initToPending(game, user);
      assert.propertyVal(game.challenger, 'id', user._id);
    });
    it('should set challenger.name', function() {
      Game.initToPending(game, user);
      assert.propertyVal(game.challenger, 'name', user.username);
    });
    it('should set challenger.response to none', function() {
      Game.initToPending(game, user);
      assert.propertyVal(game.challenger, 'response', 'none');
    });
    it('should set state to pending', function() {
      Game.initToPending(game, user);
      assert.propertyVal(game, 'state', 'pending');
    });
  });

  describe('respondToPending', function() {
    let game;
    beforeEach(function() {
      game = { challenger: {} };
    });
    it('should set challenger.response to accept when join is true', function() {
      Game.respondToPending(game, true);
      assert.propertyVal(game.challenger, 'response', 'accept');
    });
    it('should set challenger.response to decline when join is false', function() {
      Game.respondToPending(game, false);
      assert.propertyVal(game.challenger, 'response', 'decline');
    });
  });

  describe('initToWaiting', function() {
    let game;
    beforeEach(function() {
      game = {};
    });
    it('should set state to waiting', function() {
      Game.initToWaiting(game);
      assert.propertyVal(game, 'state', 'waiting');
    });
  });

  describe('joinWaiting', function() {
    let game, user;
    beforeEach(function() {
      game = { challenger: {} };
      user = { _id: 'test', username: 'Test Challenger' };
    });
    it('should set challenger.id', function() {
      Game.joinWaiting(game, user);
      assert.propertyVal(game.challenger, 'id', user._id);
    });
    it('should set challenger.name', function() {
      Game.joinWaiting(game, user);
      assert.propertyVal(game.challenger, 'name', user.username);
    });
    it('should set state to setup', function() {
      Game.joinWaiting(game, user);
      assert.propertyVal(game, 'state', 'setup');
    });
  });

  describe('checkStateCreated', function() {
    it('should not fail', function() {
      Game.checkStateCreated({});
    });
  });

  describe('checkStateWaiting', function() {
    it('should not fail', function() {
      Game.checkStateWaiting({});
    });
    it('should trigger on the right conditions', function() {
      const game = { challenger: { id: 'test' } };
      Game.checkStateWaiting(game);
      assert.propertyVal(game, 'state', 'setup');
    });
  });

  describe('checkStatePending', function() {
    let game;
    beforeEach(function() {
      game = {
        challenger: {
          response: 'none',
        },
      };
    });
    it('should not fail', function() {
      Game.checkStatePending(game);
    });
    it('should trigger setup on accept', function() {
      game.challenger.response = 'accept';
      Game.checkStatePending(game);
      assert.propertyVal(game, 'state', 'setup');
      assert.notProperty(game.challenger, 'response');
    });
    it('should trigger declined on decline', function() {
      game.challenger.response = 'decline';
      Game.checkStatePending(game);
      assert.propertyVal(game, 'state', 'declined');
      assert.notProperty(game.challenger, 'response');
    });
    it('should trigger declined if removed', function() {
      game.challenger.remove = true;
      Game.checkStatePending(game);
      assert.propertyVal(game, 'state', 'declined');
      assert.notProperty(game.challenger, 'response');
    });
  });

  describe('checkStateDeclined', function() {
    it('should not fail', function() {
      Game.checkStateDeclined({});
    });
  });

  describe('checkStateSetup', function() {
    context('when neither player is ready', function() {
      it('should change nothing', function() {
        const exp = {
          state: 'waiting',
          creator: {
            ready: false,
          },
          challenger: {
            ready: false,
          },
        };
        const game = {
          state: 'waiting',
          creator: {
            ready: false,
          },
          challenger: {
            ready: false,
          },
        };
        Game.checkStateSetup(game);
        assert.deepEqual(exp, game);
      });
    });
    context('when one player is ready', function() {
      it('should change nothing when creator ready', function() {
        const exp = {
          state: 'waiting',
          creator: {
            ready: true,
          },
          challenger: {
            ready: false,
          },
        };
        const game = {
          state: 'waiting',
          creator: {
            ready: true,
          },
          challenger: {
            ready: false,
          },
        };
        Game.checkStateSetup(game);
        assert.deepEqual(exp, game);
      });
      it('should change nothing when challenger ready', function() {
        const exp = {
          state: 'waiting',
          creator: {
            ready: false,
          },
          challenger: {
            ready: true,
          },
        };
        const game = {
          state: 'waiting',
          creator: {
            ready: false,
          },
          challenger: {
            ready: true,
          },
        };
        Game.checkStateSetup(game);
        assert.deepEqual(exp, game);
      });
    });
    context('when both players are ready', function() {
      let game = {};
      beforeEach(function() {
        game = {
          state: 'waiting',
          creator: {
            ready: true,
          },
          challenger: {
            ready: true,
          },
        };
      });
      it('should change state to active', function() {
        Game.checkStateSetup(game);
        assert.equal(game.state, 'active');
      });
      it('should remove creator.ready', function() {
        Game.checkStateSetup(game);
        assert.notProperty(game.creator, 'ready');
      });
      it('should remove challenger.ready', function() {
        Game.checkStateSetup(game);
        assert.notProperty(game.challenger, 'ready');
      });
      it('should populate first_player as creator if missing', function() {
        Game.checkStateSetup(game);
        assert.propertyVal(game, 'first_player', 'creator');
      });
      it('should not change first_player if present', function() {
        game.first_player = 'challenger';
        Game.checkStateSetup(game);
        assert.propertyVal(game, 'first_player', 'challenger');
      });
      it('should set current_player to first_player', function() {
        game.first_player = 'challenger';
        Game.checkStateSetup(game);
        assert.propertyVal(game, 'current_player', 'challenger');
      });
      it('should add time_started', function() {
        Game.checkStateSetup(game);
        assert.property(game, 'time_started');
      });
      it('should add turn_number as 0', function() {
        Game.checkStateSetup(game);
        assert.propertyVal(game, 'turn_number', 0);
      });
    });
  });

  describe('checkAiFirstShot', function() {
    let game = {};
    beforeEach(function() {
      game = {
        first_player: 'creator',
        turn_number: 0,
        current_player: 'creator',
        challenger: {},
      };
    });
    it('should proceed normally for creator as first player', function(){
      Game.checkAiFirstShot(game);
      assert.equal(game.turn_number, 0);
    });
    it('should proceed normally with no ai', function(){
      game.first_player = 'challenger';
      Game.checkAiFirstShot(game);
      assert.equal(game.turn_number, 0);
    });
    it('should shoot when ai challenger first', function() {
      game.first_player = 'challenger';
      game.current_player = 'challenger';
      game.challenger.ai = 'a value';

      // I couldn't get this test to work, as the function override didn't take
      // effect correctly. The only other way is to create a full AI.
      // var saveComputerShot = Game.computerShot;
      // var shotTaken = false;
      // debugger;
      // Game.computerShot = function(game){
      //   shotTaken = true;
      // };
      //
      // Game.checkAiFirstShot(game);
      //
      // assert.equal(game.turn_number, 1);
      // assert.equal(game.current_player, 'creator');
      // assert.true(shotTaken);
      //
      // Game.computerShot = saveComputerShot;
    });
  });

  describe('checkStateActive', function() {
    context('when there are no sunk ships', function() {
      it('should change nothing', function() {
        const exp = {
          state: 'active',
          current_player: 'creator',
          creator: {
            ships: Ship.create(),
            shots: [],
          },
          challenger: {
            ships: Ship.create(),
            shots: [],
          },
        };
        const game = Util.clone(exp);
        Game.checkStateActive(game);
        assert.deepEqual(exp, game);
      });
    });
    context('when some but not all ships are sunk', function() {
      it('should change nothing', function() {
        const exp = {
          state: 'active',
          current_player: 'creator',
          creator: {
            ships: Ship.create(),
            shots: [
              {row: 0, col: 0},
              {row: 1, col: 0},
              {row: 2, col: 0},
              {row: 3, col: 0},
              {row: 4, col: 0},
            ],
          },
          challenger: {
            ships: Ship.create(),
            shots: [
              {row: 0, col: 0},
              {row: 1, col: 0},
              {row: 2, col: 0},
              {row: 3, col: 0},
              {row: 4, col: 0},
            ],
          },
        };
        const game = Util.clone(exp);
        Game.checkStateActive(game);
        assert.deepEqual(exp, game);
      });
    });
    const winners = ['creator', 'challenger'];
    winners.forEach(function(winner) {
      context('when '+winner+' has won', function() {
        let game = {};
        beforeEach(function() {
          game = {
            state: 'active',
            current_player: 'creator',
            creator: {
              ships: Ship.create(),
              shots: [
                {row: 0, col: 0},
                {row: 0, col: 1},
                {row: 0, col: 2},
                {row: 0, col: 3},
                {row: 0, col: 4},
                {row: 1, col: 0},
                {row: 1, col: 1},
                {row: 1, col: 2},
                {row: 1, col: 3},
                {row: 1, col: 4},
                {row: 2, col: 0},
                {row: 2, col: 1},
                {row: 2, col: 2},
                {row: 2, col: 3},
                {row: 3, col: 0},
                {row: 3, col: 1},
                {row: 4, col: 0},
              ],
            },
            challenger: {
              ships: Ship.create(),
              shots: [],
            },
          };

          if(winner == 'challenger') {
            const temp = game.challenger;
            game.challenger = game.creator;
            game.creator = temp;
          }
        });
        it('should change state to ended', function() {
          Game.checkStateActive(game);
          assert.equal(game.state, 'ended');
        });
        it('should remove current_player', function() {
          Game.checkStateActive(game);
          assert.notProperty(game, 'current_player');
        });
        it('should add winner', function() {
          Game.checkStateActive(game);
          assert.propertyVal(game, 'winner', winner);
        });
        it('should add time_finished', function() {
          Game.checkStateActive(game);
          assert.property(game, 'time_finished');
        });
      });
    });
  });

  describe('checkStateEnded', function() {
    it('should not fail', function() {
      Game.checkStateEnded({});
    });
  });

  describe('update', function() {
    let user = {};
    beforeEach(function(){
      Meteor.call('test.resetDatabase');
      user = {_id: 'test', username: 'Test User'};
    });
    it('should update as expected', function(){
      const game = Game.create(user);
      const gameID = game._id;

      assert.notProperty(game, 'theanswer');

      game.theanswer = 42;
      Game.update(game);

      const result = Games.findOne({_id: gameID});
      assert.propertyVal(result, 'theanswer', 42);
    });
  });

  describe('saveShot', function() {
    it('shot added to array', function() {
      const shots = [];
      const shot = {row: 0, col: 0};

      Game.saveShot(shot, shots);

      assert.equal(shots[0].row, shot.row);
      assert.equal(shots[0].col, shot.col);
    });
    it('shot in correct array location', function() {
      const shots = [];
      const shot1 = {row: 0, col: 0};
      const shot2 = {row: 1, col: 1};

      Game.saveShot(shot1, shots);
      Game.saveShot(shot2, shots);

      assert.equal(shots[0].row, shot1.row);
      assert.equal(shots[0].col, shot1.col);
      assert.equal(shots[1].row, shot2.row);
      assert.equal(shots[1].col, shot2.col);
    });
    it('time in shot', function() {
      const shots = [];
      const shot = {row: 0, col: 0};
      const allowed_time = 100; // milliseconds

      var now = new Date();
      Game.saveShot(shot, shots);

      assert.isBelow(Math.abs(now - shots[0].time), allowed_time);
    });
  });

  describe('computerShot', function() {
    it('first shot', function() {
      const game = {
        creator: {
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        challenger: {
          ai: 'sue',
          shots: [],
        },
        computer_state: {},
      };
      Game.computerShot(game);
      assert.equal(1, game.challenger.shots.length);
      assert.equal(0, game.challenger.shots[0].row);
      assert.equal(0, game.challenger.shots[0].col);
    });
    it('second shot', function() {
      const game = {
        creator: {
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        challenger: {
          ai: 'sue',
          shots: [{row: 0, col: 0}],
        },
        computer_state: {},
      };
      Game.computerShot(game);
      assert.equal(2, game.challenger.shots.length);
      assert.equal(0, game.challenger.shots[0].row);
      assert.equal(0, game.challenger.shots[0].col);
    });
    it('includes the time', function () {
      const game = {
        creator: {
          ships: {},
        },
        challenger: {
          ai: 'sue',
          shots: [],
        },
      };

      Game.computerShot(game);

      assert.typeOf(game.challenger.shots[0].time, 'Date');
    });
  });

  describe('checkShotUnique', function() {
    it('first shot', function(){
      const shot = {row: 0, col: 0};
      const shots = [];

      assert.isTrue(Game.checkShotUnique(shot, shots));
    });
    it('second shot exists', function() {
      const shot = {row: 0, col: 0};
      const shots = [shot];

      assert.isFalse(Game.checkShotUnique(shot, shots));
    });
    it('multiple shots exists', function() {
      const shot = {row: 0, col: 0};
      const shots = [{row: 1, col: 1}, shot];

      assert.isFalse(Game.checkShotUnique(shot, shots));
    });
  });

  describe('playerShot', function() {
    it('added to array', function () {
      var row = 7;
      var col = 8;
      const game = {creator: {shots: [{row: 0, col: 0}]}};

      Game.playerShot(game, "creator", row, col);

      assert.equal(2, game.creator.shots.length);
      assert.equal(row, game.creator.shots[1].row);
      assert.equal(col, game.creator.shots[1].col);
    });
    it('challenger shot', function () {
      var row = 7;
      var col = 8;
      var player = "challenger";
      const game = {};
      game[player] = {shots: [{row: 0, col: 0}]};

      Game.playerShot(game, player, row, col);

      assert.equal(2, game[player].shots.length);
      assert.equal(row, game[player].shots[1].row);
      assert.equal(col, game[player].shots[1].col);
    });
    it('first shot', function () {
      var row = 7;
      var col = 8;
      var player = "creator";
      const game = {};

      Game.playerShot(game, player, row, col);

      assert.equal(1, game[player].shots.length);
    });
    it('shot exists', function() {
      const row = 1;
      const col = 1;
      const game = {creator: {shots: [{row: row, col: col}]}};

      assert.throw(function() {
        Game.playerShot(game, "creator", row, col);
      }, "Shot Exists");
    });
    it('includes the time', function () {
      const game = {creator: {shots: []}};

      Game.playerShot(game, "creator", 0, 0);

      assert.typeOf(game.creator.shots[0].time, 'Date');
    });
  });

  describe('fire', function() {
    it('works as expected for creator in two-player', function() {
      const game = {
        state: 'active',
        creator: {
          shots: [],
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        challenger: {
          shots: [],
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        current_player: 'creator',
        turn_number: 0,
      };

      Game.fire(game, 0, 0);

      assert.equal(game.creator.shots[0].row, 0);
      assert.equal(game.creator.shots[0].col, 0);
      assert.lengthOf(game.challenger.shots, 0);
      assert.equal(game.turn_number, 1);
      assert.equal(game.current_player, 'challenger');
    });
    it('works as expected for challenger in two-player', function() {
      const game = {
        state: 'active',
        creator: {
          shots: [],
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        challenger: {
          shots: [],
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        current_player: 'challenger',
        turn_number: 0,
      };

      Game.fire(game, 0, 0);

      assert.equal(game.challenger.shots[0].row, 0);
      assert.equal(game.challenger.shots[0].col, 0);
      assert.lengthOf(game.creator.shots, 0);
      assert.equal(game.turn_number, 1);
      assert.equal(game.current_player, 'creator');
    });
    it('works as expected for creator versus AI', function() {
      const game = {
        state: 'active',
        creator: {
          shots: [],
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        challenger: {
          ai: 'sue',
          shots: [],
          ships: {
            carrier: {row: 0, col: 0},
            battleship: {row: 1, col: 0},
            cruiser: {row: 2, col: 0},
            submarine: {row: 3, col: 0},
            destroyer: {row: 4, col: 0},
          }
        },
        current_player: 'creator',
        turn_number: 0,
        computer_state: {},
      };

      Game.fire(game, 1, 1);

      assert.equal(game.creator.shots[0].row, 1);
      assert.equal(game.creator.shots[0].col, 1);
      assert.equal(game.challenger.shots[0].row, 0);
      assert.equal(game.challenger.shots[0].col, 0);
      assert.equal(game.turn_number, 2);
      assert.equal(game.current_player, 'creator');
    });
  });

  describe('getOwnBoard', function() {
    it('should work with empty board', function() {
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

      var game = {
        creator: { ships: {}, shots: []},
        challenger: { ships: {}, shots: []}
      };
      var user = 'creator';

      var board = Game.getOwnBoard(game, user).squares;

      checkBoard(exp, board);
    });
    it('should work with a single vertical ship', function() {
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

      var board = Game.getOwnBoard(game, user).squares;

      checkBoard(exp, board);
      assert.equal(board[0][0].ship, 'Top');
      assert.equal(board[1][0].ship, 'Vertical');
      assert.equal(board[2][0].ship, 'Vertical');
      assert.equal(board[3][0].ship, 'Vertical');
      assert.equal(board[4][0].ship, 'Bottom');
    });
    it('should work with a single horizontal ship', function() {
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

      var board = Game.getOwnBoard(game, user).squares;

      checkBoard(exp, board);
      assert.equal(board[0][0].ship, 'Left');
      assert.equal(board[0][1].ship, 'Horizontal');
      assert.equal(board[0][2].ship, 'Horizontal');
      assert.equal(board[0][3].ship, 'Horizontal');
      assert.equal(board[0][4].ship, 'Right');
    });
    it('should work with multiple ships', function() {
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

      var board = Game.getOwnBoard(game, user).squares;

      checkBoard(exp, board);
      assert.equal(board[0][0].ship, 'Top');
      assert.equal(board[0][1].ship, 'Top');
      assert.equal(board[0][2].ship, 'Top');
      assert.equal(board[0][3].ship, 'Top');
      assert.equal(board[0][4].ship, 'Top');
      assert.equal(board[1][0].ship, 'Vertical');
      assert.equal(board[1][1].ship, 'Vertical');
      assert.equal(board[1][2].ship, 'Vertical');
      assert.equal(board[1][3].ship, 'Vertical');
      assert.equal(board[1][4].ship, 'Bottom');
      assert.equal(board[2][0].ship, 'Vertical');
      assert.equal(board[2][1].ship, 'Vertical');
      assert.equal(board[2][2].ship, 'Bottom');
      assert.equal(board[2][3].ship, 'Bottom');
      assert.equal(board[3][0].ship, 'Vertical');
      assert.equal(board[3][1].ship, 'Bottom');
      assert.equal(board[4][0].ship, 'Bottom');
    });
    it('should work when shots are present', function(){
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

      var board = Game.getOwnBoard(game, user).squares;

      checkBoard(exp, board);
      assert.equal(board[0][0].ship, 'Top');
      assert.equal(board[1][0].ship, 'Vertical');
      assert.equal(board[2][0].ship, 'Vertical');
      assert.equal(board[3][0].ship, 'Vertical');
      assert.equal(board[4][0].ship, 'Bottom');
    });
  });

  describe('oppositePlayer', function(){
    it('creator', function(){
      var user = 'creator';
      var expected = 'challenger';

      var result = Game.oppositePlayer(user);

      assert.equal(expected, result);
    });
    it('challenger', function(){
      var user = 'challenger';
      var expected = 'creator';

      var result = Game.oppositePlayer(user);

      assert.equal(expected, result);
    });
  });
  describe('getAttackBoard', function(){
    it('empty board', function(){
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

      var game = {
        creator: { ships: {}, shots: []},
        challenger: { ships: {}, shots: []}
      };
      var user = 'creator';

      var board = Game.getAttackBoard(game, user).squares;

      checkBoard(exp, board);
    });
    it('only no ships', function(){
      const exp = [
        "MEEEEEEEEE",
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
          ships: {},
          shots: [{row: 0, col: 0}]
        },
        challenger: { ships: {}, shots: []} };
      var user = 'creator';

      var board = Game.getAttackBoard(game, user).squares;

      checkBoard(exp, board);
    });
    it('hit and miss', function(){
      const exp = [
        "HEEEEEEEEE",
        "EMEEEEEEEE",
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
          ships: {},
          shots: [{row: 0, col: 0}, {row: 1, col: 1}]
        },
        challenger: {
          ships: {carrier: { row: 0, col: 0, vertical: true }},
          shots: []
        }
      };
      var user = 'creator';

      var board = Game.getAttackBoard(game, user).squares;

      checkBoard(exp, board);
    });
  });

  describe('getTitle', function() {
    it('should return game.title if defined', function() {
      const game = { title: 'Example Title' };
      const title = Game.getTitle(game);
      assert.equal(title, game.title);
    });
    it('should return "Unnamed Game <truncated id>" if game.title not defined', function() {
      const game = { _id: 'abcdefghij' };
      const expected = 'Unnamed Game abcdef';
      const title = Game.getTitle(game);
      assert.equal(title, expected);
    });
  });

  describe('getUserPlayer', function() {
    it('should return creator if user is creator', function() {
      const user = {_id: 42};
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert.equal('creator', Game.getUserPlayer(game, user));
    });
    it('should return challenger if user is challenger', function() {
      const user = {_id: 1337};
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert.equal('challenger', Game.getUserPlayer(game, user));
    });
    it('should return false if user is not playing', function() {
      const user = {_id: 300};
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert.isFalse(Game.getUserPlayer(game, user));
    });
    it('should return false if user is not defined', function() {
      let user; /* = undefined; */
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert.isFalse(Game.getUserPlayer(game, user));
    });
  });

  describe('userIsPlayer', function() {
    it('should return true if user is creator', function() {
      const user = {_id: 42};
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert(Game.userIsPlayer(game, user));
    });
    it('should return true if user is creator vs ai', function() {
      const user = {_id: 42};
      const game = {
        creator: {id: 42},
        challenger: {ai: 'sue'},
      };
      assert(Game.userIsPlayer(game, user));
    });
    it('should return true if user is challenger', function() {
      const user = {_id: 1337};
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert(Game.userIsPlayer(game, user));
    });
    it('should return false if user not involved', function() {
      const user = {_id: 300};
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert.isFalse(Game.userIsPlayer(game, user));
    });
    it('should return false if user undefined', function() {
      let user; /* = undefined; */
      const game = {
        creator: {id: 42},
        challenger: {id: 1337},
      };
      assert.isFalse(Game.userIsPlayer(game, user));
    });

    describe('userCanFire', function() {
      context('when game is active', function() {
        it("should return true if user's turn", function() {
          const user = {_id: 42};
          const game = {
            state: 'active',
            creator: {id: 42},
            challenger: {ai: 100},
            current_player: 'creator',
          };
          assert(Game.userCanFire(game, user));
        });
        it("should return false if not user's turn", function() {
          const user = {_id: 42};
          const game = {
            state: 'active',
            creator: {id: 42},
            challenger: {ai: 100},
            current_player: 'challenger',
          };
          assert.isFalse(Game.userCanFire(game, user));
        });
        it("should return false if user not in game", function() {
          const user = {_id: 1337};
          const game = {
            state: 'active',
            creator: {id: 42},
            challenger: {ai: 100},
            current_player: 'creator',
          };
          assert.isFalse(Game.userCanFire(game, user));
        });
      });
      context('when game is finished', function() {
        it("should return false if user's turn", function() {
          const user = {_id: 42};
          const game = {
            state: 'finished',
            creator: {id: 42},
            challenger: {ai: 100},
            current_player: 'creator',
          };
          assert.isFalse(Game.userCanFire(game, user));
        });
        it("should return false if not user's turn", function() {
          const user = {_id: 42};
          const game = {
            state: 'finished',
            creator: {id: 42},
            challenger: {ai: 100},
            current_player: 'challenger',
          };
          assert.isFalse(Game.userCanFire(game, user));
        });
        it("should return false if user not in game", function() {
          const user = {_id: 1337};
          const game = {
            state: 'finished',
            creator: {id: 42},
            challenger: {ai: 100},
            current_player: 'creator',
          };
          assert.isFalse(Game.userCanFire(game, user));
        });
      });
    });
  });
});
