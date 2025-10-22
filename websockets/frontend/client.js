"use strict";

let websocket;
let backendUrl;
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  backendUrl = "http://localhost:3000";
  websocket = new WebSocket(backendUrl);
  console.log("Running in local mode. Using local backend.");
} else {
  backendUrl =
    "https://droid-an-chat-application-backend.hosting.codeyourfuture.io";
  websocket = new WebSocket(backendUrl);
  console.log("Running in deployed mode. Using live backend.");
}

websocket.addEventListener("open", () => {
  console.log("CONNECTED");
});

websocket.addEventListener("error", (e) => {
  showErrorMessage(e);
  console.log(e);
  console.log(`ERROR`);
});

const form = document.querySelector("#messageForm");
const inputMessage = document.querySelector("#inputMessage");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const chatField = document.querySelector("#chatField");
const feedbackMessage = document.querySelector("#feedbackMessage");
const messageElements = document.querySelector(".messageElement");

const state = { messages: [] };

const timestamp = Date.now();

// made showErrorMessage to handle both strings and errors
function showErrorMessage(error) {
  const message =
    typeof error === "string"
      ? error
      : `${error?.type || "Error"}: ${error?.message || "Unknown error"}`;
  feedbackMessage.textContent = message;
  setTimeout(() => (feedbackMessage.textContent = ""), 5000);
}

const postMessageToBackend = async () => {
  const messageText = inputMessage.value.trim();

  if (!messageText) {
    showErrorMessage("Message has no text");
    return;
  }
  const url = `${backendUrl}/message`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageText,
      }),
    });
  } catch (err) {
    feedbackMessage.textContent = err;
  }
};

const processMessagePost = async (e) => {
  e.preventDefault();
  await postMessageToBackend();
};

const createMessageElement = (messageObject) => {
  const messageElement = document.createElement("div");

  messageElement.classList.add("messageElement");

  const messageText = document.createElement("p");
  messageText.textContent = messageObject.messageText;
  messageText.classList.add("messageText");

  const ratingElement = document.createElement("div");
  ratingElement.classList.add("ratingElement");

  const likesAmount = document.createElement("div");
  likesAmount.textContent = messageObject.likes;
  const likeButton = document.createElement("button");
  likeButton.textContent = "👍";
  likeButton.addEventListener("click", () =>
    sendRating(messageObject.timestamp, "like")
  );

  const dislikesAmount = document.createElement("div");
  dislikesAmount.textContent = messageObject.dislikes;
  const dislikeButton = document.createElement("button");
  dislikeButton.textContent = "👎";
  dislikeButton.addEventListener("click", () =>
    sendRating(messageObject.timestamp, "dislike")
  );

  ratingElement.appendChild(likesAmount);
  ratingElement.appendChild(likeButton);
  ratingElement.appendChild(dislikesAmount);
  ratingElement.appendChild(dislikeButton);

  messageElement.appendChild(ratingElement);
  messageElement.appendChild(messageText);
  chatField.appendChild(messageElement);
};

form.addEventListener("submit", processMessagePost);

const render = async () => {
  chatField.innerHTML = "";
  for (const messageObject of state.messages) {
    createMessageElement(messageObject);
  }
};

const sendRating = async (timestamp, rating) => {
  await fetch(`${backendUrl}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, rating }),
  });
};

websocket.addEventListener("message", (mesEvent) => {
  const response = JSON.parse(mesEvent.data);
  // if we get the list of all messages or just one message
  if (Array.isArray(response) || response.type === "newMessage") {
    updateState(response);
    render();
  }
  if (response.type === "ratingUpdate") {
    const msg = state.messages.find((m) => m.timestamp === response.timestamp);
    if (msg) {
      msg.likes = response.likes;
      msg.dislikes = response.dislikes;
      render();
    }
  }
});

const updateState = (update) => {
  // normalise input: always work with an array
  const updates = Array.isArray(update) ? update : [update];

  for (let object of updates) {
    if (!state.messages.some((mes) => mes === object)) {
      state.messages.push(object);
    }
  }
};
