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

        if (data.operationType == 'insert') {
            const {_id, name, roles, players, numPlayersJoined, numPlayersMax} = data.fullDocument;
            const playerObjs = playersToJson(players);
            const idString = (_id as mongoose.Types.ObjectId).toString();
            const gameObj : openGameJson = {id: idString, name, roles, playerObjs, numPlayersJoined, numPlayersMax };
            io.emit("openGame:create", gameObj);
            console.log('emit create')
        }

        else if (data.operationType == 'delete') {
            io.emit("openGame:delete", data.documentKey._id.toString());
        }

        else if (data.operationType == 'update') {

            console.log('updating game');
            const gameId = data.documentKey._id.toString();
        
            if (data.updateDescription.updatedFields) {
                const numPlayersJoined = data.updateDescription.updatedFields.numPlayersJoined as number;
                const players = data.updateDescription.updatedFields.players;
            
                // if a player joins the game, data.players doesn't exist
                // however, players.1 where the number is the index of the players array does exist
                // and contains the player id
                if (players) {
                    console.log('player left')
                    const playerObjs = playersToJson(players)
                    io.emit("openGame:update:leave", gameId, numPlayersJoined, playerObjs);
                }
            
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