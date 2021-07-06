const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
    admin: String,
    verified: String,
    follower: Number,
    followername: [String],
    posts: [String],
    following: [String]
});

const PostSchema = new Schema({
    Categorys: [String]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;