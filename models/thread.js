const mongoose = require("mongoose");

//Set up the database
const Schema = mongoose.Schema;

const threadDB = new Schema({
  text: {
    type: String,
  },
  created_on: {
    type: Date,
  },
  bumped_on: {
    type: Date,
  },
  reported: {
    type: Boolean,
  },
  delete_password: {
    type: String,
  },
  replies: [],
});

const threadData = mongoose.model("threadData", threadDB);
exports.threadData = threadData;
