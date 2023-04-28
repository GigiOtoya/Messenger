const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 8080;

// serve static files, css, js, etc...
app.use(express.static(path.join(path.dirname(__dirname), 'public')));

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../public'})
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    
    socket.on('message', (msg) => {
        console.log(msg);
        const dt = new Date();
        const time = dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
        const chatObj = {message : msg, time : time}
        io.emit('chat', chatObj);
    });

});

io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

server.listen(port, ()=> {
    console.log(`listening on port ${port}`);
})