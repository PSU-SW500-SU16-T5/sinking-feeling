/** Configuration for JSHint to recognize automatic globals: */

import { $ } from "meteor/jquery";

import "./board.html";
import "./board.less";

Template.board_cell.helpers({
  className() {
    switch (this.ship.state) {
    case "H": return "hit";
    case "M": return "miss";
    case "S": return "ship";
    case "X": return "sunk";
    case "E": return "empty";
    default: return "";
    }
  },
  symbol() {
    const states = {
      H: "Hit",
      E: "Water",
      M: "Miss",
      X: "Sunk",
    };

    let img = "Water";
    if (this.ship.state == "S") {
      img = "Ship" + this.ship.ship;
    } else if (this.ship.state in states) {
      img = states[this.ship.state];
    } else {
      img = "Water";
    }

    return "../graphics/" + img + ".svg";
  },
  clickable() {
    if (this.game.state === "active") {
      if (!this.own) return "clickable";
    }
    return "";
  },
  cell() {
    const col = "ABCDEFGHIJ"[this.col];
    return col + this.row;
  },
  selected() {
    return false;
  },
});

Template.board_cell.events({
  "click .clickable.cell"(event) {
    const target = event.currentTarget;
    $("#selection").val(target.dataset.cell);
  }
});
