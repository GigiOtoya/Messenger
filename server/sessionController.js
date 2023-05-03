const session = require('express-session');
require('dotenv').config();

const sessionMiddleware = session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false
});

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };