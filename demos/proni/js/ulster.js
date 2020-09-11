/*
Functions for the simulated search for PRONI event specific items
Language:    JavaScript
History:
2020 Sep 7: First version. Anton Gerdelan
*/

var ulster_currently_selected_item = -1;

var ulster_images_dir = "images/ulster_items/";
//var ulster_building_mesh_attachment_id = "Book Stand002";
var ulster_image_filenames = ["ulster_41_PRONI_D4216_1_2_P_001.jpg", "ulster_1024_RCBL_23_161.JPG", "ulster_2048_DC005243_Page_087.jpg", "ulster_2048_NAI_QRO_1_1_3_01_Page477.jpg", "ulster_2048_proni_d_597_1_1_013_rathlin.jpg"];
var ulster_item_scale = 1.0;
var ulster_mesh;
var ulster_mesh_id = "ulster_item_mesh";
var ulster_animation_timer_total_s = 2.5;
var ulster_animation_timer_curr_s = 0.0;
var ulster_is_animating = false;

var bays_map_images_dir = "images/bays_map/";
var bays_map_image_filenames = ["DKPRI 27 1895 State of Bays diagram (1).JPG", "DKPRI 27 1895 State of Bays diagram (2).JPG", "DKPRI 27 1895 State of Bays diagram (3).JPG"];
var bays_map_mesh;
var bays_map_mesh_id = "bays_map_mesh";

var bays_map_icon_locations = [
	{ x: 38.15371073146863, y: 3.4829893068791398, z: -3.6858229086998646 },
	{ x: 38.26639732959234, y: 3.462307450678236, z: -2.9988693437511653 },
	{ x: 38.0489237821048, y: 3.5022213567400162, z: -3.118939881557899 },
	{ x: 37.940868591611455, y: 3.5220532182774194, z: -3.11684838523204 },
	{ x: 37.832748242318836, y: 3.541897055792994, z: -2.704259016555053 }
];
var bays_map_icon_meshes = []

var ulster_green_item_shelf_locations = [
	{ x: -2.15, y: 6.38, z: 7.37 },
	{ x: 14.88, y: 9.44, z: -9.88 },
	{ x: 10.65, y: 12.50, z: 5.69 },
	{ x: -4.68, y: 15.55, z: 5.30 },
	{ x: 14.89, y: 18.59, z: -12.28 }
];
var ulster_item_shelf_user_locations = [
	{ x: -1.120822694034883, y: 6.379304885864258, z: 8.335161821474872 },
	{ x: 13.683353347384507, y: 9.42132568359375, z: -10.764374685757758 },
	{ x: 11.8529691898396, y: 12.463345527648926, z: 4.909883973437672 },
	{ x: -3.4612484109355406, y: 15.531146049499512, z: 4.1425538226602665 },
	{ x: 13.817953123244141, y: 18.57316493988037, z: -13.468687666840454 }
];
var ulster_item_shelf_user_rotations = [
	{ x: 0.10091542096614921, y: -8.59875837635061, z: 0 },
	{ x: 0.0633580325072943, y: -11.800531411810164, z: 0 },
	{ x: 0.06602234871064483, y: -19.814204481580077, z: 0 },
	{ x: 0.0944153147831138, y: -19.646796582798903, z: 0 },
	{ x: 0.1370302560868334, y: -11.946001385225632, z: 0 }
];
var ulster_shelf_item_move_directions = [
	1.0,
	-1.0,
	1.0,
	1.0,
	-1.0
];

var ulster_shelf_item_meshes = [];
var ulster_shelf_mesh_id = "ulster_shelf_item_mesh_";

function _ulster_item_resize_cb(meshname) {
	let mesh = scene.getNodeByID(meshname);
	var textures = mesh.material.getActiveTextures();
	let w = textures[0].getSize().width;
	let h = textures[0].getSize().height;
	let aspect = w / h;
	mesh.scaling.x *= (ulster_item_scale * aspect);
	mesh.scaling.y *= (ulster_item_scale);
}

function ulster_init() {
	{
		console.log("ulster: loading " + ulster_image_filenames.length + " ulster search items");

		ulster_mesh = BABYLON.MeshBuilder.CreatePlane(ulster_mesh_id, { height: 1 }, scene);
		// NOTE(Anton) I have no idea why x axis position needs to be reversed between submesh's reported location and new item location. makes no sense to me.
		ulster_mesh.position = new BABYLON.Vector3(34.98, 3.5, -4.23);
		ulster_mesh.rotation = new BABYLON.Vector3(27.7 * one_deg_in_rad, 0.0, 0.0); // radians (27.7 degrees)
		ulster_mesh.isVisible = false;
	}

	// TODO create some buttons for the items -- get icons from john
	{
		bays_map_mesh = BABYLON.MeshBuilder.CreatePlane(bays_map_mesh_id, { height: 1 }, scene);
		// reading lecturn on the left hand side: -38.17, 3.4, -3.21
		bays_map_mesh.position = new BABYLON.Vector3(38.17, 3.48, -3.21);
		bays_map_mesh.rotation = new BABYLON.Vector3(79.6 * one_deg_in_rad, -90 * one_deg_in_rad, 0.0); // radians (27.7 degrees)
		let image_url = bays_map_images_dir + bays_map_image_filenames[1];
		var backface_culling = false; // spheres look weird from the other side
		apply_image_url_to_mesh(image_url, bays_map_mesh_id, true, backface_culling, _ulster_item_resize_cb);
	}

	{ // put green items on shelves - just boxes for now

		let material = new BABYLON.StandardMaterial("ulster_shelf_item_material", scene);
		material.diffuseColor = material.emissiveColor = material.specularColor = material.ambientColor = new BABYLON.Color3(0, 1, 0);
		material.alpha = 0.75;

		for (var i = 0; i < ulster_green_item_shelf_locations.length; i++) {
			ulster_shelf_item_meshes[i] = BABYLON.MeshBuilder.CreateBox(ulster_shelf_mesh_id + i, { width: 0.25, depth: 0.1, height: 0.5 }, scene);
			ulster_shelf_item_meshes[i].material = material;
			ulster_shelf_item_meshes[i].position = new BABYLON.Vector3(ulster_green_item_shelf_locations[i].x, ulster_green_item_shelf_locations[i].y, ulster_green_item_shelf_locations[i].z);
		}

		// items on bays map
		for (var i = 0; i < bays_map_icon_locations.length; i++) {
			bays_map_icon_meshes[i] = BABYLON.MeshBuilder.CreateSphere("bays_map_icon_" + i, { diameter: 0.1, segments: 16 }, scene);
			bays_map_icon_meshes[i].material = material;
			bays_map_icon_meshes[i].position = new BABYLON.Vector3(bays_map_icon_locations[i].x, bays_map_icon_locations[i].y, bays_map_icon_locations[i].z);
		}

	}
}

function ulster_select_reading_desk_item(item_index) {
	if (item_index < 0 || item_index >= ulster_image_filenames.length) {
		console.error("item_index " + item_index + " is out of range. max: " + ulster_image_filenames.length);
		return;
	}
	// prevent multiple clicks resetting the anim
	if ( ulster_is_animating && ulster_currently_selected_item == item_index ) {
		return;
	}

	// change material of item on reading desk
	let image_url = ulster_images_dir + ulster_image_filenames[item_index];
	var backface_culling = false;
	apply_image_url_to_mesh(image_url, ulster_mesh_id, true, backface_culling, _ulster_item_resize_cb);
	ulster_mesh.isVisible = true;
	
	ulster_currently_selected_item = item_index;
	ulster_is_animating = true;
	ulster_animation_timer_curr_s = 0.0;
}

function ulster_teleport_to_treasury_item(item_index) {
	if (item_index < 0 || item_index >= ulster_image_filenames.length) {
		console.error("item_index " + item_index + " is out of range. max: " + ulster_image_filenames.length);
		return;
	}

	scene.activeCamera.position = new BABYLON.Vector3(ulster_item_shelf_user_locations[item_index].x, ulster_item_shelf_user_locations[item_index].y, ulster_item_shelf_user_locations[item_index].z);
	scene.activeCamera.rotation = new BABYLON.Vector3(ulster_item_shelf_user_rotations[item_index].x, ulster_item_shelf_user_rotations[item_index].y, ulster_item_shelf_user_rotations[item_index].z);
}

// if retrieved an item, count down to update animation and return to reading room
function ulster_update_animations(elapsed_s) {
	if (!ulster_is_animating) { return; }

	ulster_animation_timer_curr_s += elapsed_s;
	if (ulster_animation_timer_curr_s >= ulster_animation_timer_total_s) {
		ulster_shelf_item_meshes[ulster_currently_selected_item].position.x = ulster_green_item_shelf_locations[ulster_currently_selected_item].x;
		ulster_teleport_to_reading_desk();
		ulster_is_animating = false;
		ulster_animation_timer_curr_s = 0.0;
	}

	// animate the book being pulled out
	var anim_factor = ulster_animation_timer_curr_s / ulster_animation_timer_total_s;
	var anim_move_dist_m = 0.5;
	ulster_shelf_item_meshes[ulster_currently_selected_item].position.x = ulster_green_item_shelf_locations[ulster_currently_selected_item].x + ulster_shelf_item_move_directions[ulster_currently_selected_item] * anim_move_dist_m * anim_factor;
}

// move the camera to the reading location/angle
function ulster_teleport_to_reading_desk() {
	scene.activeCamera.position = new BABYLON.Vector3(35.00, 4.07, -5.63);
	scene.activeCamera.rotation = new BABYLON.Vector3(0.455, -6.28, 0);
}

// TODO(Anton) this is vulnerable to click-through-wall stuff
function ulster_check_for_book_interactions(clicked_mesh_id, distance) {
	// if distance is too far then ignore
	if (distance > 3.0) { console.log("distance of click was " + distance); return; }
	for (var i = 0; i < ulster_shelf_item_meshes.length; i++) {
		if (clicked_mesh_id == (ulster_shelf_mesh_id + i)) {

			ulster_select_reading_desk_item(i);
		}
	}
}

function ulster_check_for_bays_map_interactions(clicked_mesh_id, distance) {
	if (distance > 3.0) { console.log("distance of click was " + distance); return; }
	for (var i = 0; i < bays_map_icon_meshes.length; i++) {
		if (clicked_mesh_id == "bays_map_icon_" + i) {

			ulster_teleport_to_treasury_item(i);
		}
	}
}
