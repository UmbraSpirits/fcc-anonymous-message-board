/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { contentSecurityPolicy } = require("helmet");
var ObjectId = require("mongodb").ObjectId;

var expect = require("chai").expect;
var threadData = require("../models/thread").threadData;
var boardData = require("../models/board").boardData;
var replyData = require("../models/reply").replyData;

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
        } else {
          newBoard = new boardData({
            board: board,
            thread: [],
          });
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

        newBoard.save((err, data) => {
          if (err) {
            return console.log(err);
          }
          res.redirect(`/b/${board}/`);
        });

        // newThread.save((err, data) => {
        //   if (err) {
        //     return console.log(err);
        //   }

        // });
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
      const { report_id } = req.body;
      // console.log(board, report_id);
      boardData
        .updateOne(
          { board, "thread._id": ObjectId(report_id) },
          {
            $set: {
              "thread.$.reported": true,
            },
          }
        )
        .then((data) => {
          console.log(data);
        });
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { delete_password, thread_id } = req.body;
      boardData
        .updateOne(
          { board: board },
          {
            $pull: {
              thread: {
                _id: ObjectId(thread_id),
                delete_password: delete_password,
              },
            },
          }
        )
        .then((data) => {
          res.send(`${data.nModified} item has been deleted`);
        });
    });
  app
    .route("/api/replies/:board")
    .post((req, res) => {
      const { board } = req.params;
      const { thread_id, text, delete_password } = req.body;

      var newReply = new replyData({
        text: text,
        delete_password: delete_password,
        created_on: Date.now(),
        bumped_on: Date.now(),
        reported: false,
      });

      boardData
        .findOneAndUpdate(
          { board: board, "thread._id": ObjectId(thread_id) },
          { $push: { "thread.$.replies": newReply } }
        )
        .then(() => res.redirect(`/b/${board}/${thread_id}/`));
    })
    .get((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;

      boardData.findOne(
        { board: board, "thread._id": ObjectId(thread_id) },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            var dataShown = data.thread[0];
            dataShown.replies = dataShown.replies.filter(
              (e) => e.reported !== true
            );
            dataShown.replies = dataShown.replies.slice(0, 3);
            dataShown.delete_password = "";
            dataShown.replies.map((e) => (e.delete_password = ""));

            res.json(dataShown);
          }
        }
      );
    })
    .put((req, res) => {
      const { board } = req.params;
      const { reply_id, thread_id } = req.body;
      console.log(board, reply_id, thread_id);
      boardData
        .updateOne(
          {
            board,
          },
          {
            $set: {
              "thread.$[thread].replies.$[replies].reported": true,
              "thread.$[thread].replies.$[replies].bumped_on": new Date(),
            },
          },
          {
            arrayFilters: [
              { "thread._id": ObjectId(thread_id) },
              { "replies._id": ObjectId(reply_id) },
            ],
          }
        )
        .then((data) => {
          console.log(data);
        });
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { delete_password, reply_id, thread_id } = req.body;
      console.log(board, reply_id, thread_id);
      boardData
        .updateOne(
          {
            board,
          },
          {
            $set: {
              "thread.$[thread].replies.$[replies].text": "[deleted]",
              "thread.$[thread].replies.$[replies].bumped_on": new Date(),
            },
          },
          {
            arrayFilters: [
              { "thread._id": ObjectId(thread_id) },
              {
                "replies._id": ObjectId(reply_id),
                "replies.delete_password": delete_password,
              },
            ],
          }
        )
        .then(() => res.redirect(`/b/${board}/${thread_id}/`));
    });
};
