import cron from 'node-cron'
import { Server } from 'socket.io'
import { DateTime } from 'luxon'; 
import { ActiveGame, action, PlayerInterface } from '../models/activeGameModel';
import { Role } from '../rolesConfig';

export default function alertNextPhase(io : Server, gameId : string, startDate : string) {
    let deadline = DateTime.fromISO(startDate);
    cron.schedule('*/2 * * * *', () => {
        deadline = deadline.plus({minutes: 2});
        const isoString = deadline.toISO();
        if (isoString) {
            io.sockets.in(`${gameId}:all`).emit('next phase', isoString);
        }
    })
}

async function updateGameState(gameId : string) {
    const game = await ActiveGame.findById(gameId).exec();
    if (game) {
        const isDay = game.library.length % 2 === 1;

        if (isDay) {

        }

        else {
            const recentActions = game.actions[game.actions.length - 1];
            const actedPlayers = Object.keys(recentActions);
            const playerOrder = orderByPriority(actedPlayers, game.players, isDay);
    
            let runningState = {...game.players};
            for (const username of playerOrder) {
                const userRole = game.players[username].role;
                const target = recentActions[username].actionVote;

                if (target) {
                    const targetRole = game.players[target];

                    performRole(game.players, userRole, targetRole, game.players[])

                }
            }
            for (const username in recentActions) {
                const role = game.players[username].role;
    
            }
        }
    }
}


type PriorityTable = {
    [role in Role] : number;
}

const nightPriority : PriorityTable = {
    "Toaster": 1,
    "Doctor": 2,
    "Cop": 3,
    "Mafia": 4,
    "Godfather": 4,
    "Sniper": 4,
    "Creeper": 5,
    "Gravedigger": 6,
    "Villager": 6,
    "Bulletproof": 6,
    "Kamikaze": Infinity
}

const dayPriority : PriorityTable = {
    "Kamikaze": 1,
    "Bulletproof": 2,
    "Toaster": Infinity,
    "Doctor": Infinity,
    "Cop": Infinity,
    "Mafia": Infinity,
    "Godfather": Infinity,
    "Sniper": Infinity,
    "Creeper": Infinity,
    "Gravedigger": Infinity,
    "Villager": Infinity,
}

function constructPlayerLibrary(playerEvents, library) {
    
}
function orderByPriority(actedPlayers: string[], players: PlayerInterface, isDay : boolean) {
    if (isDay) {
        // sort by priority and return usernames
        return actedPlayers.map((username) => username).sort((username) => dayPriority[players[username].role])
    }

    else {
        return actedPlayers.map((username) => username).sort((username) => nightPriority[players[username].role])
    }
}

// ROLE ACTION PRIORITY
function performRole(players: PlayerInterface, userRole: Role, targetRole: Role, playerLibrary: string[]) {
    if (userRole === "Mafia") {

    }

    else if (userRole === "Toaster") {

    }

    else if (userRole === "Godfather") {

    }

    else if (userRole === "Doctor") {

    }

    else if (userRole === "Sniper") {

    }
}