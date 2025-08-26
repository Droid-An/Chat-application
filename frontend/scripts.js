"use strict";

const form = document.querySelector("#messageForm");
const inputMessage = document.querySelector("#inputMessage");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const chatField = document.querySelector("#chatField");
const feedbackMessage = document.querySelector("#feedbackMessage");

const backendUrl =
  "https://droid-an-chat-application-backend.hosting.codeyourfuture.io";

const postMessage1 = async () => {
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
      body: JSON.stringify({ messageText }),
    });
    console.log("message posted to backend");

    console.log("message from back:", res);
  } catch (err) {
    console.error(err);
    feedbackMessage.textContent = err;
  }
};

const fetchMessages = async () => {
  try {
    const response = await fetch(backendUrl);
    const messageProperty = await response.json();
    console.log("received answer from backend");
    return messageProperty;
  } catch (err) {
    chatField.innerText = err;
  }
};

const showNewMessage = async () => {
  console.log("showNewMessage function has been triggered");
  const arrayOfMessageObjects = await fetchMessages();
  chatField.innerHTML = "";
  for (const messageObject of arrayOfMessageObjects) {
    createMessageElement(messageObject);
  }
  console.log("all messages has been rendered on page");
};

const processMessagePost = async (e) => {
  e.preventDefault();
  console.log("user wants to send the message");
  await postMessage1();
  await showNewMessage();
};

const createMessageElement = (messageObject) => {
  const messageElement = document.createElement("p");
  messageElement.textContent = messageObject.messageText;
  chatField.appendChild(messageElement);
};

form.addEventListener("submit", processMessagePost);

window.onload = showNewMessage;

//I created this function for debugging purposes
// async function processBackendRes(res) {
//   const response = await res.text();
//   return response
// }
