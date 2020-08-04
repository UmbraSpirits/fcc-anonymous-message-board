const mongoose = require("mongoose");

//Set up the database
const Schema = mongoose.Schema;

const boardDB = new Schema({
  board: {
    type: String,
  },
  thread: [],
});

const boardData = mongoose.model("boardData", boardDB);
exports.boardData = boardData;
