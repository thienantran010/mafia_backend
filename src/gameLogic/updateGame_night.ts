import { HydratedDocument } from 'mongoose';
import { RunningState, event } from './gameLogicTypes';
import { PlayerInterface, ActiveGameInterface } from '../models/activeGameModel';
import { MafiaRole, Role } from '../rolesConfig';

export default async function updateGame_night(game: ActiveGameInterface) {
    const recentActions = game.actions[game.actions.length - 1];
    const actedPlayers = Object.keys(recentActions);
    const currentState = game.players;
    const alivePlayers = Object.keys(game.players).filter((username) => {
        return game.players[username].isAlive;
    });
    const events : event[] = []

    for (const username of alivePlayers) {

        const targetName = recentActions[username].actionVote;
        if (targetName) {
            const event : event = {
                user: {
                    username: username,
                    role: game.players[username].role
                },
                target: {
                    username: targetName,
                    role: game.players[username].role
                }
            }

            events.push(event);
        }
    }

    const runningState = calculateRunningState(events, alivePlayers);

    const { didUpdateState, didUpdateLibrary, newState, newLibrary } = getUpdates(game.players, runningState, game.library);

    const newGame = {...game, players: newState, library: newLibrary};
    
    return {didUpdateState, didUpdateLibrary, newGame};
}

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
    for (const username in alivePlayers) {
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
function getUpdates(currentState: PlayerInterface, runningState: RunningState, library: string[][]) {
    let newState = {...currentState};
    let newLibrary = [...library];
    let didUpdateState = false;
    let didUpdateLibrary = false;
    const libraryEntry = [];
    const libraryIndex = library.length.toString();

    // running state has all the alive players, so we are calculating the player state
    // after actions have been done to them
    // note that players who have been toasted this night will not have their action/vist
    // reflected in the running state
    for (const username in runningState) {
        const isBp = currentState[username].role === "Bulletproof";
        let numActionsLeft = currentState[username].numActionsLeft;
        let heals = runningState[username].healedBy.length;
        let attacks = runningState[username].attackedBy.length;
        let snipes = runningState[username].snipedBy.length;

        // if undefined, set up a new array
        if (!newState[username].events[libraryIndex]) {
            newState[username].events[libraryIndex] = []
            didUpdateState = true;
        }

        // previous night toast damage
        if (currentState[username].toastedBy.length > 0) {
            let toasters = currentState[username].toastedBy;

            // toasts don't have an effect if the toaster is dead
            for (const toaster in toasters) {
                if (currentState[toaster].isAlive) {
                    didUpdateLibrary = true;
                    if (isBp && numActionsLeft > 0) {
                        newState[username].numActionsLeft = 0;
                        didUpdateState = true;
                        numActionsLeft = 0;
                        libraryEntry.push(`${username} was almost killed by the Toaster, but was saved by their vest!`);
                    }

                    else if (heals > 0) {
                        heals -= 1;
                        libraryEntry.push(`${username} was almost killed by the Toaster, but was saved by the Doctor.`);
                    }

                    else {
                        newState[username].isAlive = false;
                        didUpdateState = true;
                        libraryEntry.push(`${username} was killed by the Toaster.`);
                    }
                }
            }
        }

        // current night toast
        if (runningState[username].toastedBy.length > 0) {
            didUpdateState = true;
            let toasters = runningState[username].toastedBy;
            newState[username].toastedBy = toasters;
            for (const toaster in toasters) {
                newState[username].events[libraryIndex].push("A toaster has toasted you!");
            }        
        }

        // attack damage
        if (runningState[username].attackedBy.length > 0) {
            didUpdateLibrary = true;

            let attackers = runningState[username].attackedBy;

            for (const attacker in attackers) {

                if (isBp && numActionsLeft > 0) {
                    newState[username].numActionsLeft = 0;
                    didUpdateState = true;
                    numActionsLeft = 0;
                    libraryEntry.push(`${username} was almost killed by the Mafia, but was saved by their vest!`);
                }

                else if (heals > 0) {
                    heals -= 1;
                    libraryEntry.push(`${username} was almost killed by the Mafia, but was saved by the Doctor.`);
                }

                else {
                    newState[username].isAlive = false;
                    didUpdateState = true;
                    libraryEntry.push(`${username} was killed by the Mafia.`);
                }
            }
        }

        // snipe damage
        if (runningState[username].snipedBy.length > 0) {
            didUpdateLibrary = true;

            const snipers = runningState[username].snipedBy;

            for (const sniper in snipers) {
                if (isBp && numActionsLeft > 0) {
                    newState[username].numActionsLeft = 0;
                    didUpdateState = true;
                    numActionsLeft = 0;
                    libraryEntry.push(`${username} was almost killed by the Mafia, but was saved by their vest!`);
                }

                else if (heals > 0) {
                    heals -= 1;
                    libraryEntry.push(`${username} was almost killed by the Mafia, but was saved by the Doctor.`);
                }

                else {
                    newState[username].isAlive = false;
                    didUpdateState = true;
                    libraryEntry.push(`${username} was killed by the Sniper.`);
                }
            }
        }

        const mafia : MafiaRole = "Mafia";
        const godfather : MafiaRole = "Godfather";
        const toaster : MafiaRole = "Toaster";
        const visibleMafia : Set<Role> = new Set([mafia, godfather, toaster]);

        // cop check
        if (runningState[username].copTarget) {
            didUpdateState = true;
            if (visibleMafia.has(currentState[runningState[username].copTarget].role)) {
                newState[username].events[libraryIndex].push(`Your investigation revealed that ${runningState[username].copTarget} is sided with the mafia!`);
            }
            else {
                newState[username].events[libraryIndex].push(`Your investigation revealed that ${runningState[username].copTarget} is sided with the town.`);
            }
        }

        // creeper seeing visits
        if (runningState[username].creeperTarget) {
            const targetName = runningState[username].creeperTarget;
            const toasters = runningState[targetName].toastedBy;
            const doctors = runningState[targetName].healedBy;
            const mafias = runningState[targetName].attackedBy;
            const cops = runningState[targetName].checkedBy;
            const visitors = shuffle(toasters.concat(doctors, mafias, cops));
            
            for (const visitor of visitors) {
                newState[username].events[libraryIndex].push(`You crept ${targetName} and saw ${visitor} visit them!`);
                didUpdateState = true;
            }
        }
    }

    newLibrary.push(libraryEntry);
    didUpdateLibrary = true;
    return {didUpdateState, didUpdateLibrary, newState, newLibrary}

}