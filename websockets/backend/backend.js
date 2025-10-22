"use strict";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

const arrayOfMessageObjects = [
  {
    messageText: "test message",
    timestamp: Date.now(),
    likes: 0,
    dislikes: 0,
  },
];

const activeWsConnections = [];

// websockets
import http from "http";
import { server as WebSocketServer } from "websocket";
const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ httpServer: server });

server.listen(port, function () {
  console.log("Server is listening on port", port);
});

app.listen(port, () => {
  console.error(`chat server listening on port ${port}`);
});

app.post("/message", (req, res) => {
  if (typeof req.body != "object" || !("messageText" in req.body)) {
    console.error(
      `Failed to extract text of the message from post body: ${bodyString}`
    );
    res
      .status(400)
      .send("Expected body to be a JSON object containing key message.");
    return;
  }
  const newMessage = {
    messageText: req.body.messageText,
    timestamp: Date.now(),
    likes: 0,
    dislikes: 0,
  };
  arrayOfMessageObjects.push(newMessage);

  activeWsConnections.forEach((connection) => {
    connection.sendUTF(JSON.stringify(newMessage));
  });
  res.send("message has been added successfully");
});

app.get("/messages", (req, res) => {
  const since = parseInt(req.query.since, 10);
  console.log(since);
  let filteredMessages = arrayOfMessageObjects;
  if (!isNaN(since)) {
    filteredMessages = arrayOfMessageObjects.filter(
      (message) => message.timestamp > since
    );
  }
  res.json(filteredMessages);
});

app.post("/rate", (req, res) => {
  if (typeof req.body != "object" || !("rating" in req.body)) {
    console.error(
      `Failed to extract text of the message from post body: ${bodyString}`
    );
    res
      .status(400)
      .send("Expected body to be a JSON object containing message rating.");
    return;
  }
  const messageRatingToChange = arrayOfMessageObjects.find(
    (message) => message.timestamp == req.body.timestamp
  );
  if (req.body.rating == "like") {
    messageRatingToChange.likes++;
  } else if (req.body.rating == "dislike") {
    messageRatingToChange.dislikes++;
  }
  activeWsConnections.forEach((connection) =>
    connection.sendUTF(
      JSON.stringify({
        type: "ratingUpdate",
        timestamp: req.body.timestamp,
        likes: messageRatingToChange.likes,
        dislikes: messageRatingToChange.dislikes,
      })
    )
  );
  res.send("message rating has been updated");
});

webSocketServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  console.log(new Date().toLocaleString() + " Connection accepted.");
  activeWsConnections.push(connection);
  connection.sendUTF(JSON.stringify(arrayOfMessageObjects));
  connection.on("close", function (reasonCode, description) {
    // put removing connection from active connections array here

    console.log(
      new Date().toLocaleString +
        " Peer " +
        connection.remoteAddress +
        " disconnected."
    );

    const index = activeWsConnections.indexOf(connection);
    if (index > -1) {
      // only splice array when item is found
      activeWsConnections.splice(index, 1); // 2nd parameter means remove one item only
    }
  });
});
