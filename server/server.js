const path = require('path');
const express = require('express');
const { sessionMiddleware, wrap } = require('./sessionController');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 8080;

// formatted timestamp
function timeStamp() {
    const dt = new Date();
    return dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
}

// middleware function to check if user is authenticated
function requireUser(req, res, next) {
    if (req.session && req.session.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

// serve static files, css, js, etc...
app.use(express.static(path.join(path.dirname(__dirname), 'public')));

app.get('/', requireUser, (req, res) => {
    res.sendFile('index.html', {root: '../public'});
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', {root: '../public'});
});

// parse incoming JSON requests
app.use(express.json());
app.use(sessionMiddleware);

app.post('/login', (req, res) => {
    const user = req.body.user;

    if (user) {
        req.session.authenticated = true;
        req.session.user = user;
        // set redirection to chat page
        res.redirect('/');
    };
});

app.post('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send('Internal server error');
        }
        else {
            res.redirect('/login');
        }
    });
});

io.use(wrap(sessionMiddleware));

io.on('connection', (socket) => {
    const session = socket.request.session;
    console.log('a user connected');
    console.log(`user: ${session.user}`);

    if (session.user) {
        const chatObj = {
            user: "SERVER", 
            time: timeStamp(),
            message : `${session.user} has joined`
        }
        io.emit('chat', chatObj);
        io.emit('login', session.user);
    }

    

    socket.on('disconnect', () => {
        console.log('user disconnected');
        const time = timeStamp()
        const chatObj = {
            user: "SERVER", 
            time: time,
            message : `${session.user} has left`
        }
        io.emit('chat', chatObj);
    });
    
    socket.on('message', (msg) => {
        console.log(`new message: ${msg}`);
        const time = timeStamp();
        const chatObj = {
            user: session.user, 
            time: time, 
            message : msg
        };
        io.emit('chat', chatObj);
    });

});

io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

server.listen(port, ()=> {
    console.log(`listening on port ${port}`);
})