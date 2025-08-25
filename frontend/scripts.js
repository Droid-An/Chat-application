"use strict";

const form = document.querySelector("#messageForm");
const inputMessage = document.querySelector("#inputMessage");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const chatField = document.querySelector("#chatField");
const feedbackMessage = document.querySelector("#feedbackMessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.createElement("p");
  message.textContent = inputMessage.value;
  //   chatField.innerText = inputMessage.value;
  chatField.appendChild(message);
});

const postMessage = async (e) => {
  e.preventDefault();

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
      body: JSON.stringify({ quote, author }),
    });
    displayFeedback(res);
    inputNewQuote.value = "";
    inputNewAuthor.value = "";
  } catch (err) {
    console.error(err);
    feedbackMessage.textContent = err;
  }
};
