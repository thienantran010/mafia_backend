import { HydratedDocument } from 'mongoose';
import { ActiveGameInterface, PlayerInterface, ActionInterface } from '../models/activeGameModel';
import { Counter, event, RunningDayState, RunningState} from './gameLogicTypes';

// returns new state
export default function updateGame_day (state: PlayerInterface, actions: ActionInterface, libraryIndex: string){
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

    // calculate result of the day's events
    const runningState = calculateRunningState(events);

    // returns whether state or library was updated
    // not sure what will happen if we markModified when nothing changed
    const {didUpdateState, didUpdateLibrary, newState, newLibEntry} = getUpdates(state, runningState, libraryIndex, counter);
    return {didUpdateState, didUpdateLibrary, newState, newLibEntry};
}

function calculateRunningState(events: event[]) {
    const runningState : RunningDayState = {}
    for (const event of events) {
        const userRole = event.user.role;
        const targetName = event.target.username;
    
        // record who was blown up
        if (userRole === "Kamikaze") {
            const target = runningState[targetName];
            if (target === undefined) {
                runningState[targetName] = {blownBy: []};
            }
            runningState[targetName].blownBy.push(event.user.username);
            
        }
    }
    return runningState;
}

// use the day's events to update state
function getUpdates(currentState: PlayerInterface, runningState: RunningDayState, libraryIndex: string, counter: Counter) {
    let newState = {...currentState};
    let didUpdateState = false;
    let didUpdateLibrary = false;
    const newLibEntry = [];

    for (const username in runningState) {
        if (runningState[username].blownBy) {
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
                    newLibEntry.push(`${username}, the Bulletproof, was almost killed by ${kamikazeName}, the Kamikaze, but was saved by their bulletproof vest!`);
                    vest = 0;
                    blownByIndex += 1;
                    newState[username].numActionsLeft = 0;
                    newState[kamikazeName].isAlive = false;
                    newState[kamikazeName].numActionsLeft = 0;
                }

                while (blownByIndex < runningState[username].blownBy.length) {
                    const kamikazeName = runningState[username].blownBy[blownByIndex]
                    newLibEntry.push(`${username}, the Bulletproof, was blown up by ${kamikazeName}, the Kamikaze.`);
                    blownByIndex += 1;
                    newState[username].isAlive = false;
                    newState[kamikazeName].isAlive = false;
                    newState[kamikazeName].numActionsLeft = 0;
                }
            }

            else if (currentState[username].role !== "Bulletproof") {
                while (blownByIndex < runningState[username].blownBy.length) {
                    const kamikazeName = runningState[username].blownBy[blownByIndex]
                    newLibEntry.push(`${username}, the ${currentState[username].role}, was blown up by ${kamikazeName}, the Kamikaze.`);
                    blownByIndex += 1;
                    newState[username].isAlive = false;
                    newState[kamikazeName].isAlive = false;
                    newState[kamikazeName].numActionsLeft = 0;
                }
            }
        
            didUpdateState = true;
            didUpdateLibrary = true;
        }
    }

    const executed = getExecutedName(counter);
    if (executed) {
        const executedRole = currentState[executed].role;

        newState[executed].isAlive = false;
        newLibEntry.push(`${executed}, the ${executedRole}, was executed by the village.`);

        didUpdateState = true;
        didUpdateLibrary = true;
    }
    return {didUpdateState, didUpdateLibrary, newState, newLibEntry}
}

// how it works:
// get names of players with the most votes on them
// usually it's one player but if it's multiple, choose one randomly
// that player dies
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