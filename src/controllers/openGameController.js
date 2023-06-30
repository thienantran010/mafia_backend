const { OpenGame } = require('../models/openGameModel');

exports.createOpenGame = async (req, res) => {
    try{
        const hostId = req.id;
        const { name, roles } = req.body;
        const openGame = {
            name: name,
            roles: roles,
            players: [hostId],
            numPlayersJoined: 1,
            numPlayersMax: roles.length
        }
        const openGameDoc = new OpenGame(openGame);
        await openGameDoc.save();
        res.status(200).json({message: `${name} has been created!`});
    }
    catch (error) {
        console.log(error);
    }
}

exports.getAllOpenGames = async (req, res) => {
    try {
        const playerId = req.id;
        const openGames = await OpenGame.find().populate('players', 'username');
        return res.json({openGames});
    }
    catch (error) {
        console.log(error);
    }
}

exports.deleteOpenGame = async (req, res) => {
    const hostId = req.id;
    const { gameId } = req.body;
    const openGame = await OpenGame.findById(gameId).exec();
    if (openGame.players[0] === hostId) {
        await OpenGame.findByIdAndDelete(gameId).exec();
        res.status(200).json({message: `Game has been deleted`})
    }
    res.status(403).json({message: `Can't delete a game that you didn't create.`});
}

exports.addPlayerToGame = async (req, res) => {
    try{
        const playerId = req.id;
        const { gameId } = req.body;
        const openGame = await OpenGame.findById(gameId).exec();
        if (openGame.players.includes(playerId)) {
            return res.status(409).json({message: "Player already joined this game."})
        }
        openGame.players.push(playerId);
        openGame.numPlayersJoined += 1;
        openGame.save();
        return res.json({message: "Player joined game!"});
    }
    catch (error) {
        console.log(error);
    }
}

exports.removePlayerFromGame = async (req, res) => {
    try{
        const playerId = req.id;
        const { gameId } = req.body;
        const openGame = await OpenGame.findById(gameId).exec();
        if (!openGame.players.includes(playerId)) {
            return res.json({message: "Couldn't remove player - player wasn't in game."});
        }
        openGame.players = openGame.players.filter((id) => id != playerId);
        openGame.numPlayersJoined -= 1;
        openGame.save();
        return res.json({message: "Player left game!"});
    }
    catch (error) {
        console.log(error);
    }
}