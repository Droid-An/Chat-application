let backendUrl;
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  backendUrl = "http://localhost:3000";
} else {
  backendUrl =
    "https://droid-an-chat-application-backend.hosting.codeyourfuture.io";
}

async function sendRating(timestamp, rating) {
  await fetch(`${backendUrl}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, rating }),
  });
}
export { sendRating };
