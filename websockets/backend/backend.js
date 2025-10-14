"use strict";
import express from "express";
import cors from "cors";

const app = express();
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

const callbacksForNewRatings = [];
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
  const bodyBytes = [];
  req.on("data", (chunk) => bodyBytes.push(...chunk));
  req.on("end", () => {
    const bodyString = String.fromCharCode(...bodyBytes);
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (error) {
      console.error(`Failed to parse body ${bodyString} as JSON: ${error}`);
      res.status(400).send("Expected body to be JSON.");
      return;
    }
    if (typeof body != "object" || !("messageText" in body)) {
      console.error(
        `Failed to extract text of the message from post body: ${bodyString}`
      );
      res
        .status(400)
        .send("Expected body to be a JSON object containing key message.");
      return;
    }
    const newMessage = {
      messageText: body.messageText,
      timestamp: body.timestamp,
      likes: 0,
      dislikes: 0,
    };
    arrayOfMessageObjects.push(newMessage);

    activeWsConnections.forEach((connection) => {
      connection.sendUTF(JSON.stringify(newMessage));
    });
    res.send("message has been added successfully");
  });
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
  if (filteredMessages.length === 0) {
    // Note: We need to use an arrow function here, rather than just pushing `res.send` directly.
    // This is because of handling of "this".
    // You can read about "this" at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
    callbacksForNewMessages.push((value) => res.json(value));
  } else {
    res.json(filteredMessages);
  }
});

app.post("/rate", (req, res) => {
  const bodyBytes = [];
  req.on("data", (chunk) => bodyBytes.push(...chunk));
  req.on("end", () => {
    const bodyString = String.fromCharCode(...bodyBytes);
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (error) {
      console.error(`Failed to parse body ${bodyString} as JSON: ${error}`);
      res.status(400).send("Expected body to be JSON.");
      return;
    }
    if (typeof body != "object" || !("rating" in body)) {
      console.error(
        `Failed to extract text of the message from post body: ${bodyString}`
      );
      res
        .status(400)
        .send("Expected body to be a JSON object containing message rating.");
      return;
    }
    const messageRatingToChange = arrayOfMessageObjects.find(
      (message) => message.timestamp == body.timestamp
    );
    if (body.rating == "like") {
      messageRatingToChange.likes++;
    } else if (body.rating == "dislike") {
      messageRatingToChange.dislikes++;
    }
    const ratings = arrayOfMessageObjects.map((msg) => ({
      timestamp: msg.timestamp,
      likes: msg.likes || 0,
      dislikes: msg.dislikes || 0,
    }));
    while (callbacksForNewRatings.length > 0) {
      const callback = callbacksForNewRatings.pop();
      callback(ratings);
    }

    res.send("message has been added successfully");
  });
});

app.get("/rate", (req, res) => {
  callbacksForNewRatings.push((value) => res.json(value));
  //   res.json(ratings);
});

webSocketServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  console.log(new Date() + " Connection accepted.");
  activeWsConnections.push(connection);
  connection.on("close", function (reasonCode, description) {
    // put removing connection from active connections array here
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});
