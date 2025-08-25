import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3000;

const messages = [];

app.get("/", (req, res) => {
  const quote = randomQuote();
  res.send({ author: quote.author, quote: quote.quote });
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
    messages.push({
      messageText: body.messageText,
    });
    // res.send("Quote has been added successfully");
  });
});
