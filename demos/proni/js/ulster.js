/*
Functions for the simulated search for PRONI event specific items
Language:    JavaScript
History:
2020 Sep 7: First version. Anton Gerdelan
*/

var ulster_images_dir = "images/ulster_items/";
//var ulster_building_mesh_attachment_id = "Book Stand002";
var ulster_image_filenames = ["ulster_41_PRONI_D4216_1_2_P_001.jpg", "ulster_1024_RCBL_23_161.JPG", "ulster_2048_DC005243_Page_087.jpg", "ulster_2048_NAI_QRO_1_1_3_01_Page477.jpg", "ulster_2048_proni_d_597_1_1_013_rathlin.jpg"];
var ulster_item_scale = 1.0;
var ulster_mesh;
var ulster_mesh_id = "ulster_item_mesh";

var bays_map_images_dir = "images/bays_map/";
var bays_map_image_filenames = ["DKPRI 27 1895 State of Bays diagram (1).JPG", "DKPRI 27 1895 State of Bays diagram (2).JPG", "DKPRI 27 1895 State of Bays diagram (3).JPG"];
var bays_map_mesh;
var bays_map_mesh_id = "bays_map_mesh";

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
		// NOTE(ANton) I have no idea why x axis position needs to be reversed between submesh's reported location and new item location. makes no sense to me.
		ulster_mesh.position = new BABYLON.Vector3(34.98, 3.5, -4.23);
		ulster_mesh.rotation = new BABYLON.Vector3(27.7 * one_deg_in_rad, 0.0, 0.0); // radians (27.7 degrees)

		ulster_select_item(0);
	}

	// TODO load locations of items in from Gary's manifest
	// TODO pair images and item treasury locations

	// TODO create a plane for the hostpot map and some buttons for the items -- get icons from john
	{
		bays_map_mesh = BABYLON.MeshBuilder.CreatePlane(bays_map_mesh_id, { height: 1 }, scene);
		// reading lecturn on the left hand side: -38.17, 3.4, -3.21
		bays_map_mesh.position = new BABYLON.Vector3(38.17, 3.48, -3.21);
		bays_map_mesh.rotation = new BABYLON.Vector3(79.6 * one_deg_in_rad, -90 * one_deg_in_rad, 0.0); // radians (27.7 degrees)
		let image_url = bays_map_images_dir + bays_map_image_filenames[1];
		var backface_culling = true;
		apply_image_url_to_mesh(image_url, bays_map_mesh_id, true, backface_culling, _ulster_item_resize_cb);
	}
}

function ulster_select_item(item_index) {
	if (item_index < 0 || item_index >= ulster_image_filenames.length) {
		console.error("item_index " + item_index + " is out of range. max: " + ulster_image_filenames.length);
		return;
	}
	// TODO change material of item on reading desk
	let image_url = ulster_images_dir + ulster_image_filenames[item_index];
	var backface_culling = false;
	apply_image_url_to_mesh(image_url, ulster_mesh_id, true, backface_culling, _ulster_item_resize_cb);
	// TODO set to visible
}

function ulster_teleport_to_treasury_item(item_index) {

}

// if retrieved an item, count down to update animation and return to reading room
function ulster_update_animations(elapsed_s) {

}

// move the camera to the reading location/angle
function ulster_teleport_to_reading_desk() {

}
