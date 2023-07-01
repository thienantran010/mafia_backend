import mongoose from 'mongoose';
import { OpenGame } from '../models/openGameModel';
import { Request, Response } from 'express';

const createOpenGame = async (req: Request, res: Response) => {
    try{
        const hostId = req.id;
        const { name, roles } = req.body;
        const openGame = {
            name: name,
            roles: roles,
            players: [new mongoose.Types.ObjectId(hostId)],
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

const getAllOpenGames = async (req: Request, res: Response) => {
    try {
        const playerId = req.id;
        const openGames = await OpenGame.find().populate('players', 'username');
        return res.json({openGames});
    }
    catch (error) {
        console.log(error);
    }
}

const deleteOpenGame = async (req: Request, res: Response) => {
    const hostId = req.id;
    const { gameId } = req.body;
    const openGame = await OpenGame.findById(gameId).exec();
    if (openGame && openGame.players[0].toString() === hostId) {
        await OpenGame.findByIdAndDelete(gameId).exec();
        return res.status(200).json({message: `Game has been deleted`})
    }
}

const addPlayerToGame = async (req: Request, res: Response) => {
    try{
        const playerId = req.id;
        const playerId_objid = new mongoose.Types.ObjectId(playerId);
        const { gameId } = req.body;
        const openGame = await OpenGame.findById(gameId).exec();
        if (openGame) {

            if (playerId) {
                const playerIds = openGame.players.map((playerObjId) => {
                    return playerObjId.toString();
                })

                if (playerIds.includes(playerId)) {
                    return res.json({message: "Player already in game"});
                }

                openGame.players = [...openGame.players, playerId_objid];
                openGame.numPlayersJoined += 1;
                openGame.save();
                return res.json({message: "Player joined game!"});
            }

            else {
                return res.status(401).json({message: "Unauthorized"});
            }
        }

        else {
            return res.status(404).json({message: "Game doesn't exist to join"});
        }
    
    }
    catch (error) {
        console.log(error);
    }
}

const removePlayerFromGame = async (req: Request, res: Response) => {
    try{
        const playerId = req.id;
        const { gameId } = req.body;
        const openGame = await OpenGame.findById(gameId).exec();
        if (openGame) {

            if (playerId) {
                const playerIds = openGame.players.map((playerObjId) => {
                    return playerObjId.toString();
                })
    
                if (!playerIds.includes(playerId)) {
                    return res.json({message: "Couldn't remove player - player wasn't in game."});
                }
    
                openGame.players = openGame.players.filter((id) => id.toString() !== playerId);
                openGame.numPlayersJoined -= 1;
                openGame.save();
                return res.json({message: "Player left game!"});
            }

            else {
                return res.status(401).json({message: "Unauthorized"});
            }
        }

        else {
            return res.status(404).json({message: "Games doesn't exist to remove player from"});
        }
    }
    catch (error) {
        console.log(error);
    }
}

export {
    createOpenGame,
    getAllOpenGames,
    deleteOpenGame,
    addPlayerToGame,
    removePlayerFromGame
}