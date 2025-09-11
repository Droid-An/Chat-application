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

const callbacksForNewMessages = [];
const callbacksForNewRatings = [];
const activeWsConnections = [];

// websockets
import http from "http";
import { server as WebSocketServer } from "websocket";
const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ httpServer: server });

server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});

app.listen(port, () => {
  console.error(`chat server listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send(arrayOfMessageObjects);
});

app.post("/", (req, res) => {
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

    while (callbacksForNewMessages.length > 0) {
      const callback = callbacksForNewMessages.pop();
      callback([arrayOfMessageObjects[arrayOfMessageObjects.length - 1]]);
    }
    res.send("message has been added successfully");
  });
});

app.get("/messages", (req, res) => {
  const since = parseInt(req.query.since, 10);

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

// webSocketServer.on("request", function (request) {
//   const connection = request.accept(null, request.origin);
//   console.log(new Date() + " Connection accepted.");
//   connection.on("message", function (message) {
//     if (message.type === "utf8") {
//       console.log("Received Message: " + message.utf8Data);
//       connection.sendUTF(message.utf8Data);
//     } else if (message.type === "binary") {
//       console.log(
//         "Received Binary Message of " + message.binaryData.length + " bytes"
//       );
//       connection.sendBytes(message.binaryData);
//     }
//   });
//   connection.on("close", function (reasonCode, description) {
//     console.log(
//       new Date() + " Peer " + connection.remoteAddress + " disconnected."
//     );
//   });
// });

webSocketServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  console.log(new Date() + " Connection accepted.");
  console.log("new connection", connection);
  activeWsConnections.push(connection);
  connection.on("close", function (reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});
