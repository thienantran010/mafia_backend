import { HydratedDocument } from 'mongoose';
import { ActiveGameInterface, PlayerInterface, ActionInterface } from '../models/activeGameModel';
import { Counter, event, RunningDayState, RunningState, UpdateFunction} from './gameLogicTypes';

// edits state to reflect new state
const updateGame_day : UpdateFunction = (state, actions, libraryIndex) => {
    let counter : Counter = {}
    const events : event[] = []
    for (const username in actions) {

        // add day vote to a counter
        const vote = actions[username].dayVote;
        if (vote) {
            if (counter[vote]) {
                counter[vote] += 1;
            }
            else {
                counter[vote] = 0;
            }
        }

        // record the action as an event
        const actionVote = actions[username].actionVote;
        if (actionVote) {
            const event : event = {
                user: {
                    username: username,
                    role: state[username].role
                },
                target: {
                    username: actionVote,
                    role: state[actionVote].role
                }
            }
            events.push(event);
        }
    }

    const executed = getExecutedName(counter);

    // calculate result of the day's events
    const runningState = calculateRunningState(events, executed);

    // returns whether state or library was updated
    // not sure what will happen if we markModified when nothing changed
    const {didUpdateState, didUpdateLibrary, updatedState, newLibEntry} = getUpdates(state, runningState, libraryIndex, counter);
    return {didUpdateState, didUpdateLibrary, updatedState, newLibEntry};
}

export default updateGame_day;

function calculateRunningState(events: event[], executed: string) {
    const runningState : RunningDayState = {}
    for (const event of events) {
        const userRole = event.user.role;
        const targetName = event.target.username;
    
        // record who was blown up
        if (userRole === "Kamikaze") {
            const target = runningState[targetName];
            if (targetName && target === undefined) {
                runningState[targetName] = {blownBy: [], executed: false};
            }
            runningState[targetName].blownBy.push(event.user.username);
            
        }
    }

    if (executed) {
        const executedVal = runningState[executed];
        if (executedVal === undefined) {
            runningState[executed] = {blownBy: [], executed: true}
        }
        runningState[executed].executed = true;
    }
    return runningState;
}

// use the day's events to update state
function getUpdates(currentState: PlayerInterface, runningState: RunningDayState, libraryIndex: string, counter: Counter) {
    let didUpdateState = false;
    let didUpdateLibrary = false;
    const newLibEntry = [];

    for (const username in runningState) {
        if (runningState[username].blownBy.length > 0) {
            let blownByIndex = 0
            // if BP and has a vest (actions left)
            if (currentState[username].role === "Bulletproof" && currentState[username].numActionsLeft > 0) {
                let vest = currentState[username].numActionsLeft;
                let blownByIndex = 0

                // refactor? a little confusing
                // intent: if BP has vest, first kamikaze blowing up BP removes vest
                // subsequent kamikazes kill them
                while (vest > 0) {
                    const kamikazeName = runningState[username].blownBy[0];
                    newLibEntry.push(`${username} was almost killed by ${kamikazeName}, the Kamikaze, but was saved by their bulletproof vest!`);
                    vest = 0;
                    blownByIndex += 1;
                    currentState[username].numActionsLeft = 0;
                    currentState[kamikazeName].isAlive = false;
                    currentState[kamikazeName].numActionsLeft = 0;
                }

                while (blownByIndex < runningState[username].blownBy.length) {
                    const kamikazeName = runningState[username].blownBy[blownByIndex]
                    newLibEntry.push(`${username}, the Bulletproof, was blown up by ${kamikazeName}, the Kamikaze.`);
                    blownByIndex += 1;
                    currentState[username].isAlive = false;
                    currentState[kamikazeName].isAlive = false;
                    currentState[kamikazeName].numActionsLeft = 0;
                }
            }

            else if (currentState[username].role !== "Bulletproof") {
                while (blownByIndex < runningState[username].blownBy.length) {
                    const kamikazeName = runningState[username].blownBy[blownByIndex]
                    newLibEntry.push(`${username}, the ${currentState[username].role}, was blown up by ${kamikazeName}, the Kamikaze.`);
                    blownByIndex += 1;
                    currentState[username].isAlive = false;
                    currentState[kamikazeName].isAlive = false;
                    currentState[kamikazeName].numActionsLeft = 0;
                }
            }
        
            didUpdateState = true;
            didUpdateLibrary = true;
        }

        if (runningState[username].executed) {
            currentState[username].isAlive  =false;
            newLibEntry.push(`${username}, the ${currentState[username].role}, was executed by the Village.`);
            didUpdateState = true;
            didUpdateLibrary = true;
        }
    }

    return {didUpdateState, didUpdateLibrary, updatedState: currentState, newLibEntry}
}

// how it works:
// get names of players with the most votes on them
// usually it's one player but if it's multiple, choose one randomly
// that player dies
// else return an empty string
function getExecutedName(counter: Counter) {

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