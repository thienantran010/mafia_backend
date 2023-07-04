"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePlayerFromGame = exports.addPlayerToGame = exports.getAllOpenGames = exports.createOpenGame = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const openGameModel_1 = require("../models/openGameModel");
const createOpenGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostId = req.id;
        const { name, roles } = req.body;
        const openGame = {
            name: name,
            roles: roles,
            players: [new mongoose_1.default.Types.ObjectId(hostId)],
            numPlayersJoined: 1,
            numPlayersMax: roles.length
        };
        const openGameDoc = new openGameModel_1.OpenGame(openGame);
        yield openGameDoc.save();
        res.status(200).json({ message: `${name} has been created!` });
    }
    catch (error) {
        console.log(error);
    }
});
exports.createOpenGame = createOpenGame;
const getAllOpenGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const openGameDocs = yield openGameModel_1.OpenGame.find().populate('players', 'username');
        const openGames = openGameDocs.map(({ _id, name, roles, players, numPlayersJoined, numPlayersMax }) => {
            return {
                id: _id,
                name: name,
                roles: roles,
                playerObjs: players.map((player) => { return { id: player._id.toString(), username: player.username }; }),
                numPlayersJoined: numPlayersJoined,
                numPlayersMax: numPlayersMax
            };
        });
        return res.json({ openGames });
    }
    catch (error) {
        console.log(error);
        return res.json({ openGames: [] });
    }
});
exports.getAllOpenGames = getAllOpenGames;
// maybe can be repurposed for admin deletes, but otherwise not needed
/*
const deleteOpenGame = async (req: Request, res: Response) => {
    const hostId = req.id;
    const { gameId } : {gameId: string} = req.body;
    const openGame = await OpenGame.findById(gameId).exec();
    if (openGame && openGame.players[0].toString() === hostId) {
        await OpenGame.findByIdAndDelete(gameId).exec();
        return res.status(200).json({message: `Game has been deleted`})
    }
}
*/
const addPlayerToGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = req.id;
        const playerId_objid = new mongoose_1.default.Types.ObjectId(playerId);
        const { gameId } = req.body;
        const openGame = yield openGameModel_1.OpenGame.findById(gameId).exec();
        if (openGame) {
            if (playerId) {
                const playerIds = openGame.players.map((playerObjId) => {
                    return playerObjId.toString();
                });
                if (playerIds.includes(playerId)) {
                    return res.json({ message: "Player already in game" });
                }
                openGame.players.push(playerId_objid);
                openGame.numPlayersJoined += 1;
                openGame.save();
                return res.json({ message: "Player joined game!" });
            }
            else {
                return res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            return res.status(404).json({ message: "Game doesn't exist to join" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});
exports.addPlayerToGame = addPlayerToGame;
const removePlayerFromGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = req.id;
        const { gameId } = req.body;
        const openGame = yield openGameModel_1.OpenGame.findById(gameId).exec();
        if (openGame) {
            if (playerId) {
                const playerIds = openGame.players.map((playerObjId) => {
                    return playerObjId.toString();
                });
                if (!playerIds.includes(playerId)) {
                    return res.json({ message: "Couldn't remove player - player wasn't in game." });
                }
                openGame.players.remove(new mongoose_1.default.Types.ObjectId(playerId));
                openGame.numPlayersJoined -= 1;
                // if player was host or everyone left the game, delete it
                if (playerIds[0] === playerId || openGame.numPlayersJoined === 0) {
                    yield openGameModel_1.OpenGame.findByIdAndDelete(gameId).exec();
                }
                // else save
                else {
                    openGame.save();
                }
                return res.json({ message: "Player left game!" });
            }
            else {
                return res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            return res.status(404).json({ message: "Games doesn't exist to remove player from" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
});
exports.removePlayerFromGame = removePlayerFromGame;
