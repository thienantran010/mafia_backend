const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, unique: true, required: true, dropDups: true},
    email: {type: String, unique: true, required: true, dropDups: true},
    hashedPassword: {type: String, required: true},
    isVerified: Boolean,
    signature: String,
    picture: String,
    wins: Number,
    losses: Number
})

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;