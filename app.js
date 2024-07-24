const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const saltRounds = 10;
const secretKey = 'jjoikkiok';

app.get("/", function (req, res) {
    res.render('register');
});

app.post('/register', (req, res) => {
    let { userName, email, password } = req.body;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
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

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
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

app.get('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/');
});

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
