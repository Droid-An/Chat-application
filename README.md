# Chat Application

A simple real-time chat application with two different ways to communicate: **Long Polling** and **WebSocket**. It also supports likes and dislikes feature.  
The goal of this project was to understand the difference between those approaches by building it ourselves.  

# Project structure

Both implementations are located on one branch in a corresponding folder with independent package.json and frontend

# Technologies used
- Runtime environment: **Node.js**
- Packages: **cors, websocket, express**.

# How It Works

### Long Polling
The frontend sends a request to the backend **every second** to check for new messages.

### WebSocket
The frontend maintains a **persistent connection**, allowing the backend to push updates instantly when new messages arrive.

This setup highlights the **performance and efficiency differences** between the two approaches.

# How to get started
```bash
cd long-polling/backend
npm install
node backend.js
```
- open `client.js` in your browser

### The same process for the websocket version:
```bash
cd websocket/backend
npm install
node backend.js
```
- open `client.js` in your browser

# Learning Outcomes
- Understand client-server communication
- Compare real-time communication strategies
- Learn WebSocket fundamentals
- Learn long polling trade-offs
