import { initState } from "./initState";
import updateGame_night from "../gameLogic/updateGame_night";
import { ActionInterface } from "../models/activeGameModel";
import initTest from "./initTest";

const updateFunction = updateGame_night;

/******************************
 * CURRENT NIGHT TOAST TESTS **
 ******************************/
let description = "Toaster toasts villager";
let curState = initState(undefined);
let curActions : ActionInterface = {"Toaster": {actionVote: "Villager"}};
let libIndex = "0";
let expectedState = initState({"Villager": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
let expectedLibEntry : string[] = [];
let shouldLibUpdate = false;
let shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Bulletproof (with vest)";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Bulletproof"}};
libIndex = "0";
expectedState = initState({"Bulletproof": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Cop";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Cop"}, "Cop": {actionVote: "Toaster"}};
libIndex = "0";
expectedState = initState({"Cop": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Creeper (creeping self)";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Creeper"}, "Creeper": {actionVote: "Creeper"}};
libIndex = "0";
expectedState = initState({"Creeper": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Sniper";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Sniper"}, "Sniper": {actionVote: "Toaster"}};
libIndex = "0";
expectedState = initState({"Sniper": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Mafia attacks Villager. Doctor tries to heal villager but Toaster toasts Doctor.";
curState = initState(undefined);
curActions = {"Mafia": {actionVote: "Villager"}, "Toaster": {actionVote: "Doctor"}, "Doctor": {actionVote: "Toaster"}};
libIndex = "0";
expectedState = initState({"Villager": {isAlive: false}, "Doctor": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Villager, the Villager, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Gravedigger (reviving Villager)";
curState = initState({"Villager": {isAlive: false}});
curActions = {"Toaster": {actionVote: "Gravedigger"}, "Gravedigger": {actionVote: "Villager"}};
libIndex = "0";
expectedState = initState({"Villager": {isAlive: false}, "Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Kamikaze";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Kamikaze"}};
libIndex = "0";
expectedState = initState({"Kamikaze": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Mafia";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Mafia"}};
libIndex = "0";
expectedState = initState({"Mafia": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts Godfather";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Godfather"}};
libIndex = "0";
expectedState = initState({"Godfather": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Toaster toasts self";
curState = initState(undefined);
curActions = {"Toaster": {actionVote: "Toaster"}};
libIndex = "0";
expectedState = initState({"Toaster": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

/******************************
 * TOAST DAMAGE TESTS **
 ******************************/

///////////////////////////////
//          VILLAGER         //
///////////////////////////////
description = "Villager dies to Toaster. Doctor was healing them but was toasted.";
curState = initState({"Villager": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Doctor"}, "Doctor": {actionVote: "Villager"}};
libIndex = "2";
expectedState = initState({"Villager": {isAlive: false, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}, "Doctor": {toastedBy: ["Toaster"], events: {"2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Villager, the Villager, was killed by the Toaster."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Villager almost dies to Toaster but is saved by the Doctor";
curState = initState({"Villager": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Villager"}};
libIndex = "2";
expectedState = initState({"Villager": {toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Villager was almost killed by the Toaster, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = false;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Villager dies to Toaster. Villager was retoasted.";
curState = initState({"Villager": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Villager"}};
libIndex = "2";
expectedState = initState({"Villager": {isAlive: false, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Villager, the Villager, was killed by the Toaster."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Villager almost dies to Toaster but is saved by the Doctor. Villager was retoasted.";
curState = initState({"Villager": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Villager"}, "Toaster": {actionVote: "Villager"}};
libIndex = "2";
expectedState = initState({"Villager": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Villager was almost killed by the Toaster, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

////////////////////////////////
//  BULLETPROOF (WITH VEST)   //
////////////////////////////////
description = "Bulletproof almost dies to Toaster, but is saved by their vest. Doctor was healing them but was toasted";
curState = initState({"Bulletproof": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Doctor"}, "Doctor": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: true, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}, "Doctor": {toastedBy: ["Toaster"], events: {"2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof was almost killed by the Toaster, but was saved by their bulletproof vest!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Bulletproof almost dies to Toaster, but is saved by their vest. Doctor was healed them.";
curState = initState({"Bulletproof": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: true, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof was almost killed by the Toaster, but was saved by their bulletproof vest!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Bulletproof almost dies to Toaster but is saved by their vest. Bulletproof is retoasted.";
curState = initState({"Bulletproof": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: true, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof was almost killed by the Toaster, but was saved by their bulletproof vest!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Bulletproof almost dies to Toaster but is saved by their vest. Doctor heals them. Bulletproof was retoasted.";
curState = initState({"Bulletproof": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Bulletproof"}, "Toaster": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: true, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof was almost killed by the Toaster, but was saved by their bulletproof vest!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

////////////////////////////////
// BULLETPROOF (WITHOUT VEST) //
////////////////////////////////
description = "Bulletproof (without vest) dies to Toaster. Doctor was healing them but was toasted";
curState = initState({"Bulletproof": {numActionsLeft: 0, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Doctor"}, "Doctor": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: false, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}, "Doctor": {toastedBy: ["Toaster"], events: {"2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof, the Bulletproof, was killed by the Toaster."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Bulletproof (without vest) almost dies to Toaster but is saved by the Doctor.";
curState = initState({"Bulletproof": {numActionsLeft: 0, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: true, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof was almost killed by the Toaster, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = false;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Bulletproof (without vest) is killed by the Tosater. Bulletproof is retoasted.";
curState = initState({"Bulletproof": {numActionsLeft: 0, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: false, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof, the Bulletproof, was killed by the Toaster."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Bulletproof (without vest) is almost killed by the Toaster but is saved by the Doctor. Bulletproof is retoasted";
curState = initState({"Bulletproof": {numActionsLeft: 0, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Bulletproof"}, "Toaster": {actionVote: "Bulletproof"}};
libIndex = "2";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: true, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Bulletproof was almost killed by the Toaster, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

///////////////////////////////
//  GRAVEDIGGER (REVIVING)   //
///////////////////////////////
description = "Gravedigger dies to Toaster. Gravedigger revives Sniper. Doctor was healing them but was toasted";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0},"Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Gravedigger": {actionVote: "Sniper"}, "Toaster": {actionVote: "Doctor"}, "Doctor": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Sniper": {numActionsLeft: 1, isAlive: true}, "Gravedigger": {numActionsLeft: 0, isAlive: false, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}, "Doctor": {toastedBy: ["Toaster"], events: {"2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger, the Gravedigger, was killed by the Toaster.", "Sniper, the Sniper, was revived by Gravedigger, the Gravedigger."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Gravedigger almost dies to Toaster, but was saved by the Doctor. Gravedigger revives Sniper.";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0},"Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Gravedigger": {actionVote: "Sniper"}, "Doctor": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Sniper": {numActionsLeft: 1, isAlive: true}, "Gravedigger": {numActionsLeft: 0, isAlive: false, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger was almost killed by the Toaster, but was saved by the Doctor!", "Sniper, the Sniper, was revived by Gravedigger, the Gravedigger."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Gravedigger tries to revive Sniper but is retoasted.";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Gravedigger": {actionVote: "Sniper"}, "Toaster": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {numActionsLeft: 1, isAlive: false, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger, the Gravedigger, was killed by the Toaster."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Gravedigger almost dies to Toaster but is saved by the Doctor. Gravedigger is retoasted.";
curState = initState({"Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Gravedigger": {actionVote: "Sniper"}, "Doctor": {actionVote: "Gravedigger"}, "Toaster": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Gravedigger": {numActionsLeft: 1, isAlive: true, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger was almost killed by the Toaster, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

///////////////////////////////
//GRAVEDIGGER (NOT REVIVING) //
///////////////////////////////
description = "Gravedigger (not reviving) dies to Toaster. Doctor was healing them but was toasted";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0},"Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Doctor"}, "Doctor": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {numActionsLeft: 1, isAlive: false, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}, "Doctor": {toastedBy: ["Toaster"], events: {"2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger, the Gravedigger, was killed by the Toaster."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Gravedigger (not reviving) almost dies to Toaster, but was saved by the Doctor.";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0},"Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Sniper": {numActionsLeft: 0, isAlive: false}, "Gravedigger": {numActionsLeft: 1, isAlive: true, toastedBy: [], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger was almost killed by the Toaster, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = false;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Gravedigger (not reviving) is retoasted.";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Toaster": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {numActionsLeft: 1, isAlive: false, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger, the Gravedigger, was killed by the Toaster."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Gravedigger (not reviving) almost dies to Toaster but is saved by the Doctor. Gravedigger is retoasted.";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
curActions = {"Doctor": {actionVote: "Gravedigger"}, "Toaster": {actionVote: "Gravedigger"}};
libIndex = "2";
expectedState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {numActionsLeft: 1, isAlive: true, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"], "2": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}});
expectedLibEntry = ["Gravedigger was almost killed by the Toaster, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

///////////////////////////////
//          CREEPER          //
///////////////////////////////


