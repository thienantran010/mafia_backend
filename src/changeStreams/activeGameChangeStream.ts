import mongoose from 'mongoose';

import { ChangeStreamDeleteDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument} from 'mongodb';

import { ActiveGame, ActiveGameInterface, playerJson, messageJson, activeGameJson, actionJson,
        ActionInterface } from '../models/activeGameModel';
import { Server } from 'socket.io';
import runGame from '../gameLogic/runGame';

export default function activeGameChangeStream(io : Server) {
    const activeGameChangeStream = ActiveGame.watch();
    io.sockets.on('connection', function(socket) {

      // add socket to appropriate chats/rooms
      socket.on('all', function(gameId) {
          socket.join(`${gameId}:all`);
      });

      socket.on('mafia', function(gameId) {
        socket.join(`${gameId}:mafia`);
      });

      socket.on('cop', function(gameId) {
        socket.join(`${gameId}:cop`);
      });

  });
    type ActiveGameChangeStreamEvent = ChangeStreamInsertDocument<ActiveGameInterface>
    | ChangeStreamDeleteDocument<ActiveGameInterface>
    | ChangeStreamUpdateDocument<ActiveGameInterface>

    activeGameChangeStream.on("change", (data : ActiveGameChangeStreamEvent) => {

      // when a new active game is created, send the necessary data for the front-end active game list
      if (data.operationType === 'insert') {
        const game = data.fullDocument;

        const activeGameListItem = {
          id: game._id.toString(),
          name: game.name
        }
        io.emit("activeGame:create", activeGameListItem);
        runGame(game._id.toString());
      }


      // when a new active game is deleted, send the key so front-end can delete it from the active game list
      if (data.operationType === 'delete') {
        io.emit("activeGame:delete", data.documentKey._id.toString());
      }

      else if (data.operationType === 'update') {

        if (data && data.updateDescription && data.updateDescription.updatedFields) {

            // returns the field that is updated based on updatedFields
            // fields in updatedFields can be in [name].[number] format. For instance, {"allChat.3": "hi"}
            // "allChat.3" would return "allChat"
            function updatedField(fieldToUpdate : string) {
              interface Patterns {
                [field : string]: RegExp;
              }
              const patterns : Patterns = {
                'actions': /^actions(\.\d+)?$/,
                'allChat': /^allChat(\.\d+)?$/,
                'mafiaChat': /^mafiaChat(\.\d+)?$/,
                'copChat': /^copChat(\.\d+)?$/,
                'library': /^library(\.\d+)?$/,
                'timeLeft': /timeLeft/,
                'players': /^players(\.\d+)?$/,
              }

              for (const field in patterns) {
                if (patterns[field].test(fieldToUpdate)) {
                  return field;
                }
              }

              return undefined;
            }

            const updatedFields = data.updateDescription.updatedFields;

            for (const [field, value] of Object.entries(updatedFields)) {

              if (updatedField(field) === 'actions') {
                if (Array.isArray(value)) {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('actions', value[value.length - 1]);
                }
                else {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('actions', value);
                }
              }

              if (updatedField(field) === 'allChat') {
                if (Array.isArray(value)) {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', 'allChat', value[value.length - 1]);
                }
                else {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', "allChat", value);
                }
              }

              if (updatedField(field) === 'mafiaChat') {
                if (Array.isArray(value)) {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', 'mafiaChat', value[value.length - 1]);
                }
                else {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', "mafiaChat", value);
                }
              }

              if (updatedField(field) === 'copChat') {
                if (Array.isArray(value)) {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', 'copChat', value[value.length - 1]);
                }
                else {
                  io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', "copChat", value);
                }
              }

              if (updatedField(field) === 'library') {
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('library', value);
              }

              if (updatedField(field) === "players") {
                console.log(value);
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('players', value);
              }

              if (updatedField(field) === 'timeLeft') {
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('timeLeft', value);
              }
            }
        }
      }
    })
}