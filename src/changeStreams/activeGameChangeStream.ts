import mongoose from 'mongoose';

import { ChangeStreamDeleteDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument} from 'mongodb';

import { ActiveGame, ActiveGameInterface, playerJson, messageJson, activeGameJson, actionJson,
        ActionInterface } from '../models/activeGameModel';
import { Server } from 'socket.io';
import alertNextPhase from '../jobs/alertNextPhase';

export default function activeGameChangeStream(io : Server) {
    const activeGameChangeStream = ActiveGame.watch();
    io.sockets.on('connection', function(socket) {

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
      if (data.operationType === 'insert') {
        const game = data.fullDocument;

        const activeGameListItem = {
          id: game._id.toString(),
          name: game.name
        }
        io.emit("activeGame:create", activeGameListItem);
        alertNextPhase(io, game._id.toString(), game.startDate);
      }


      if (data.operationType === 'delete') {
        io.emit("activeGame:delete", data.documentKey._id.toString());
      }

      else if (data.operationType === 'update') {
        console.log(data);
        // update to action voting
        if (data && data.updateDescription && data.updateDescription.updatedFields) {

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
                'nextPhase': /nextPhase/,
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
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('actions', value);
              }

              if (updatedField(field) === 'allChat') {
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', "allChat", value);
              }

              if (updatedField(field) === 'mafiaChat') {
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', 'mafiaChat', value);
              }

              if (updatedField(field) === 'copChat') {
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('chat', 'copChat', value);
              }

              if (updatedField(field) === 'library') {
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('library', value);
              }

              if (updatedField(field) === 'nextPhase') {
                io.sockets.in(`${data.documentKey._id.toString()}:all`).emit('phase', value);
              }
            }
        }
      }
    })
}