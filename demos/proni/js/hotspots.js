/*
Functions for pulling in information hotspots.
Language:    JavaScript
History:
2020 Sep 2: First version. Anton Gerdelan
*/

var hotspots_json_url = "hotspots.json";
var hotspots_text_images_dir = "images/hotspot_text/";
var hotspots_pictures_dir = "images/hotspot_pictures/";
var hotspots_image_format = ".jpg";
var hotspots_scale = 1.0;
var hotspot_text_scale = 0.5;
var hotspot_text_vert_offset = 1.0;
var hotspot_image_additional_vert_offset = 0.75;

// green spheres to show you can active the firebreak
var hotspot_firebreak_locations = [
	{ x: 33.37, y: 3.57, z: 0.00 },
	{ x: 24.59, y: 2.83, z: 0.00 }
];

function hotspots_init() {

	let green_material = new BABYLON.StandardMaterial("hotspot_green_mat", scene);
	green_material.diffuseColor = green_material.emissiveColor = green_material.specularColor = green_material.ambientColor = new BABYLON.Color3(0, 1, 0);
	green_material.alpha = 0.57;

	/* GREEN SPHERES TO VISUALISE LOCATIONS
	let locations_node = scene.getNodeByID("Locations");
	if (locations_node) {
		let children = locations_node.getChildren();
		//	console.log("found " + children.length + " locations: ");
		for (var i = 0; i < children.length; i++) {
			//		console.log("location: " + children[i].id);
			// add a 'hotspot' sphere -- colour-coded to match video windows
			let sphere_mesh = BABYLON.MeshBuilder.CreateSphere(children[i].id + "_icon_mesh", { diameter: 1, segments: 32 }, scene);
			sphere_mesh.material = material;

			// babylon seems to -x on everything /except/ loaded transform position nodes so i do it manually here
			sphere_mesh.position = new BABYLON.Vector3(-children[i].position.x, children[i].position.y, children[i].position.z);

			//		console.log("created sphere for " + children[i].id + " at " + sphere_mesh.position);
		}
	}
	*/

	{ // firebreak door green spheres
		for (var i = 0; i < hotspot_firebreak_locations.length; i++) {
			let sphere_mesh = BABYLON.MeshBuilder.CreateSphere("door_green_sphere_" + i, { diameter: 0.5, segments: 16 }, scene);
			sphere_mesh.position = new BABYLON.Vector3(hotspot_firebreak_locations[i].x, hotspot_firebreak_locations[i].y, hotspot_firebreak_locations[i].z);
			sphere_mesh.material = green_material;
		}
	}

	var xmlhttp = new XMLHttpRequest();
	console.log(" loading hotspots from " + hotspots_json_url);
	xmlhttp.open("GET", hotspots_json_url, true);
	xmlhttp.onload = function (e) {
		let str = xmlhttp.responseText;
		let loaded_json = JSON.parse(str);

		//	console.log("number of hotspots: " + loaded_json.hotspots.length);
		for (var i = 0; i < loaded_json.hotspots.length; i++) {
			let pos_split = loaded_json.hotspots[i].position_xyz.split(' ');

			let text_mesh_name = "hotspot_" + i + "_text_plane";
			let image_mesh_name = "hotspot_" + i + "_image_plane";

			var position = new BABYLON.Vector3(parseFloat(pos_split[0]), parseFloat(pos_split[1]), parseFloat(pos_split[2]));

			if (loaded_json.hotspots[i].location_id) {
				//	console.log("found location id: " + loaded_json.hotspots[i].location_id);
				let transform_node = scene.getNodeByID(loaded_json.hotspots[i].location_id);
				if (transform_node) {
					//	console.log("hotspot " + i + " set to transform node location");
					// babylon seems to -x on everything /except/ loaded transform position nodes so i do it manually here
					position = new BABYLON.Vector3(-transform_node.position.x, transform_node.position.y, transform_node.position.z);
					position.y += hotspot_text_vert_offset;
				}
			}

			// TODO also add title
			if (loaded_json.hotspots[i].text_image) {
				let mesh = BABYLON.MeshBuilder.CreatePlane(text_mesh_name, { height: 1 }, scene);
				mesh.position = position;
				if (!loaded_json.hotspots[i].billboard || loaded_json.hotspots[i].billboard != "no") {
					mesh.billboardMode = BABYLON.TransformNode.BILLBOARDMODE_Y;
				} else if (loaded_json.hotspots[i].rotation_y_deg) {
					mesh.rotation.y = parseFloat(loaded_json.hotspots[i].rotation_y_deg) * one_deg_in_rad; // convert to radians
				}
				let image_url = hotspots_text_images_dir + loaded_json.hotspots[i].text_image;
				if (loaded_json.hotspots[i].text_image_scale) {
					console.log("[hotspots] applying text image scale of " + loaded_json.hotspots[i].text_image_scale);
					mesh.scaling.x = mesh.scaling.y = parseFloat(loaded_json.hotspots[i].text_image_scale);
				}
				apply_image_url_to_mesh(image_url, text_mesh_name, true, true, _hotspot_text_resize_cb);
			}

			if (loaded_json.hotspots[i].picture) {
				let mesh = BABYLON.MeshBuilder.CreatePlane(image_mesh_name, { height: 1 }, scene);
				let picture_scale = 1.0;
				if (loaded_json.hotspots[i].picture_scale) {
					picture_scale = parseFloat(loaded_json.hotspots[i].picture_scale);
				}
				mesh.position = new BABYLON.Vector3(position.x, position.y + hotspot_image_additional_vert_offset * picture_scale, position.z);
				//mesh.rotation.y = parseFloat(loaded_json.hotspots[i].rotation_y_deg) * one_deg_in_rad; // convert to radians
				if (!loaded_json.hotspots[i].billboard || loaded_json.hotspots[i].billboard != "no") {
					mesh.billboardMode = BABYLON.TransformNode.BILLBOARDMODE_Y;
				} else if (loaded_json.hotspots[i].rotation_y_deg) {
					mesh.rotation.y = parseFloat(loaded_json.hotspots[i].rotation_y_deg) * one_deg_in_rad; // convert to radians
				}
				//console.log("hotspot " + i + " picture=" + loaded_json.hotspots[i].picture);
				let image_url = hotspots_pictures_dir + loaded_json.hotspots[i].picture + hotspots_image_format;
				mesh.scaling.x = mesh.scaling.y = picture_scale;
				apply_image_url_to_mesh(image_url, image_mesh_name, true, true, _hotspot_resize_cb);
			}
		}
	}
	xmlhttp.send();
}

function _hotspot_text_resize_cb(meshname) {
	let mesh = scene.getNodeByID(meshname);
	var textures = mesh.material.getActiveTextures();
	let w = textures[0].getSize().width;
	let h = textures[0].getSize().height;
	let aspect = w / h;
	mesh.scaling.x *= (hotspot_text_scale * aspect);
	mesh.scaling.y *= (hotspot_text_scale);
}

function _hotspot_resize_cb(meshname) {
	let mesh = scene.getNodeByID(meshname);
	var textures = mesh.material.getActiveTextures();
	let w = textures[0].getSize().width;
	let h = textures[0].getSize().height;
	let aspect = w / h;
	mesh.scaling.x *= (hotspots_scale * aspect);
	mesh.scaling.y *= (hotspots_scale);
}
