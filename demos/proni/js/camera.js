/*
Functions for controlling the camera
Language:    JavaScript
History:
2020 Aug 31: First version. Anton Gerdelan
*/

var original_cam_pos;
var prev_cam_pos;

function camera_init() {
	original_cam_pos = new BABYLON.Vector3(59.84, 2.80, 3.75); // (39.6, 3.88, 3.33);
	prev_cam_pos = new BABYLON.Vector3(39.6, 3.88, 3.33);
	var camera = new BABYLON.UniversalCamera("camera0", original_cam_pos, scene);
	camera.rotation = new BABYLON.Vector3(0.0, -1.5, 0.0);
	camera.attachControl(canvas, true);

	// FPS style camera. example here: https://www.babylonjs-playground.com/#6PA720
	//camera.checkCollisions = true;
	scene.activeCamera.minZ = 0.01;
	scene.activeCamera.maxZ = 150.0;
}

/* Call every time the camera moves (or every frame). Makes sure camera only moves above the navigation mesh.
PARAMS
  ground_meshes_list - An array of meshes that the camera is allowed to walk on.
*/
function camera_follow_ground(ground_meshes_list) {
	// determine if a valid ground mesh is under the camera
	let ray_origin = scene.activeCamera.position;
	let ray_direction = new BABYLON.Vector3(0, -1, 0);
	let ray_length = 2.5;
	let ray = new BABYLON.Ray(ray_origin, ray_direction, ray_length);
	let picking_info = scene.pickWithRay(
		ray,
		function (mesh) {
			for (var i = 0; i < ground_meshes_list.length; i++) {
				if (ground_meshes_list[i].id == mesh.id) { return true; }
			}
			return false;
		}
	);
	// follow the ground
	if (picking_info.hit) {
		var diffY = scene.activeCamera.position.y - (picking_info.pickedPoint.y + 1.75);
		//console.log("camera is " + diffY + " over mesh " + picking_info.pickedMesh.id);
		//	if (Math.abs(diffY < 1.0)) {
		if (diffY < 0.0 || diffY > 0.0) {
			scene.activeCamera.position.y = picking_info.pickedPoint.y + 1.75;
		}
		//	}
		// NB(Anton) if i just say cam_pos = position then it does a silly reference instead of a copy
		prev_cam_pos.x = scene.activeCamera.position.x;
		prev_cam_pos.y = scene.activeCamera.position.y;
		prev_cam_pos.z = scene.activeCamera.position.z;
		return;
	}

	// TODO(Anton) if fallen below world for some reason pop back up
	ray_direction = new BABYLON.Vector3(0, 1, 0);
	ray_length = 4.0; // 4m above camera + amount camera would be offset above that
	ray = new BABYLON.Ray(ray_origin, ray_direction, ray_length);
	picking_info = scene.pickWithRay(
		ray,
		function (mesh) {
			for (var i = 0; i < ground_meshes_list.length; i++) {
				if (ground_meshes_list[i].id == mesh.id) { return true; }
			}
			return false;
		}
	);
	if (picking_info.hit) {
		var diffY = scene.activeCamera.position.y - (picking_info.pickedPoint.y + 1.75);
		if (Math.abs(diffY) < 3.0) {
			console.log("camera was " + diffY + " under the nav mesh, so popping back up");
			scene.activeCamera.position.y = picking_info.pickedPoint.y + 1.75;
			prev_cam_pos.x = scene.activeCamera.position.x;
			prev_cam_pos.y = scene.activeCamera.position.y;
			prev_cam_pos.z = scene.activeCamera.position.z;
			return;
		}
	}

	// if there was no nav mesh below / or / above
	//	console.log(" out of bounds! moving camera from " + scene.activeCamera.position + " back to " + prev_cam_pos);
	scene.activeCamera.position.x = prev_cam_pos.x;
	scene.activeCamera.position.y = prev_cam_pos.y;
	scene.activeCamera.position.z = prev_cam_pos.z;

	// TODO(Anton) check if we're /really/ out of xz or y bounds and reset back to original position
}
