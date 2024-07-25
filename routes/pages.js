const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const secretKey = 'jjoikkiok';

// Middleware for protected routes
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.send("Please login first");
    }
    try {
        const data = jwt.verify(token, secretKey);
        req.user = data;
        next();
    } catch (error) {
        return res.send("Invalid token, please login again");
    }
}

router.get("/", (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('index', { user: req.user });
});

module.exports = router;
