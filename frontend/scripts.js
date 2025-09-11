"use strict";

const form = document.querySelector("#messageForm");
const inputMessage = document.querySelector("#inputMessage");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const chatField = document.querySelector("#chatField");
const feedbackMessage = document.querySelector("#feedbackMessage");
const messageElements = document.querySelector(".messageElement");

const backendUrl =
  "https://droid-an-chat-application-backend.hosting.codeyourfuture.io";

// const backendUrl = "http://localhost:3000";

const state = { messages: [] };

const timestamp = Date.now();

const postMessageToBackend = async () => {
  const messageText = inputMessage.value.trim();

  if (!messageText) {
    feedbackMessage.textContent = "Text is required.";
    setTimeout(() => (feedbackMessage.textContent = ""), 5000);
    return;
  }

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageText,
        timestamp: Date.now(),
      }),
    });
    console.log("message posted to backend");

    console.log("response from back:", res);
  } catch (err) {
    console.error(err);
    feedbackMessage.textContent = err;
  }
};

const processMessagePost = async (e) => {
  e.preventDefault();
  console.log("user wants to send the message");
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

const keepFetchingMessages = async () => {
  const lastMessageTime =
    state.messages.length > 0
      ? state.messages[state.messages.length - 1].timestamp
      : null;
  console.log("ask message since", lastMessageTime);
  const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
  const url = `${backendUrl}/messages${queryString}`;
  const rawResponse = await fetch(url);
  const response = await rawResponse.json();
  state.messages.push(...response);

  render();
  setTimeout(keepFetchingMessages, 1000);
};

form.addEventListener("submit", processMessagePost);

window.onload = () => {
  keepFetchingMessages(), keepFetchingRatings();
};

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

const keepFetchingRatings = async () => {
  const url = `${backendUrl}/rate`;
  const rawResponse = await fetch(url);
  const ratings = await rawResponse.json();

  // Update ratings in state.messages
  for (const rating of ratings) {
    const msg = state.messages.find((m) => m.timestamp === rating.timestamp);
    if (msg) {
      msg.likes = rating.likes;
      msg.dislikes = rating.dislikes;
    }
  }
  render();
  setTimeout(keepFetchingRatings, 1000);
};

//websockets
const websocket = new WebSocket("ws://localhost:8080");

websocket.addEventListener("open", () => {
  console.log("CONNECTED");
});

websocket.addEventListener("error", (e) => {
  console.log(`ERROR`);
});
