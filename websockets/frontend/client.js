"use strict";
const websocket = new WebSocket("ws://localhost:3000");

websocket.addEventListener("open", () => {
  console.log("CONNECTED");
  fetchAllMessagesSince();
  keepFetchingRatings();
});

websocket.addEventListener("error", (e) => {
  console.log(e);
  console.log(`ERROR`);
});

const form = document.querySelector("#messageForm");
const inputMessage = document.querySelector("#inputMessage");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const chatField = document.querySelector("#chatField");
const feedbackMessage = document.querySelector("#feedbackMessage");
const messageElements = document.querySelector(".messageElement");

// const backendUrl =
// "https://droid-an-chat-application-backend.hosting.codeyourfuture.io";

const backendUrl = "http://localhost:3000";

const state = { messages: [] };

const timestamp = Date.now();

const postMessageToBackend = async () => {
  const messageText = inputMessage.value.trim();

  if (!messageText) {
    feedbackMessage.textContent = "Text is required.";
    setTimeout(() => (feedbackMessage.textContent = ""), 5000);
    return;
  }
  const url = `${backendUrl}/message`;
  console.log(url);
  try {
    const res = await fetch(url, {
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

form.addEventListener("submit", processMessagePost);

const render = async () => {
  chatField.innerHTML = "";
  console.log(state.messages);
  console.log(Math.max(...state.messages.map((obj) => obj.timestamp)));
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

websocket.addEventListener("message", (mesEvent) => {
  const response = JSON.parse(mesEvent.data);
  if (!state.messages.some((mes) => mes.timestamp === response.timestamp)) {
    state.messages.push(response);
    render();
  } else {
    console.log("message is already on list");
  }
});

const fetchAllMessagesSince = async () => {
  const lastMessageTime =
    state.messages.length > 0
      ? state.messages[state.messages.length - 1].timestamp
      : null;
  console.log("ask message since", lastMessageTime);
  const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
  const url = `${backendUrl}/messages${queryString}`;
  const rawResponse = await fetch(url);
  console.log(rawResponse);
  const response = await rawResponse.json();
  console.log(response);
  for (let object of response) {
    if (!state.messages.some((mes) => mes.timestamp === object.timestamp)) {
      state.messages.push(object);
    }
  }

  render();
};
