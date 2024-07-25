const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');

app.use('/', pageRoutes);
app.use('/auth', authRoutes);

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
