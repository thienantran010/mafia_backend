import mongoose from 'mongoose';
import { ActiveGame, activeGameJson, playerJson, messageJson, MessageInterface, actionJson, ActionInterface } from '../models/activeGameModel';
import { UserInterface } from '../models/userModel'
import { Request, Response } from 'express';

import { Role } from '../rolesConfig';

// gets game name and game id (key)
// for display in front-end active game list
export const getUserActiveGames = async (req: Request, res: Response) => {
    try {
        const playerId = req.id;
        const playerUsername = req.username;
        const games = await ActiveGame.find({ [`players.${playerUsername}`]: {"$exists": true} });
        // we just want the id and name of the game right now
        const activeGames = games.map((game) => {
            return {
                id: game._id.toString() as string,
                name: game.name
            }
        });
        return res.json({ activeGames });
    }

    catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
}

// return all info associated with an active game
// information has been converted to a native js friendly format
export const getActiveGame = async (req: Request, res: Response) => {
    const playerId = req.id;
    const username = req.username;
    try {
        const gameId = req.params.id;
        const game = await ActiveGame.findById(gameId).exec();

        // if game doesn't exist
        if (!game) {
            return res.status(404).json({message: "game not found"});
        }

        // if player isn't in the game, don't give them the game info.
        const playersInGame = Object.keys(game.players);
        if (!playersInGame.includes(username)) {
            return res.status(403).json({message: "You are not in this game"});
        }

        // same object, but playerIds are now strings instead of ObjectIds
        // front-end doesn't have mongoose so we need them to be strings
        const players : playerJson = {}
        for (const [username, playerObj] of Object.entries(game.players)) {
            players[username] = {...playerObj, playerId: playerObj.playerId.toString()}
        }

        // helper function to convert an array of stored messages to front-end friendly array of messages
        // gets player picture from playerInfo object
        const messagesToJson = (messages : MessageInterface[]) => {
            return (
                messages.map((message) => {
                    const playerInfo = game.playerInfos[message.username];

                    if (playerInfo) {
                        return ({
                            username: message.username,
                            picture: playerInfo.picture,
                            content: message.content
                        })
                    }
        
                    else {
                        return ({
                            username: "",
                            picture: "",
                            content: ""
                        })
                    }
                })
            )
        }
        
        // repackage chats for front-end use
        const allChat : messageJson[] = messagesToJson(game.allChat);
        const mafiaChat : messageJson[] = messagesToJson(game.mafiaChat);
        const copChat : messageJson[] = messagesToJson(game.copChat);

        const activeGame : activeGameJson = {
            id: game._id.toString(),
            name: game.name,
            players: players,
            actions: game.actions,
            library: game.library,
            allChat: allChat,
            mafiaChat: mafiaChat,
            copChat: copChat,
            timeLeft: game.timeLeft
        }

        return res.json({activeGame});
    }

    catch (error) {
        console.log(error);
    }
}

// post/update a day vote or action vote
export const postAction = async (req: Request, res: Response) => {
    const playerId = req.id;
    const username = req.username;
    const {dayVote, actionVote} : {dayVote: string | undefined, actionVote: string | undefined} = req.body;
    try {
        const gameId = req.params.gameId;
        const game = await ActiveGame.findById(gameId).exec();
        const player = game?.players[username];
        const playerRole = player?.role;
        const playerNumActions = player?.numActionsLeft;
        const dayActionRoles : Set<Role> = new Set(["Kamikaze"]);

        // if game doesn't exist
        if (!game) {
            return res.status(404).json({message: "game not found"});
        }

        if (game.actions.length > 0) {
            const currentPhaseActions = game.actions[game.actions.length - 1];

            // if it's daytime
            if (game.library.length % 2 === 1) {

                // if user has a daytime role and has provided an action vote, set the vote
                if (playerRole && dayActionRoles.has(playerRole) && playerNumActions && playerNumActions > 0 && actionVote) {
                    currentPhaseActions[username] = {...currentPhaseActions[username], actionVote: actionVote};
                }

                // user can't perform their role in the morning if it isn't a daytime role
                else if (actionVote && playerRole && !dayActionRoles.has(playerRole)) {
                    return res.json({message: "You can't perform this role in the morning."});
                }

                // user can perform their role if they don't have enough actions
                else if (actionVote && playerNumActions && playerNumActions <= 0) {
                    return res.json({message: "You have taken all the actions available to this role."});
                }

                // if there is a dayvote, set it
                if (dayVote) {
                    currentPhaseActions[username] = {...currentPhaseActions[username], dayVote: dayVote};
                }
            }

            // it's nighttime
            else {

                // if a user has a night role and has provided an action vote, set the vote
                if (playerRole && !dayActionRoles.has(playerRole) && playerNumActions && playerNumActions > 0 && actionVote) {
                    currentPhaseActions[username] = {...currentPhaseActions[username], actionVote: actionVote}
                }

                // if user has a daytime role they can't perform their role
                else if (actionVote && playerRole && dayActionRoles.has(playerRole)) {
                    return res.json({message: "You can't perform this role at night."});
                }

                // user can't perform role if they don't have actions left
                else if (actionVote && playerNumActions && playerNumActions <= 0) {
                    return res.json({message: "You have taken all the actions available to this role."});
                }

                // if the user has a dayvote, alert them that they can't vote
                if (dayVote) {
                    return res.json({message: "You can't day vote at night..."});
                }
            }


            // if anything was updated, let mongoose know that it was modified
            if (dayVote || actionVote) {
                game.markModified('actions');
                await game.save();
                return res.json({message: "action updated"});

            }

            else {
                return res.json({message: "couldn't update actions"})
            }
        }
    }

    catch (error) {
        console.log(error);
    }
}

// post a message
export const postMessage = async (req : Request, res : Response) => {
    const playerId = req.id;
    const username = req.username;
    const { gameId, chat } = req.params;
    const { content } = req.body;

    try {
        const game = await ActiveGame.findById(gameId).exec();

        if (game) {
            const picture = game.playerInfos[username].picture;

            if (chat === "all") {
                game.allChat.push({username, content, picture});
            }
            else if (chat === "mafia") {
                game.mafiaChat.push({username, content, picture});
            }
            else if (chat === "cop") {
                game.copChat.push({username, content, picture});
            }

            await game.save();

            return res.json({message: "Message received"});
        }

        else {
            res.status(404).json({message: "Game not found"});
        }
    }

    catch (error) {
        console.log(error);
    }

}