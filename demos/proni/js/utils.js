/*
Functions for generic tasks
Language:    JavaScript
History:
2020 Sep 2: First version. Anton Gerdelan
*/

// multiply a value in degrees by this number to turn it into radians
var one_deg_in_rad = 0.01745329;

// helper function to change the texture on an existing mesh. e.g to turn book pages.
function apply_image_url_to_mesh(query_str, meshname, invert_y, backface_culling, on_load_cb) {
	let material = new BABYLON.StandardMaterial(meshname + "_material", scene);
	function _on_load() {
		let mesh = scene.getNodeByID(meshname);
		if (!mesh) {
			console.error("can't find mesh called " + meshname);
			return;
		}
		if (mesh.material) {
			if (mesh.material.diffuseTexture) {
				mesh.material.diffuseTexture.dispose();
			}
			mesh.material.dispose(true, true, true);
		}
		mesh.material = material;
		if (on_load_cb) { on_load_cb(meshname); }
		console.log("texture loaded!");
	}
	var no_mipmap = false;
	material.diffuseTexture = new BABYLON.Texture(query_str, scene, no_mipmap, invert_y, BABYLON.Texture.LINEAR_LINEAR_MIPLINEAR, _on_load, null, null, true);
	material.emissiveColor = material.specularColor = material.ambientColor = new BABYLON.Color3(1, 1, 1);
	material.backFaceCulling = backface_culling;
}
