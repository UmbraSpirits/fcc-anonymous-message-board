/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { contentSecurityPolicy } = require("helmet");

var expect = require("chai").expect;
var threadData = require("../models/thread").threadData;
var boardData = require("../models/board").boardData;

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post((req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;

      var newBoard;

      boardData.findOne({ board: board }, (err, data) => {
        if (err) {
          console.log(err);
          return res.send("An error has occured");
        }
        if (data) {
          newBoard = data;
          console.log("Used an existing board\n", newBoard);
        } else {
          newBoard = new boardData({
            board: board,
            thread: [],
          });
          console.log("created a new board\n", newBoard);
        }
        var newThread = new threadData({
          text: text,
          delete_password: delete_password,
          reported: false,
          created_on: Date.now(),
          bumped_on: Date.now(),
          replies: [],
        });

        newBoard.thread.push(newThread);

        newThread.save((err, data) => {
          if (err) {
            return console.log(err);
          }
          newBoard.save((err, data) => {
            if (err) {
              return console.log(err);
            }
            res.redirect(`/b/${board}/`);
          });
        });
      });
    })
    .get((req, res) => {
      const { board } = req.params;
      boardData.findOne({ board: board }).then((data) => {
        console.log(data.thread);
        const dataShowing = data.thread.sort((a, b) => b - a).slice(0, 10);
        res.json(dataShowing);
      });
    })
    .put((req, res) => {
      const { board } = req.params;
      const { report_id } = req.query;
      console.log(report_id);
      boardData.findByIdAndUpdate(
        report_id,
        { $set: { reported: true } },
        (err, data) => {
          err ? console.log(err) : console.log("successfull flagged");
        }
      );
    })
    .delete((req, res) => {});
  app
    .route("/api/replies/:board")
    .post((req, res) => {})
    .get((req, res) => {})
    .put((req, res) => {})
    .delete((req, res) => {});
};
