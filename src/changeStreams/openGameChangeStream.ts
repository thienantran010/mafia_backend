import mongoose from 'mongoose';
import { OpenGameInterface, OpenGame } from '../models/openGameModel';
import { User } from '../models/userModel';
import { playerJson, openGameJson, PlayerInterface } from '../models/openGameModel';
import { ChangeStreamInsertDocument, ChangeStreamDeleteDocument, ChangeStreamUpdateDocument } from 'mongodb';
import { Server } from 'socket.io';
export default function openGameChangeStream(io : Server) {

    const openGameChangeStream = OpenGame.watch();

    // types
    type ChangeStreamEvent = ChangeStreamInsertDocument<OpenGameInterface> 
                            | ChangeStreamDeleteDocument<OpenGameInterface>
                            | ChangeStreamUpdateDocument<OpenGameInterface>;

    openGameChangeStream.on("change", (data: ChangeStreamEvent) => {

        // helper function to produce array of {_id: ObjectId, username: string}
        function playersToJson(players : mongoose.Types.DocumentArray<PlayerInterface>) {
            return players.map((player) => { return {id: player.playerId.toString(), username: player.username}});
        }

        // send open game data to front-end open game list
        if (data.operationType == 'insert') {
            const {_id, name, roles, players, numPlayersJoined, numPlayersMax} = data.fullDocument;
            const playerObjs = playersToJson(players);
            const idString = (_id as mongoose.Types.ObjectId).toString();
            const gameObj : openGameJson = {id: idString, name, roles, playerObjs, numPlayersJoined, numPlayersMax };
            io.emit("openGame:create", gameObj);
        }

        // send open game key so front-end open game list can delete
        else if (data.operationType == 'delete') {
            io.emit("openGame:delete", data.documentKey._id.toString());
        }

        else if (data.operationType == 'update') {

            const gameId = data.documentKey._id.toString();
        
            // an open game can only be updated if a player joins or leaves the game
            if (data.updateDescription.updatedFields) {
                const numPlayersJoined = data.updateDescription.updatedFields.numPlayersJoined as number;
                const players = data.updateDescription.updatedFields.players;
            
                // TODO
                // refactor code so it uses regex to get updated fields similar to activeGameChangeStream
                // otherwise this works for now

                // if players is not undefined, someone left
                if (players) {
                    console.log('player left')
                    const playerObjs = playersToJson(players)
                    io.emit("openGame:update:leave", gameId, numPlayersJoined, playerObjs);
                }
            
                // else someone was added
                else {
                    console.log('player joined')
                    const updatedFields = data.updateDescription.updatedFields;
                    const playerObjs = []
                    for (const field of Object.values(updatedFields)) {
                        if (typeof field === "object" && "playerId" in field && "username" in field) {
                            playerObjs.push(field);
                        }
                    }

                    if (playerObjs.length > 0) {
                        io.emit("openGame:update:join", gameId, numPlayersJoined, playerObjs)
                    }
                }
            }    
        }
    });
}