const mongoose= require('mongoose');

mongoose.connect('mongodb://localhost:27017/blog')

const userschema= mongoose.Schema({
    userName: String,
    email: String,
    password: String
});

module.exports= mongoose.model('user', userschema);