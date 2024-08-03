const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('ws');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let comments = [];

app.get('/', (req, res) => {
    res.send('Welcome to the Comments API');
});

app.get('/comments', (req, res) => {
    res.json(comments);
});

app.post('/comments', (req, res) => {
    const comment = { ...req.body, id: comments.length };
    comments.push(comment);
    broadcastNewComment(comment);
    res.json(comments);
});

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'initial_comments', comments }));

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcastNewComment(comment) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'new_comment', comment }));
        }
    });
}

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
