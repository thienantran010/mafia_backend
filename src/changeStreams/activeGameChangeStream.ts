import mongoose from 'mongoose';

import { ChangeStreamDeleteDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument} from 'mongodb';

import { ActiveGame, ActiveGameInterface, playerJson, messageJson, activeGameJson } from '../models/activeGameModel';
import { Server } from 'socket.io';

export default function activeGameChangeStream(io : Server) {
    const activeGameChangeStream = ActiveGame.watch();

    type ActiveGameChangeStreamEvent = ChangeStreamInsertDocument<ActiveGameInterface>
    | ChangeStreamDeleteDocument<ActiveGameInterface>
    | ChangeStreamUpdateDocument<ActiveGameInterface>

    activeGameChangeStream.on("change", (data : ActiveGameChangeStreamEvent) => {

      if (data.operationType === 'insert') {
        const game = data.fullDocument;

        // getActiveGame function from activeGameController
        const players : playerJson[] = game.players.map((player) => {
          return ({
              username: player.username,
              isAlive: player.isAlive,
              role: player.role,
              numActionsLeft: player.numActionsLeft
          });
        })

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

        io.emit("activeGame:create", activeGame);
      }

      else if (data.operationType === 'delete') {
        io.emit("activeGame:delete", data.documentKey._id.toString());
      }

      else if (data.operationType === 'update') {
        io.emit("activeGame:update");
      }
    })
}