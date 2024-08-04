const mongoose= require('mongoose');

mongoose.connect('mongodb://localhost:27017/blog')

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true  
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'blog' }]  
});


module.exports= mongoose.model('user', userSchema);