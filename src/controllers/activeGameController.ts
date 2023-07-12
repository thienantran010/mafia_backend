import mongoose from 'mongoose';
import { ActiveGame, activeGameJson, playerJson, messageJson } from '../models/activeGameModel';
import { UserInterface } from '../models/userModel'
import { Request, Response } from 'express';

export const getUserActiveGames = async (req: Request, res: Response) => {
    try {
        const playerId = req.id;
        const playerUsername = req.username;
        const games = await ActiveGame.find({ "players.username": playerUsername });
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

        const players : playerJson[] = game.players.map((player) => {
            return ({
                username: player.username,
                isAlive: player.isAlive,
                role: player.role,
                numActionsLeft: player.numActionsLeft
            });
        })

        // if player isn't in the game, don't give them the game info.
        if (!players.map((player) => player.username).includes(username)) {
            return res.status(403).json({message: "You are not in this game"});
        }

        const messages : messageJson[] = game.messages.map((message) => {
            const playerInfo = game.playerInfos.get(message.username);

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
        });

        const activeGame : activeGameJson = {
            id: game._id.toString(),
            name: game.name,
            players: players,
            actions: game.actions,
            library: game.library,
            messages: messages
        }

        return res.json({activeGame});
    }

    catch (error) {
        console.log(error);
    }
}
