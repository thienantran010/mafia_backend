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
const userModel_1 = require("../models/userModel");
const activeGameModel_1 = require("../models/activeGameModel");
const rolesConfig_1 = require("../rolesConfig");
// TODO
// 
const createOpenGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostId = req.id;
        const username = req.username;
        const { name, roles } = req.body;
        const openGameDoc = new openGameModel_1.OpenGame({
            name: name,
            roles: roles,
            players: new mongoose_1.default.Types.DocumentArray([{ playerId: hostId, username: username }]),
            numPlayersJoined: 1,
            numPlayersMax: roles.length
        });
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
        const openGameDocs = yield openGameModel_1.OpenGame.find();
        const openGames = openGameDocs.map(({ _id, name, roles, players, numPlayersJoined, numPlayersMax }) => {
            const playerObjs = players.map((player) => {
                return {
                    id: player.playerId.toString(),
                    username: player.username
                };
            });
            return {
                id: _id.toString(),
                name: name,
                roles: roles,
                playerObjs: playerObjs,
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
// fish yates shuffle, from here: https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
const shuffle = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
};
const convertToActive = (openGame, playerId) => __awaiter(void 0, void 0, void 0, function* () {
    const shuffledRoleArray = shuffle(openGame.roles);
    let players = {};
    openGame.players.forEach((player, index) => {
        const role = shuffledRoleArray[index];
        const playerObj = {
            playerId: player.playerId,
            username: player.username,
            isAlive: true,
            role: role,
            numActionsLeft: rolesConfig_1.roleNumActions[role]
        };
        players[player.username] = playerObj;
    });
    const getPlayerInfos = (openGame) => __awaiter(void 0, void 0, void 0, function* () {
        const playerInfos = {};
        yield Promise.all(openGame.players.map((player) => __awaiter(void 0, void 0, void 0, function* () {
            const playerObj = yield userModel_1.User.findById(player.playerId).exec();
            if (playerObj) {
                // we need "" else playerInfos won't be saved
                playerInfos[player.username] = { picture: playerObj.picture || "" };
            }
        })));
        return playerInfos;
    });
    yield getPlayerInfos(openGame).then((playerInfos) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(playerInfos);
        const newActiveGame = new activeGameModel_1.ActiveGame({
            name: openGame.name,
            players: players,
            playerInfos: playerInfos,
            actions: [{}],
            library: [],
            allChat: [],
            mafiaChat: [],
            copChat: []
        });
        yield newActiveGame.save();
        yield openGameModel_1.OpenGame.findByIdAndDelete(openGame._id);
    }));
});
const addPlayerToGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = req.id;
        const username = req.username;
        const playerId_objid = new mongoose_1.default.Types.ObjectId(playerId);
        const { gameId } = req.body;
        const openGame = yield openGameModel_1.OpenGame.findById(gameId).exec();
        if (openGame) {
            if (playerId) {
                // don't add the player if game has max num of players
                if (openGame.numPlayersJoined + 1 > openGame.numPlayersMax) {
                    return res.status(404).json({ message: "Game is full." });
                }
                const playerIds = openGame.players.map((player) => {
                    return player.playerId.toString();
                });
                if (playerIds.includes(playerId)) {
                    return res.json({ message: "Player already in game" });
                }
                openGame.players.push({ playerId: playerId_objid, username: username });
                openGame.numPlayersJoined += 1;
                if (openGame.numPlayersJoined === openGame.numPlayersMax) {
                    convertToActive(openGame, playerId).then(() => {
                        return res.json({ message: 'game has started' });
                    });
                }
                else {
                    yield openGame.save();
                    return res.json({ message: "Player joined game!" });
                }
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
        const username = req.username;
        const { gameId } = req.body;
        const openGame = yield openGameModel_1.OpenGame.findById(gameId).exec();
        if (openGame) {
            if (playerId) {
                const playerIds = openGame.players.map((player) => {
                    return player.playerId.toString();
                });
                if (!playerIds.includes(playerId)) {
                    return res.json({ message: "Couldn't remove player - player wasn't in game." });
                }
                openGame.players.remove({ playerId: new mongoose_1.default.Types.ObjectId(playerId), username });
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
