import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3000;

const arrayOfMessageObjects = [
  {
    messageText: "test message",
    timestamp: Date.now(),
  },
];

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
    console.log("timestamp from the frontend's request", body.timestamp);
    arrayOfMessageObjects.push({
      messageText: body.messageText,
      timestamp: body.timestamp,
    });
    res.send("message has been added successfully");
  });
});

app.get("/messages", (req, res) => {
  const since = parseInt(req.query.since, 10);
  console.log("frontend asks to get messages since", since);

  let filteredMessages = arrayOfMessageObjects;
  if (!isNaN(since)) {
    filteredMessages = arrayOfMessageObjects.filter(
      (message) => message.timestamp > since
    );
  }
  console.log(
    "Messages that will be sent to the front after filter",
    filteredMessages
  );

  res.json(filteredMessages);
});
