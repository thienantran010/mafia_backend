import { HydratedDocument } from 'mongoose';
import { RunningState, event } from './gameLogicTypes';
import { PlayerInterface, ActionInterface } from '../models/activeGameModel';
import { MafiaRole, Role, roleNumActions } from '../rolesConfig';
import { UpdateFunction } from './gameLogicTypes';
import {cloneDeep} from 'lodash';

const updateGame_night : UpdateFunction = (state, actions, libraryIndex, shuffleCreepVisits = true) => {
    const alivePlayers = Object.keys(state).filter((username) => {
        return state[username].isAlive;
    });
    const events : event[] = []

    for (const username in actions) {

        const targetName = actions[username].actionVote;
        if (targetName) {
            const event : event = {
                user: {
                    username: username,
                    role: state[username].role
                },
                target: {
                    username: targetName,
                    role: state[targetName].role
                }
            }

            events.push(event);
        }
    }

    const runningState = calculateRunningState(events, alivePlayers);

    const { didUpdateState, didUpdateLibrary, updatedState, newLibEntry } = getUpdates(state, runningState, libraryIndex, shuffleCreepVisits);

    return { didUpdateState, didUpdateLibrary, updatedState, newLibEntry };
}

export default updateGame_night;
type PriorityTable = {
    [role in Role] : number;
}
const RolePriority : PriorityTable = {
    "Toaster": 1,
    "Doctor": 2,
    "Cop": 3,
    "Mafia": 3,
    "Godfather": 3,
    "Sniper": 3,
    "Creeper": 4,
    "Gravedigger": 4,

    // these roles don't have an action or don't act at night
    "Kamikaze": 5,
    "Bulletproof": 5,
    "Villager": 5
}
// put toaster events first so they can block other events from happening
function sortEvents(events: event[]) {
    events.sort((eventA, eventB) => RolePriority[eventA.user.role] - RolePriority[eventB.user.role]);
    return events;
}

// fill out fields for each player
function calculateRunningState(events: event[], alivePlayers: string[]) {
    const runningState : RunningState = {};
    const sortedEvents = sortEvents(events);
    for (const username of alivePlayers) {
        runningState[username] = {
            toastedBy: [],
            healedBy: [],
            attackedBy: [],
            snipedBy: [],
            checkedBy: [],
            copTarget: "",
            creeperTarget: "",
            gravediggerTarget: "",
        }
    }

    for (const event of sortedEvents) {
        const userName = event.user.username;
        const userRole = event.user.role;
        const targetName = event.target.username;
        const targetRole = event.target.role;

        if (runningState[userName].toastedBy.length === 0) {
            if (userRole === "Toaster") {
                runningState[targetName].toastedBy.push(userName);
            }
        
            else if (userRole === "Doctor") {
                runningState[targetName].healedBy.push(userName);
            }
        
            else if (userRole === "Mafia") {
                runningState[targetName].attackedBy.push(userName);
            }
        
            else if (userRole === "Godfather") {
                runningState[targetName].attackedBy.push(userName);
            }
        
            else if (userRole === "Sniper") {
                runningState[targetName].snipedBy.push(userName);
            }
    
            else if (userRole === "Cop") {
                runningState[targetName].checkedBy.push(userName);
                runningState[userName].copTarget = targetName;
            }
    
            else if (userRole === "Creeper") {
                runningState[userName].creeperTarget = targetName;
            }
    
            else if (userRole === "Gravedigger") {
                runningState[userName].gravediggerTarget = targetName;
            }
        }
    }

    return runningState;
}

// fish yates shuffle, from here: https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
const shuffle = (array: string[]) => { 
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; 
    } 
    return shuffledArray; 
}; 

// calculate night's events from runningState
function getUpdates(currentState: PlayerInterface, runningState: RunningState, libraryIndex: string, shuffleCreepVisits = true) {
    let didUpdateState = false;
    let didUpdateLibrary = false;
    const newLibEntry = [];

    // running state has all the alive players, so we are calculating the player state
    // after actions have been done to them
    // note that players who have been toasted this night will not have their action/visit
    // reflected in the running state
    for (const username in runningState) {
        const isBp = currentState[username].role === "Bulletproof";
        let numActionsLeft = currentState[username].numActionsLeft;
        let heals = runningState[username].healedBy.length;
        let attacks = runningState[username].attackedBy.length;
        let snipes = runningState[username].snipedBy.length;

        // previous night toast damage
        if (currentState[username].toastedBy.length > 0) {

            let toasters = currentState[username].toastedBy;

            // toasts don't have an effect if the toaster is dead
            for (const toaster of toasters) {
                if (currentState[toaster].isAlive) {
                    didUpdateLibrary = true;
                    if (isBp && numActionsLeft > 0) {
                        currentState[username].numActionsLeft = 0;
                        didUpdateState = true;
                        numActionsLeft = 0;
                        newLibEntry.push(`${username} was almost killed by the Toaster, but was saved by their bulletproof vest!`);
                    }

                    else if (heals > 0) {
                        heals -= 1;
                        newLibEntry.push(`${username} was almost killed by the Toaster, but was saved by the Doctor!`);
                    }

                    else {
                        currentState[username].isAlive = false;
                        didUpdateState = true;
                        newLibEntry.push(`${username}, the ${currentState[username].role}, was killed by the Toaster.`);
                    }
                }
            }
            
            // reset list of toasters for next night
            currentState[username].toastedBy = [];

            didUpdateLibrary = true;
        }

        // current night toast
        if (runningState[username].toastedBy.length > 0) {
            didUpdateState = true;
            if (!currentState[username].events[libraryIndex]) {
                currentState[username].events[libraryIndex] = []
            }
            let toasters = runningState[username].toastedBy;
            currentState[username].toastedBy = toasters;
            for (const toaster in toasters) {
                currentState[username].events[libraryIndex].push("Buttered toast was left on your doorstep. You were roleblocked!");
            }        
        }

        // attack damage
        if (runningState[username].attackedBy.length > 0) {
            didUpdateLibrary = true;

            let attackers = runningState[username].attackedBy;

            for (const attacker in attackers) {

                if (isBp && numActionsLeft > 0) {
                    currentState[username].numActionsLeft = 0;
                    didUpdateState = true;
                    numActionsLeft = 0;
                    newLibEntry.push(`${username} was almost killed by the Mafia, but was saved by their bulletproof vest!`);
                }

                else if (heals > 0) {
                    heals -= 1;
                    newLibEntry.push(`${username} was almost killed by the Mafia, but was saved by the Doctor!`);
                }

                else {
                    currentState[username].isAlive = false;
                    didUpdateState = true;
                    newLibEntry.push(`${username}, the ${currentState[username].role}, was killed by the Mafia.`);
                }
            }
        }

        // snipe damage
        if (runningState[username].snipedBy.length > 0) {
            didUpdateLibrary = true;

            const snipers = runningState[username].snipedBy;

            for (const sniper of snipers) {
                currentState[sniper].numActionsLeft = 0;

                if (isBp && numActionsLeft > 0) {
                    currentState[username].numActionsLeft = 0;
                    didUpdateState = true;
                    numActionsLeft = 0;
                    newLibEntry.push(`${username} was almost killed by the Sniper, but was saved by their bulletproof vest!`);
                }

                else if (heals > 0) {
                    heals -= 1;
                    newLibEntry.push(`${username} was almost killed by the Sniper, but was saved by the Doctor!`);
                }

                else {
                    currentState[username].isAlive = false;
                    didUpdateState = true;
                    newLibEntry.push(`${username}, the ${currentState[username].role}, was killed by the Sniper.`);
                }
            }
        }

        const mafia : MafiaRole = "Mafia";
        const kamikaze : MafiaRole = "Kamikaze";
        const toaster : MafiaRole = "Toaster";
        const visibleMafia : Set<Role> = new Set([mafia, kamikaze, toaster]);

        // cop check
        if (runningState[username].copTarget) {
            if (!currentState[username].events[libraryIndex]) {
                currentState[username].events[libraryIndex] = []
                didUpdateState = true;
            }
            didUpdateState = true;
            if (visibleMafia.has(currentState[runningState[username].copTarget].role)) {
                currentState[username].events[libraryIndex].push(`Your investigation revealed that ${runningState[username].copTarget} is sided with the Mafia!`);
            }
            else {
                currentState[username].events[libraryIndex].push(`Your investigation revealed that ${runningState[username].copTarget} is sided with the Village.`);
            }
        }

        // creeper seeing visits
        if (runningState[username].creeperTarget) {
            if (!currentState[username].events[libraryIndex]) {
                currentState[username].events[libraryIndex] = []
                didUpdateState = true;
            }
            const targetName = runningState[username].creeperTarget;
            const toasters = runningState[targetName].toastedBy;
            const doctors = runningState[targetName].healedBy;
            const mafias = runningState[targetName].attackedBy;
            const cops = runningState[targetName].checkedBy;
            const visitors = shuffleCreepVisits ? shuffle(toasters.concat(doctors, mafias, cops)) : toasters.concat(doctors, mafias, cops);
            
            for (const visitor of visitors) {
                currentState[username].events[libraryIndex].push(`You crept ${targetName} and saw ${visitor} visit them!`);
                didUpdateState = true;
            }

            if (visitors.length === 0) {
                currentState[username].events[libraryIndex].push(`You crept ${targetName} and saw nothing.`)
                didUpdateState = true;
            }
        }

        // gravedigger revives
        const revivedPlayer = runningState[username].gravediggerTarget
        if (revivedPlayer) {
            if (!currentState[revivedPlayer].isAlive) {
                const revivedPlayerRole = currentState[revivedPlayer].role;
                currentState[revivedPlayer].isAlive = true;
                currentState[revivedPlayer].numActionsLeft = roleNumActions[revivedPlayerRole];
                currentState[username].isAlive = false;
                currentState[username].numActionsLeft = 0;
                newLibEntry.push(`${revivedPlayer}, the ${currentState[revivedPlayer].role}, was revived by ${username}, the Gravedigger.`);
            }
            didUpdateState = true;
            didUpdateLibrary = true;
        }
    }

    return {didUpdateState, didUpdateLibrary, updatedState: currentState, newLibEntry}

}