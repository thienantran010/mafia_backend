import mongoose from 'mongoose';
import { OpenGame, openGameJson } from '../models/openGameModel';
import { Request, Response } from 'express';
import { UserDocument } from '../models/userModel';

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
        const openGameDocs = await OpenGame.find().populate<{"players": UserDocument[]}>('players', 'username');
        const openGames : openGameJson[] = openGameDocs.map(({_id, name, roles, players, numPlayersJoined, numPlayersMax}) => {
            return {
                id: _id,
                name: name,
                roles: roles,
                playerObjs: players.map((player) => {return {id: player._id.toString(), username: player.username}}),
                numPlayersJoined: numPlayersJoined,
                numPlayersMax: numPlayersMax
            }
        })
        return res.json({openGames});
    }
    catch (error) {
        console.log(error);
        return res.json({openGames: []});
    }
}


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

                openGame.players.push(playerId_objid);
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
        res.status(400).json({error});
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
                
                openGame.players.remove(new mongoose.Types.ObjectId(playerId));
                openGame.numPlayersJoined -= 1;

                // if player was host or everyone left the game, delete it
                if (playerIds[0] === playerId || openGame.numPlayersJoined === 0) {
                    await OpenGame.findByIdAndDelete(gameId).exec();
                }

                // else save
                else {
                    openGame.save();
                }

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
        return res.status(400).json({error});
    }
}

export {
    createOpenGame,
    getAllOpenGames,
    // deleteOpenGame,
    addPlayerToGame,
    removePlayerFromGame
}