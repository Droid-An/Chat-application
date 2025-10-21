"use strict";
import { createMessageElement } from "./components/message.mjs";

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
  fetchAllMessagesSince();
});

websocket.addEventListener("error", (e) => {
  console.log(e);
  console.log(`ERROR`);
});

const form = document.querySelector("#messageForm");
const inputMessage = document.querySelector("#inputMessage");
const chatField = document.querySelector("#chatField");
const feedbackMessage = document.querySelector("#feedbackMessage");

const state = { messages: [] };

const timestamp = Date.now();

function showErrorMessage() {
  feedbackMessage.textContent = "Text is required.";
  setTimeout(() => (feedbackMessage.textContent = ""), 5000);
}

const postMessageToBackend = async () => {
  const messageText = inputMessage.value.trim();

  if (!messageText) {
    showErrorMessage();
    return;
  }
  const url = `${backendUrl}/message`;
  try {
    await fetch(url, {
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
  console.log("user wants to send the message");
  await postMessageToBackend();
};

form.addEventListener("submit", processMessagePost);

const render = async () => {
  chatField.innerHTML = "";
  for (const messageObject of state.messages) {
    createMessageElement(messageObject);
  }
};

websocket.addEventListener("message", (mesEvent) => {
  const response = JSON.parse(mesEvent.data);
  if (response.type === "ratingUpdate") {
    const msg = state.messages.find((m) => m.timestamp === response.timestamp);
    if (msg) {
      msg.likes = response.likes;
      msg.dislikes = response.dislikes;
      render();
    }
  } else {
    if (!state.messages.some((mes) => mes.timestamp === response.timestamp)) {
      state.messages.push(response);
      render();
    } else {
      console.log("message is already on list");
    }
  }
});

const fetchAllMessagesSince = async () => {
  const lastMessageTime =
    state.messages.length > 0
      ? state.messages[state.messages.length - 1].timestamp
      : null;
  const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
  const url = `${backendUrl}/messages${queryString}`;
  const rawResponse = await fetch(url);
  const response = await rawResponse.json();
  for (let object of response) {
    if (!state.messages.some((mes) => mes.timestamp === object.timestamp)) {
      state.messages.push(object);
    }
  }

  render();
};
