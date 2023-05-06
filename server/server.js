const path = require('path');
const express = require('express');
const { sessionMiddleware, wrap } = require('./sessionController');
const Database = require('./database');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 8080;
const MESSAGES = "messages";
const USERS = "users";

// formatted timestamp
function timeStamp() {
    const dt = new Date();
    return dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
}

// middleware function to check if user is authenticated
function requireUser(req, res, next) {
    if (req.session && req.session.authenticated) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

// parse incoming JSON requests
app.use(express.json());
app.use(sessionMiddleware);


app.get('/', requireUser, (req, res) => {
    res.sendFile('index.html', {root: '../'});
})

app.get('/data', requireUser, async (req, res) => {
    const db = new Database();
    await db.query(`SELECT * FROM ${MESSAGES}`)
        .then(rows => {
            res.json(rows);
        })
        .catch(err => {
            console.error(`error: ${err}`);
            res.status(500).send("Database query error");
        });
    db.close();
});

// serve static files, html, css, js, etc...
app.use(express.static(path.join(path.dirname(__dirname), 'public')));

app.get('/login', (req, res) => {
    res.sendFile('login.html', {root: '../public'});
});

app.post('/login', (req, res) => {
    const user = req.body.user;

    if (user) {
        req.session.authenticated = true;
        req.session.user = user;
        // set redirection to chat page
        res.redirect('/');
    };
});

app.get('/users', requireUser, async (req, res) => {
    const db = new Database();
    await db.query(`SELECT * FROM ${USERS}`)
        .then(rows => {
            res.json(rows);
        })
        .catch(err => {
            console.error(`error: ${err}`)
            res.status(500).send("Database query error");
        })
})

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

// socket
io.use(wrap(sessionMiddleware));
io.on('connection', (socket) => {
    const session = socket.request.session;
    console.log(`user ${session.user} has connected`);

    if (session.user) {
        // update userslist on login
        const message = makeMessage("SERVER", `${session.user} has joined`);
        const db = new Database();
        db.insertToTable(USERS, ["name"], [session.user]);
        io.emit('login', message);
        io.emit('updateUsers');

        // io.emit('login', message);

        // update userslist on logout
        socket.on('disconnect', () => {
            console.log(`user ${session.user} has diconnected`);
            const message = makeMessage("SERVER", `${session.user} has left`)

            const db = new Database();
            db.deleteFromTable(USERS, ["name"], [session.user]);
            io.emit('chat', message);
            io.emit('updateUsers');
        });
        
        // send message to client
        socket.on('message', (msg) => {
            const time = timeStamp();
            const message = makeMessage(session.user, msg, time);

            io.emit('chat', message);

            const db = new Database();
            const fields = ["user", "time", "body"];
            const values = [session.user, time, msg];
            db.insertToTable(MESSAGES, fields, values);
        });
    }
});

io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

server.listen(port, ()=> {
    console.log(`listening on port ${port}`);
});

function makeMessage(user, message, time=timeStamp()) {
    return {
        user: user,
        time: time,
        body: message
    }
}
