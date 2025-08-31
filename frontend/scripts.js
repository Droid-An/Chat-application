"use strict";

const form = document.querySelector("#messageForm");
const inputMessage = document.querySelector("#inputMessage");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const chatField = document.querySelector("#chatField");
const feedbackMessage = document.querySelector("#feedbackMessage");

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

// const fetchMessages = async () => {
//   try {
//     const response = await fetch(backendUrl);
//     const messageProperty = await response.json();
//     console.log("received answer from backend");
//     return messageProperty;
//   } catch (err) {
//     chatField.innerText = err;
//   }
// };

// const showNewMessage = async () => {
//   console.log("showNewMessage function has been triggered");
//   const arrayOfMessageObjects = await fetchMessages();
//   chatField.innerHTML = "";
//   for (const messageObject of arrayOfMessageObjects) {
//     createMessageElement(messageObject);
//   }
//   console.log("all messages has been rendered on page");
// };

const processMessagePost = async (e) => {
  e.preventDefault();
  console.log("user wants to send the message");
  await postMessageToBackend();
};

const createMessageElement = (messageObject) => {
  const messageElement = document.createElement("p");
  messageElement.textContent = messageObject.messageText;
  chatField.appendChild(messageElement);
};

const keepFetchingMessages = async () => {
  const lastMessageTime =
    state.messages.length > 0
      ? state.messages[state.messages.length - 1].timestamp
      : null;
  const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
  const url = `${backendUrl}/messages${queryString}`;
  console.log(url);
  const rawResponse = await fetch(url);
  const response = await rawResponse.json();
  console.log(response);
  state.messages.push(...response);
  console.log("current state", state);
  render();
  setTimeout(keepFetchingMessages, 1000);
};

form.addEventListener("submit", processMessagePost);

window.onload = keepFetchingMessages;

const render = async () => {
  chatField.innerHTML = "";
  for (const messageObject of state.messages) {
    createMessageElement(messageObject);
  }
};
