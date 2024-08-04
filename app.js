const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('./models/user'); //Include usermodel
const postModel = require('./models/post'); //Include blog

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

            res.redirect('login');
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
            res.redirect('profile');
        } else {
            res.redirect('/login')
        }
    });
});

app.get('/logout', (req, res)=>{
    res.cookie('token', '');
    res.redirect('/login')
});

// Middleware for protected routes
async function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login");
    }
    try {
        const data = jwt.verify(token, secretKey);
        const user = await userModel.findOne({ email: data.email });
        if (!user) {
            return res.send("User not found, please login again");
        }
        req.user = user;
        next();
    } catch (error) {
        return res.send("Invalid token, please login again");
    }
}

app.get('/profile', isLoggedIn, async (req, res) => {
    let user= await userModel.findOne({email: req.user.email}).populate('posts')
    res.render('profile', {user});
});

app.get('/like/:id', isLoggedIn, async (req, res) => {
    let post= await postModel.findOne({_id: req.params.id}).populate('user')
    
    
    if(post.likes.indexOf(req.user._id)=== -1){
        post.likes.push(req.user.id);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }

    post.save();
    res.redirect('/profile')
});

app.get('/edit/:id', isLoggedIn, async (req, res) => {
    let post= await postModel.findOne({_id: req.params.id}).populate('user')
    res.render('edit',{post})
});

app.post('/update/:id', isLoggedIn, async (req, res) => {
    let post= await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content})
    res.redirect('/profile');
});


app.post('/post', isLoggedIn, async (req, res) => {
    let user= await userModel.findOne({email: req.user.email})
    let {content} = req.body;
    let post = await postModel.create({
        user: user._id,
        content
    });
    user.posts.push(post._id);
    await user.save(); 
    res.redirect('/profile');
});

app.get('/feed', isLoggedIn, async (req, res) => {
    let posts = await postModel.find({}).populate('user');
    res.render('feed', { posts: posts, user: req.user });
});

app.get('/like-feed/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user');

    if (post.likes.indexOf(req.user._id) === -1) {
        post.likes.push(req.user._id);
    } else {
        post.likes.splice(post.likes.indexOf(req.user._id), 1);
    }

    await post.save();
    res.redirect('/feed');
});


app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
