import { sendRating } from "../apiServices/api.mjs";

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

export { createMessageElement };
