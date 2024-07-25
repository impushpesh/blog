const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

const router = express.Router();

const saltRounds = 10;
const secretKey = 'jjoikkiok';

router.post('/register', (req, res) => {
    let { userName, email, password } = req.body;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
            return res.status(500).send('Error generating salt');
        }
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
                return res.status(500).send('Error hashing password');
            }
            let createdUser = await userModel.create({
                userName: userName,
                email: email,
                password: hash
            });

            let token = jwt.sign({ email: createdUser.email }, secretKey);
            res.cookie('token', token);

            res.send(createdUser);
        });
    });
});

router.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return res.send('User not found');
    }
    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: user.email }, secretKey);
            res.cookie('token', token);
            res.send('Logged in successfully');
        } else {
            res.send('Incorrect password');
        }
    });
});

router.get('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/');
});

module.exports = router;
