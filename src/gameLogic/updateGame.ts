import { Server } from 'socket.io'
import { DateTime } from 'luxon'; 
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
            game.library.push(newLibEntry);

            if (didUpdateState) {
                game.markModified("players");
            }

            const currentState = game.players;
            const alivePlayers = Object.keys(currentState).filter((key : string) => currentState[key].isAlive);
            let numMafiaAlive = 0;
            let numVillageAlive = 0;
            const MafiaRoles : Set<Role> = new Set(["Mafia", "Godfather", "Kamikaze", "Toaster"]);
            for (const player of alivePlayers) {
                if (MafiaRoles.has(currentState[player].role)) {
                    numMafiaAlive += 1;
                }
                else {
                    numVillageAlive += 1;
                }
            }

            if (numMafiaAlive > numVillageAlive) {
                game.nextPhase = "GAME ENDED";
            }
            else {
                const nextPhase = DateTime.fromISO(game.nextPhase).plus({minutes: 2}).toISO();
                if (nextPhase) {
                    game.nextPhase = nextPhase;
                }
            }

            game.markModified("nextPhase");
            game.markModified("library");
            console.log(game);
            try {
                await game.save();
                console.log("game saved successfully");
            }
            catch {
                console.log("problem is saving game");
            }
            return {message: "Game updated"};
        }

        else {
            return {message: "Game could not be found"}
        }
    }

    else {
        return {message: "ID needed"}
    }
}