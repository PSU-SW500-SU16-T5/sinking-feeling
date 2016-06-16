import { assert } from 'meteor/practicalmeteor:chai';
import { AI } from './sue.js';

describe('Sequential Sue AI', function () {
    describe('makeMove', function () {
        it('returns 0,0 for first move', function () {
            const game = {
                opponent_board: [
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"]
                ],
            };
            const move = AI.makeMove(game);
            assert.deepEqual(move, [0,0]);
        });
        it('returns 0,9 for tenth move', function () {
            const game = {
                opponent_board: [
                    ["X","X","X","X","X","X","X","X","X","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"]
                ],
            };
            const move = AI.makeMove(game);
            assert.deepEqual(move, [0,9]);
        });
        it('returns 1,0 for eleventh move', function () {
            const game = {
                opponent_board: [
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"],
                    ["E","E","E","E","E","E","E","E","E","E"]
                ],
            };
            const move = AI.makeMove(game);
            assert.deepEqual(move, [1,0]);
        });
        it('returns 9,9 for hundredth move', function () {
            const game = {
                opponent_board: [
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","X"],
                    ["X","X","X","X","X","X","X","X","X","E"]
                ],
            };
            const move = AI.makeMove(game);
            assert.deepEqual(move, [9,9]);
        });
    });
});