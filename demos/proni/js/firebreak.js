/*
Functions for controlling the animation of the firebreak doors
Language:    JavaScript
History:
2020 Aug 27: First version. Anton Gerdelan
*/

//
// Variables from the 3D model
//
let firebreak_zone_box_id = "FireBreak Box";
// left and right are from perspective of user standing in reading room, looking towards firebreak
let firebreak_reading_room_door_left_id = "FiretrapDoor1 Left";
let firebreak_reading_room_door_right_id = "FireTrapDoor1 Right";
// left and right are from perspective of user standing in firebreak, looking towards treasury
let firebreak_treasury_door_left_id = "FireTrapDoor2 Left";
let firebreak_treasury_door_right_id = "FiretrapDoor2 Right";

//
// Babylon.js variables from the scene
//
var firebreak_zone_box_mesh; // invisible box covering the firebreak area
var firebreak_rr_door_left_mesh; // firebreak doors on reading room side
var firebreak_rr_door_right_mesh;
var firebreak_tr_door_left_mesh; // and treasury side
var firebreak_tr_door_right_mesh;

//
// Variables calculated in this file
//
let firebreak_pos = [];
let firebreak_rr_doors_pos = new BABYLON.Vector3(31.69, 4.29, 0.05);
let firebreak_tr_doors_pos = new BABYLON.Vector3(25.82, 3.54, 0.05);
let firebreak_activation_distance_m = 3.0;

let firebreak_was_init = false;
function firebreak_init() {
	console.log("firebreak init");
	firebreak_rr_door_left_mesh = scene.getNodeByID(firebreak_reading_room_door_left_id);
	if (!firebreak_rr_door_left_mesh) {
		console.error("firebreak couldn't find door in mesh: " + firebreak_reading_room_door_left_id);
	} else {
		firebreak_rr_door_left_mesh.rotation = new BABYLON.Vector3(0.0, -1.57, 0.0);
	}
	firebreak_rr_door_right_mesh = scene.getNodeByID(firebreak_reading_room_door_right_id);
	if (!firebreak_rr_door_right_mesh) {
		console.error("firebreak couldn't find door in mesh: " + firebreak_reading_room_door_right_id);
	} else {
		firebreak_rr_door_right_mesh.rotation = new BABYLON.Vector3(0.0, 1.57, 0.0);
	}
	firebreak_tr_door_left_mesh = scene.getNodeByID(firebreak_treasury_door_left_id);
	if (!firebreak_tr_door_left_mesh) {
		console.error("firebreak couldn't find door in mesh: " + firebreak_treasury_door_left_id);
	} else {
		firebreak_tr_door_left_mesh.rotation = new BABYLON.Vector3(0.0, -1.57, 0.0);
	}
	firebreak_tr_door_right_mesh = scene.getNodeByID(firebreak_treasury_door_right_id);
	if (!firebreak_tr_door_right_mesh) {
		console.error("firebreak couldn't find door in mesh: " + firebreak_treasury_door_right_id);
	} else {
		firebreak_tr_door_right_mesh.rotation = new BABYLON.Vector3(0.0, 1.57, 0.0);
	}
	firebreak_zone_box_mesh = scene.getNodeByID(firebreak_zone_box_id);
	if (!firebreak_zone_box_mesh) {
		console.error("firebreak couldn't find zone mesh: " + firebreak_zone_box_id);
	}
	firebreak_was_init = true;
}

function firebreak_rotate_meshes(rr_l, rr_r, tr_l, tr_r) {
	if (firebreak_rr_door_left_mesh) {
		let fac = Math.min(Math.max(rr_l, 0.0), 1.0); // clamp to range of 0-1
		firebreak_rr_door_left_mesh.rotation.y = -1.57 + fac * 1.57;
	}
	if (firebreak_rr_door_right_mesh) {
		let fac = Math.min(Math.max(rr_r, 0.0), 1.0); // clamp to range of 0-1
		firebreak_rr_door_right_mesh.rotation.y = 1.57 - fac * 1.57;
	}
	if (firebreak_tr_door_left_mesh) {
		let fac = Math.min(Math.max(tr_l, 0.0), 1.0); // clamp to range of 0-1
		firebreak_tr_door_left_mesh.rotation.y = -1.57 + fac * 1.57;
	}
	if (firebreak_tr_door_right_mesh) {
		let fac = Math.min(Math.max(tr_r, 0.0), 1.0); // clamp to range of 0-1
		firebreak_tr_door_right_mesh.rotation.y = 1.57 - fac * 1.57;
	}
}

let firebreak_state = 0;
let firebreak_opening_time_s = 2.5; // was 5.0 originally
let firebreak_closing_time_s = 0.5; // was 0.5 originally
let firebreak_states_period_s = [
	1.0, // 0 all closed
	firebreak_opening_time_s, // 1 rr opening as user approached fb from rr
	firebreak_opening_time_s, // 2 rr open and waiting for user to enter fb
	firebreak_closing_time_s, // 3 rr closing
	firebreak_opening_time_s, // 4 tr opening
	1.0, // 5 tr open and waiting for user to exit fb
	firebreak_closing_time_s, // 6 tr closing and reset to 0
	firebreak_opening_time_s, // 7 tr opening as user approached fb from tr
	firebreak_opening_time_s, // 8 tr open and waiting for user to enter fb
	firebreak_closing_time_s, // 9 tr closing
	firebreak_opening_time_s, // 10 rr opening
	1.0, // 11 rr open and waiting for user to exit fb
	firebreak_closing_time_s // 12 rr closing
];

let firebreak_state_time_s = 0.0;

/* Call this function to check the camera's position for proximity to doors and process animations. */
function firebreak_update(elapsed_s) {
	if (!firebreak_was_init) { return; }

	let anim_fac = 0.0;
	let in_firebreak = false;
	let approaching_firebreak_from_reading_room = false;
	let approaching_firebreak_from_treasury = false;

	let rr_doors_dist = firebreak_rr_doors_pos.subtract(scene.activeCamera.position).length();
	if (rr_doors_dist < firebreak_activation_distance_m) {
		approaching_firebreak_from_reading_room = true;
	}
	let tr_doors_dist = firebreak_tr_doors_pos.subtract(scene.activeCamera.position).length();
	if (tr_doors_dist < firebreak_activation_distance_m) {
		approaching_firebreak_from_treasury = true;
	}

	if (firebreak_zone_box_mesh) {
		in_firebreak = firebreak_zone_box_mesh.intersectsPoint(scene.activeCamera.position);
	}

	switch (firebreak_state) {
		// 0 all closed
		case 0:
			if (approaching_firebreak_from_reading_room) {
				firebreak_state = 1;
				firebreak_state_time_s = 0.0;
				return;
			} else if (approaching_firebreak_from_treasury) {
				firebreak_state = 7;
				firebreak_state_time_s = 0.0;
				return;
			}
			break;

		// rr opening because user approached the firebreak from inside the reading room 
		case 1:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(anim_fac, anim_fac, 0.0, 0.0);
			if (anim_fac >= 1.0) {
				firebreak_state_time_s = 0.0;
				firebreak_state++;
				return;
			}
			break;

		// rr open and waiting for user to enter
		case 2:
			firebreak_state_time_s += elapsed_s;
			if (in_firebreak) {
				firebreak_state_time_s = 0.0;
				firebreak_state++;
				return;
			}
			if (firebreak_state_time_s > firebreak_states_period_s[firebreak_state]) {
				firebreak_state_time_s = 0.0;
				firebreak_state = 12; // go to closing before closed
				return;
			}
			break;

		// rr closing
		case 3:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(1.0 - anim_fac, 1.0 - anim_fac, 0.0, 0.0);
			if (anim_fac >= 1.0) {
				firebreak_state_time_s = 0.0;
				firebreak_state++;
				return;
			}
			break;

		// tr opening
		case 4:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(0.0, 0.0, anim_fac, anim_fac);
			if (anim_fac >= 1.0) {
				firebreak_state_time_s = 0.0;
				firebreak_state++;
				return;
			}
			break;

		// tr open & waiting for user to leave
		case 5:
			if (!in_firebreak) {
				firebreak_state_time_s = 0.0;
				firebreak_state++;
				return;
			}

			break;

		// tr closing and reset to all closed
		case 6:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(0.0, 0.0, 1.0 - anim_fac, 1.0 - anim_fac);
			if (anim_fac >= 1.0) {
				anim_fac = 1.0;
				firebreak_state = 0; // back to the start
				firebreak_state_time_s = 0.0;
				return;
			}
			break;

		// tr opening because user approached firebreak from inside the treasury
		case 7:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(0.0, 0.0, anim_fac, anim_fac);
			if (anim_fac >= 1.0) {
				firebreak_state++;
				firebreak_state_time_s = 0.0;
				return;
			}
			break;

		// tr open and waiting for user to enter firebreak
		case 8:
			firebreak_state_time_s += elapsed_s;
			if (in_firebreak) {
				firebreak_state_time_s = 0.0;
				firebreak_state++;
				return;
			}
			if (firebreak_state_time_s > firebreak_states_period_s[firebreak_state]) {
				firebreak_state_time_s = 0.0;
				firebreak_state = 6; // go to closing before closed
				return;
			}
			break;

		// tr closing
		case 9:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(0.0, 0.0, 1.0 - anim_fac, 1.0 - anim_fac);
			if (anim_fac >= 1.0) {
				anim_fac = 1.0;
				firebreak_state++; // back to the start
				firebreak_state_time_s = 0.0;
				return;
			}
			break;

		// 8 rr opening
		case 10:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(anim_fac, anim_fac, 0.0, 0.0);
			if (anim_fac >= 1.0) {
				firebreak_state++;
				firebreak_state_time_s = 0.0;
				return;
			}
			break;

		// 9 rr open and waiting for user to leave firebreak and enter rr
		case 11:
			if (!in_firebreak) {
				firebreak_state++;
				firebreak_state_time_s = 0.0;
				return;
			}
			break;

		// 10 rr closing and reset to all closed
		case 12:
			firebreak_state_time_s += elapsed_s;
			anim_fac = firebreak_state_time_s / firebreak_states_period_s[firebreak_state];
			firebreak_rotate_meshes(1.0 - anim_fac, 1.0 - anim_fac, 0.0, 0.0);
			if (anim_fac >= 1.0) {
				firebreak_state = 0;
				firebreak_state_time_s = 0.0;
				return;
			}
			break;

		default:
			break;
	}
}
