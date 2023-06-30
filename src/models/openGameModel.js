const mongoose = require('mongoose');
const { userSchema } = require('./userModel');
const Schema = mongoose.Schema;

const openGameSchema = new Schema({
    name: {type: String, required: true},
    roles: [{type: String, required: true}],
    players: [{type: Schema.Types.ObjectId, ref: 'User'}],
    numPlayersJoined: {type: Number, required: true},
    numPlayersMax: {type: Number, required: true}
});

exports.OpenGame = mongoose.model('OpenGame', openGameSchema);