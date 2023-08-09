import { HydratedDocument } from 'mongoose';
import { ActiveGameInterface, PlayerInterface } from '../models/activeGameModel';
import { Counter, event, RunningDayState, RunningState} from './gameLogicTypes';

export default async function updateGame_day (game: HydratedDocument<ActiveGameInterface>, nextPhase: string){
    let counter : Counter = {}
    const recentActions = game.actions[game.actions.length - 1];
    const alivePlayers = Object.keys(game.players).filter((username) => {
        return game.players[username].isAlive;
    });
    const events : event[] = []
    for (const username of alivePlayers) {

        // collect day votes
        const vote = recentActions[username].dayVote;
        if (vote) {
            if (counter[vote]) {
                counter[vote] += 1;
            }
            else {
                counter[vote] = 0;
            }
        }

        // perform action
        const actionVote = recentActions[username].actionVote;
        if (actionVote) {
            const event : event = {
                user: {
                    username: username,
                    role: game.players[username].role
                },
                target: {
                    username: actionVote,
                    role: game.players[actionVote].role
                }
            }
            events.push(event);
        }
    }

    const runningState = calculateRunningState(events);

    const {didUpdateState, didUpdateLibrary} = updateDayState(game.players, game.library, runningState, counter);

    if (didUpdateState) {
        game.markModified('players');
    }

    if (didUpdateLibrary) {
        game.markModified('library');
    }

    game.nextPhase = nextPhase;
    await game.save();
}

function calculateRunningState(events: event[]) {
    const runningState : RunningDayState = {}
    for (const event of events) {
        const userRole = event.user.role;
        const targetName = event.target.username;
    
        if (userRole === "Kamikaze") {
            const kamikazes = runningState[targetName].blownBy;
            if (kamikazes === undefined) {
                runningState[targetName].blownBy = [event.user.username];
            }
            else {
                runningState[targetName].blownBy.push(event.user.username);
            }
        }
    }
    return runningState;
}

function updateDayState(currentState: PlayerInterface, library : string[][], runningState: RunningDayState, counter: Counter) {
    let didUpdateState = false;
    let didUpdateLibrary = false;
    const libraryEntry = [];

    for (const username in runningState) {
        if (runningState[username].blownBy) {
            if (currentState[username].role === "Bulletproof" && currentState[username].numActionsLeft > 0) {
                let vest = currentState[username].numActionsLeft;
                let blownByIndex = 0

                while (vest > 0) {
                    const kamikazeName = runningState[username].blownBy[0];
                    libraryEntry.push(`${username}, the Bulletproof, was almost killed by ${kamikazeName}, the Kamikaze, but was 
                    saved by their bulletproof vest!`);
                    vest = 0;
                    blownByIndex += 1;
                    currentState[username].numActionsLeft = 0;
                }

                while (blownByIndex < runningState[username].blownBy.length) {
                    libraryEntry.push(`${username}, the Bulletproof, was almost killed by the kamikaze, but`)
                    currentState[username].isAlive = false;
                }
            }
        
            didUpdateState = true;
            didUpdateLibrary = true;
        }
    }

    const executed = getExecutedName(counter);
    if (executed) {
        const executedRole = currentState[executed].role;

        currentState[executed].isAlive = false;
        libraryEntry.push(`${executed}, the ${executedRole}, has been executed by the village.`);

        didUpdateState = true;
        didUpdateLibrary = true;
    }

    library.push(libraryEntry);
    didUpdateLibrary = true;

    return {didUpdateState, didUpdateLibrary}
}

function getExecutedName(counter: Counter) {
    // if there were no votes
    if (Object.keys(counter).length === 0) {
        return "";
    }
    let highestVotes = 0;
    for (const username in counter) {
        highestVotes = Math.max(counter[username], highestVotes);
    }
    const deathOptions = []

    function getRandomInt(max : number) {
        return Math.floor(Math.random() * max);
    }

    for (const username in counter) {
        if (counter[username] === highestVotes) {
            deathOptions.push(username);
        }
    }

    const deathIndex = getRandomInt(deathOptions.length);
    const deadPlayerUsername = deathOptions[deathIndex];
    return deadPlayerUsername;
}