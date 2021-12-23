/*
Functions for hiding and showing interior/exterior parts of mesh based on boxed zones
Language:    JavaScript
History:
2020 Aug 27: First version. Anton Gerdelan
*/

/* TODO
PROBLEMS WITH THIS

- visible flickering/stutter as sections enable/disable the first time

*/

var zone_user_in_firebreak = false;
var zone_user_in_treasury = false;
var zone_user_in_reading_room = false;
var zone_user_in_stairwell = false;
var zone_user_outside = false;

let zone_firebreak_id = "FireBreak Box";
let zone_reading_room_id = "Reading Room Box";
let zone_treasury_id = "Treasury Box";
let zone_stairwell_id = "Stairwell Box"; // TODO(Anton) use this and the entrance doors

var zone_firebreak_mesh;
var zone_reading_room_mesh;
var zone_treasury_mesh;
var zone_stairwell_mesh;

var zone_ground_root_id = "Ground";
var zone_treasury_root_id = "Interior (2)";
var zone_treasury_b_root_id = "Interior (2)";
var zone_shelves_root_id = "Shelves";
var zone_reading_room_root_id = "ReadingRoomContent";
var zone_ground_root_node;
var zone_treasury_root_node;
var zone_treasury_b_root_node;
var zone_shelves_root_node;
var zone_reading_room_root_node;

var zones_were_init = false;

function zones_init() {
	{ // hide the 'zones' from ZoneBoxes
		// NB when feeling clever could grab the ZoneBoxes parent node and iterate children to find all these
		var zoneBoxesNode = scene.getNodeByID("ZoneBoxes");
		if (!zoneBoxesNode) {
			console.error("Couldn't find zone boxes head node `ZoneBoxes`");
		} else {
			var zoneBoxes = zoneBoxesNode.getChildren();
			for (var i = 0; i < zoneBoxes.length; i++) {
				//console.log("Found zone box " + zoneBoxes[i].id);
				zoneBoxes[i].isVisible = false;
			}
		}
	}
	{ // hide the Cross Section divider meshes
		var crossSectionNode = scene.getNodeByID("Cross Section");
		if (!crossSectionNode) {
			console.error("Couldn't find zone boxes head node `Cross Section`");
		} else {
			var meshes = crossSectionNode.getChildren();
			for (var i = 0; i < meshes.length; i++) {
				meshes[i].isVisible = false;
			}
		}
	}
	// find individual zones we need to fiddle with and make a variable for each
	zone_firebreak_mesh = scene.getNodeByID(zone_firebreak_id);
	if (!zone_firebreak_mesh) {
		console.error("Couldn't find zone_firebreak_id " + zone_firebreak_id);
		return;
	}
	zone_reading_room_mesh = scene.getNodeByID(zone_reading_room_id);
	if (!zone_reading_room_mesh) {
		console.error("Couldn't find zone_reading_room_mesh " + zone_reading_room_id);
		return;
	}
	zone_treasury_mesh = scene.getNodeByID(zone_treasury_id);
	if (!zone_treasury_mesh) {
		console.error("Couldn't find zone_treasury_id " + zone_treasury_id);
		return;
	}
	zone_stairwell_mesh = scene.getNodeByID(zone_stairwell_id);
	if (!zone_stairwell_mesh) {
		console.error("Couldn't find zone_stairwell_id " + zone_stairwell_id);
		return;
	}
	{ // root node for whole blocks of the mesh
		zone_ground_root_node = scene.getNodeByID(zone_ground_root_id);
		if (!zone_ground_root_node) {
			console.error("Couldn't find zone_ground_root_id:" + zone_ground_root_id);
			return;
		}
		zone_treasury_root_node = scene.getNodeByID(zone_treasury_root_id);
		if (!zone_treasury_root_node) {
			console.error("Couldn't find zone_treasury_root_id:" + zone_treasury_root_id);
			return;
		}
		zone_treasury_b_root_node = scene.getNodeByID(zone_treasury_b_root_id);
		if (!zone_treasury_b_root_node) {
			console.error("Couldn't find zone_treasury_b_root_id:" + zone_treasury_b_root_id);
			return;
		}
		zone_shelves_root_node = scene.getNodeByID(zone_shelves_root_id);
		if (!zone_shelves_root_node) {
			console.error("Couldn't find zone_shelves_root_id: " + zone_shelves_root_id);
			return;
		}
		zone_reading_room_root_node = scene.getNodeByID(zone_reading_room_root_id);
		if (!zone_reading_room_root_node) {
			console.error("Couldn't find zone_reading_room_root_id: " + zone_reading_room_root_id);
			return;
		}
	}
	zones_were_init = true;
	console.log("zones initialised");
}

var zone_gr_was_enabled = true;
var zone_rr_was_enabled = true;
var zone_tr_was_enabled = true;

function zones_update() {
	if (!zones_were_init) { return; }

	zone_user_in_firebreak = zone_firebreak_mesh.intersectsPoint(scene.activeCamera.position);
	zone_user_in_treasury = zone_treasury_mesh.intersectsPoint(scene.activeCamera.position);
	zone_user_in_reading_room = zone_reading_room_mesh.intersectsPoint(scene.activeCamera.position);
	zone_user_in_stairwell = zone_stairwell_mesh.intersectsPoint(scene.activeCamera.position);
	if (!zone_user_in_firebreak && !zone_user_in_treasury && !zone_user_in_reading_room && !zone_user_in_stairwell) {
		zone_user_outside = true;
	} else {
		zone_user_outside = false;
	}

	var zone_gr_enable = false;
	var zone_rr_enable = false;
	var zone_tr_enable = false;

	if (zone_user_outside) {
		zone_gr_enable = true;
	}
	if (zone_user_in_stairwell) { // TODO line up better with doors
		zone_gr_enable = true;
		zone_rr_enable = true;
	}
	if (zone_user_in_reading_room) {
		zone_rr_enable = true;
	}
	if (zone_user_in_firebreak) { // TODO let firebreak decide
		zone_rr_enable = true;
		zone_tr_enable = true;
	}
	if (zone_user_in_treasury) {
		zone_tr_enable = true;
	}

	// the setEnabled() functions seem to be expensive so i avoid calling them every frame with an extra variable:

	// switch ground on/off
	if (zone_gr_enable && !zone_gr_was_enabled) {
		zone_ground_root_node.setEnabled(true);
	} else if (!zone_gr_enable && zone_gr_was_enabled) {
		zone_ground_root_node.setEnabled(false);
	}

	// switch reading room on/off
	if (zone_rr_enable && !zone_rr_was_enabled) {
		zone_reading_room_root_node.setEnabled(true);
	} else if (!zone_rr_enable && zone_rr_was_enabled) {
		zone_reading_room_root_node.setEnabled(false);
	}

	// switch treasurey on/off
	if (zone_tr_enable && !zone_tr_was_enabled) {
		zone_treasury_root_node.setEnabled(true);
		zone_treasury_b_root_node.setEnabled(true);
		zone_shelves_root_node.setEnabled(true);
	} else if (!zone_tr_enable && zone_tr_was_enabled) {
		zone_treasury_root_node.setEnabled(false);
		zone_treasury_b_root_node.setEnabled(false);
		zone_shelves_root_node.setEnabled(false);
	}

	zone_gr_was_enabled = zone_gr_enable;
	zone_rr_was_enabled = zone_rr_enable;
	zone_tr_was_enabled = zone_tr_enable;
}
