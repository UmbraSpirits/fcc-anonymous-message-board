const mongoose = require("mongoose");

//Set up the database
const Schema = mongoose.Schema;

const replyDB = new Schema({
  text: {
    type: String,
  },
  created_on: {
    type: Date,
  },
  bumped_on: {
    type: Date,
  },
  delete_password: {
    type: String,
  },
  reported: {
    type: Boolean,
  },
});

const replyData = mongoose.model("replyData", replyDB);
exports.replyData = replyData;
