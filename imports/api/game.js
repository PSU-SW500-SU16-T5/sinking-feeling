import * as Board from './board.js';

export function placeShip(ship_type, row, col, vertical, positions) {
  if (typeof positions[ship_type] == 'undefined')
  {
    positions[ship_type] = {};
  }
  if(Board.ship_types.indexOf(ship_type) < 0)
  {
    throw 'Unrecognised ship type';
  }
  
  positions[ship_type].row = row;
  positions[ship_type].col = col;
  positions[ship_type].vertical = vertical;
}

export function shot(game, player, row, col){
  if (typeof game[player] == 'undefined')
  {
    game[player] = {};
  }
  
  if (typeof game[player].shots == 'undefined')
  {
    game[player].shots = [];
  }  
  
  var shot = {row: row, col: col};
  game[player].shots.push(shot);
};

export function addOwnShips(board, ships)
{
  for(var ship in ships)
  {
    var row = ships[ship].row;
    var col = ships[ship].col;
    for(i = 0; i < Board.ship_lengths[ship]; i++)
    {
      board[row][col].val = 'S';
      if(ships[ship].vertical)
      {
        row++;
      }
      else
      {
        col++;
      }     
    }
  }
};

export function shotHitInSpace(shot, space)
{
  if((shot.row == space.row) && (shot.col == space.col))
  {
    return true;
  }
  return false;
}

export function shotWasHit(shot, ships)
{
  for(var ship in ships)
  {
    for(i = 0; i < Board.ship_lengths[ship]; i++)
    {
      var space = { row: ships[ship].row, col: ships[ship].col };
      if(ships[ship].vertical){
        space.row += i;
      }
      else{
        space.col += i;
      }
      if(shotHitInSpace(shot, space))
      {
        return true;
      }
    }
  }
  return false;
};

export function addShotsToOwn(board, shots, ships)
{
  shots.forEach(function(shot){
    if(shotWasHit(shot, ships))
    {
      board[shot.row][shot.col].val = 'H';
    }
    else
    {
      board[shot.row][shot.col].val = 'M';
    }
  });
};

export function getOwnBoard(game, user){
  var board = Board.makeEmptyBoard();
  addOwnShips(board, game[user].ships);
  var opposite_user = "";
  if(user == "creator")
  {
    opposite_user = "challenger";
  }
  else
  {
    opposite_user = "creator";
  }
  addShotsToOwn(board, game[opposite_user].shots, game[user].ships);
  
  return board;
};

