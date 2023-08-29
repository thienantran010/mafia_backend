import { Server } from 'socket.io'
import { Duration } from 'luxon'; 
import { ActiveGame, action, PlayerInterface } from '../models/activeGameModel';
import { ActiveGameInterface } from '../models/activeGameModel';
import updateGame_day from './updateGame_day';
import updateGame_night from './updateGame_night';
import { Role } from '../rolesConfig';

export default async function updateGame(gameId : string | undefined) {
    console.log("reached updateGame function");
    if (gameId) {
        const game = await ActiveGame.findById(gameId).exec();
        if (game) {
            const isDay = game.library.length % 2 === 1;
            const updateFunction = isDay ? updateGame_day : updateGame_night;

            const state = game.players;
            const actions = game.actions[game.actions.length - 1];
            const libraryIndex = game.library.length.toString();
            const { didUpdateLibrary, didUpdateState, updatedState, newLibEntry } = updateFunction(state, actions, libraryIndex);

            // calculate if mafia or village won
            const alivePlayers = Object.keys(updatedState).filter((key : string) => updatedState[key].isAlive);
            let numMafiaAlive = 0;
            let numVillageAlive = 0;
            const MafiaRoles : Set<Role> = new Set(["Mafia", "Godfather", "Kamikaze", "Toaster"]);
            for (const player of alivePlayers) {
                if (MafiaRoles.has(updatedState[player].role)) {
                    numMafiaAlive += 1;
                }
                else {
                    numVillageAlive += 1;
                }
            }

            if (numMafiaAlive > numVillageAlive || numMafiaAlive == 0) {
                game.timeLeft = "GAME ENDED";
                game.markModified("timeLeft");

                if (numMafiaAlive > numVillageAlive) {
                    newLibEntry.push("The Mafia has won!");
                }
                else {
                    newLibEntry.push("The Village has won!");
                }
            }
            game.library.push(newLibEntry);
            game.markModified("library");

            // add empty object to actions array
            game.actions.push({});
            game.markModified("actions");

            if (didUpdateState) {
                game.markModified("players");
            }

            return {message: "Game saved", updatedGame: await game.save()}
        }
        
        else {
            return {message: "Game could not be found"}
        }

    }

    else {
        return {message: "ID needed"}
    }
}