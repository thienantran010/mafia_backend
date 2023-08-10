import mongoose from 'mongoose';
import { OpenGame, OpenGameInterface, openGameJson } from '../models/openGameModel';
import { Request, Response } from 'express';
import { UserInterface, User } from '../models/userModel';
import { ActiveGame, ActiveGameInterface, PlayerInterface, action, PlayerInfoInterface} from '../models/activeGameModel';
import { roleNumActions, Role} from '../rolesConfig';
import { DateTime } from 'luxon';

// handles creation of open games
const createOpenGame = async (req: Request, res: Response) => {
    try{
        const hostId = req.id;
        const username = req.username;
        const { name, roles } = req.body;
        const openGameDoc = new OpenGame({
            name: name,
            roles: roles,
            players: [{playerId: hostId, username: username}],
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

// gets all open games for display in front-end open game list
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

// converts open game to active game
// use utc time for nextPhase because it's the same everywhere (don't have to worry about time zones)
const convertToActive = async (openGame : OpenGameInterface, playerId: string) => {
        const shuffledRoleArray = shuffle(openGame.roles) as Role[];
        let players : PlayerInterface = {}

        openGame.players.forEach((player, index) => {
            const role = shuffledRoleArray[index];
            const playerObj = {
                playerId: player.playerId,
                username: player.username,
                isAlive: true,
                toastedBy: [],
                role: role,
                numActionsLeft: roleNumActions[role],
                events: {}
            }
            players[player.username] = playerObj;
        })

        const getPlayerInfos = async (openGame: OpenGameInterface) => {
            const playerInfos : PlayerInfoInterface = {}
            await Promise.all(openGame.players.map(async (player) => {
                const playerObj = await User.findById(player.playerId).exec();
                if (playerObj) {
                    // we need "" else playerInfos won't be saved
                    playerInfos[player.username] = { picture: playerObj.picture || ""};
                }
            }))
            return playerInfos;
        }

        await getPlayerInfos(openGame).then(async (playerInfos) => {
            console.log(playerInfos);
            const newActiveGame = new ActiveGame({
                name: openGame.name,
                players: players,
                playerInfos: playerInfos,
                actions: [{}],
                library: [],
                allChat: [],
                mafiaChat: [],
                copChat: [],
                nextPhase: DateTime.utc().plus({minutes: 2}).toISO()
            });
    
            await newActiveGame.save();
            await OpenGame.findByIdAndDelete(openGame._id);
        })
}

// handles adding a player to game
// after an open game is full, it will be converted to an active game
// otherwise openGame's players and numPlayersJoined fields will be updated
const addPlayerToGame = async (req: Request, res: Response) => {
    try{
        const playerId = req.id;
        const username = req.username;
        const playerId_objid = new mongoose.Types.ObjectId(playerId);
        const { gameId } = req.body;
        const openGame = await OpenGame.findById(gameId).exec();
        if (openGame) {

            if (playerId) {

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

// handles removing a player from the game
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