import mongoose from 'mongoose';
import { OpenGame, OpenGameInterface, openGameJson } from '../models/openGameModel';
import { Request, Response } from 'express';
import { UserInterface, User } from '../models/userModel';
import { ActiveGame, ActiveGameInterface, PlayerInterface, playerInfos} from '../models/activeGameModel';
import { roleNumActions, Role} from '../rolesConfig';

// TODO
// 
const createOpenGame = async (req: Request, res: Response) => {
    try{
        const hostId = req.id;
        const username = req.username;
        const { name, roles } = req.body;
        const openGameDoc = new OpenGame({
            name: name,
            roles: roles,
            players: new mongoose.Types.DocumentArray([{playerId: hostId, username: username}]),
            numPlayersJoined: 1,
            numPlayersMax: roles.length
        });
        await openGameDoc.save();
        res.status(200).json({message: `${name} has been created!`});
    }
    catch (error) {
        console.log(error);
    }
}

const getAllOpenGames = async (req: Request, res: Response) => {
    try {
        const openGameDocs = await OpenGame.find();
        const openGames : openGameJson[] = openGameDocs.map(({_id, name, roles, players, numPlayersJoined, numPlayersMax}) => {
            const playerObjs = players.map((player) => {
                return {
                    id: player.playerId.toString(),
                    username: player.username
                }
            })
            return {
                id: _id.toString(),
                name: name,
                roles: roles,
                playerObjs: playerObjs,
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

// fish yates shuffle, from here: https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
const shuffle = (array: string[]) => { 
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; 
    } 
    return shuffledArray; 
}; 

const convertToActive = async (openGame : OpenGameInterface, playerId: string) => {
        const shuffledRoleArray = shuffle(openGame.roles) as Role[];
        let players : PlayerInterface[] = openGame.players.map((player, index) => {
            const role = shuffledRoleArray[index];
            return ({
                playerId: player.playerId,
                username: player.username,
                isAlive: true,
                role: role,
                numActionsLeft: roleNumActions[role]
            });
        })

        const getPlayerInfos = async (openGame: OpenGameInterface) => {
            const playerInfos = new Map();
            await Promise.all(openGame.players.map(async (player) => {
                const playerObj = await User.findById(player.playerId).exec();
                if (playerObj) {
                    playerInfos.set(player.username, { picture: playerObj.picture});
                }
            }))
            return playerInfos;
        }

        await getPlayerInfos(openGame).then(async (playerInfos) => {
            if (playerInfos === undefined) {
                console.log(`it's undefined`)
            }
            const newActiveGame = new ActiveGame({
                name: openGame.name,
                players: players,
                playerInfos: playerInfos,
                actions: [],
                library: [],
                messages: []
            });
    
            await newActiveGame.save();
            await OpenGame.findByIdAndDelete(openGame._id);
        })
}

const addPlayerToGame = async (req: Request, res: Response) => {
    try{
        const playerId = req.id;
        const username = req.username;
        const playerId_objid = new mongoose.Types.ObjectId(playerId);
        const { gameId } = req.body;
        const openGame = await OpenGame.findById(gameId).exec();
        if (openGame) {

            if (playerId) {

                // don't add the player if game has max num of players
                if (openGame.numPlayersJoined + 1 > openGame.numPlayersMax) {
                    return res.status(404).json({ message: "Game is full."});
                }

                const playerIds = openGame.players.map((player) => {
                    return player.playerId.toString();
                })

                if (playerIds.includes(playerId)) {
                    return res.json({message: "Player already in game"});
                }

                openGame.players.push({playerId: playerId_objid, username: username});
                openGame.numPlayersJoined += 1;

                if (openGame.numPlayersJoined === openGame.numPlayersMax) {
                    convertToActive(openGame, playerId).then(() => {
                        console.log('converted open game to active game');
                        return res.json({message: 'game has started'});
                    })
                }
                else {
                    await openGame.save();
                    return res.json({message: "Player joined game!"});
                }
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
        const username = req.username;
        const { gameId } = req.body;
        const openGame = await OpenGame.findById(gameId).exec();
        if (openGame) {

            if (playerId) {
                const playerIds = openGame.players.map((player) => {
                    return player.playerId.toString();
                })
    
                if (!playerIds.includes(playerId)) {
                    return res.json({message: "Couldn't remove player - player wasn't in game."});
                }
                
                openGame.players.remove({playerId: new mongoose.Types.ObjectId(playerId), username});
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