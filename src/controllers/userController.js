const { openGamesRepository } = require('../models/openGamesRepository');
const { activeGamesRepository } = require('../models/activeGamesRepository');

exports.yourGames = (req, res) => {
    const yourId = req.id
    const openGames = openGamesRepository.search().where('players').contain(yourId).return.all();
    const activeGames = activeGamesRepository.search().where('players').contain()
}