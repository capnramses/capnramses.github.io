/*
Functions for querying Wood's Guide and changing page textures to turn the page.
Language:    JavaScript
History:
2020 Aug 24: First version. Anton Gerdelan
*/

var woods_guide_manifest_url = "manifest.json";
var woods_guide_left_page_id = "Book_Left_primitive1";
var woods_guide_right_page_id = "Book_right_primitive1"; // NOTE capitalisation difference
var woods_guide_first_page_number = 3;
var woods_guide_current_page_number = woods_guide_first_page_number;

// set up interactive Woods' Guide model in Babylon to sit on the appropriate plinth in the model. call after main Treasury mesh has finished loading.
function woods_guide_init() {
	var bookStand002Node = scene.getNodeByID("Reading Stand 01");//"Book Stand002");
	if (bookStand002Node) {
		//console.log("Reading Stand 01 (plinth for Woods' Guide) found");
		// put the book so it sits on the plinth's position with an offset rotation and position to centre it on the top of the plinth
		// NB: the book is ~360kb and this is 95% from detailed images at 512x512 res.
		let book_mesh = BABYLON.SceneLoader.Append("./mesh/", "book_reexport.glb", scene, function (scene) {
			let node = scene.getNodeByID("Book");//"Book Stand002");
			node.position = new BABYLON.Vector3(-38.2, 3.48, 3.19);
			node.scaling = new BABYLON.Vector3(2.0, 2.0, 2.0);
			node.rotation = new BABYLON.Vector3(-1.382999 + 3.141593, -1.57, 0.0); // radians (27.7 degrees)
			console.log("querying manifest for book...");
			woods_guide_query_manifest(woods_guide_first_page_number);
		}); // endfunc Append() woods' guide book
	} else {
		console.error("Couldn't find plinth for Wood's Guide - `Reading Stand 01`");
	}
}

// set the page in the Woods' Guide book
function woods_guide_query_manifest(manifest_page_index) {
	woods_guide_current_page_number = manifest_page_index;
	if (woods_guide_current_page_number < woods_guide_first_page_number) { woods_guide_current_page_number = woods_guide_first_page_number; }

	// REST API query
	var xmlhttp = new XMLHttpRequest();
	console.log(" querying " + woods_guide_manifest_url);
	xmlhttp.open("GET", woods_guide_manifest_url, true);
	// or onreadystatechange?
	xmlhttp.onload = function (e) {
		let str = xmlhttp.responseText;
		let manifest = JSON.parse(str);
		//	console.log(manifest);
		let page_count = manifest.sequences[0].canvases.length;
		console.log("page_count =" + page_count);
		woods_guide_current_page_number = woods_guide_current_page_number < (page_count - 2) ? woods_guide_current_page_number : (page_count - 2);
		console.log("left page index=" + woods_guide_current_page_number);
		let url = "https://beyond2022.ie/loris/";
		let url_left = url + manifest.sequences[0].canvases[woods_guide_current_page_number].label;
		let url_right = url + manifest.sequences[0].canvases[woods_guide_current_page_number + 1].label;

		// NB(Anton) reduce the resolution from crisp 2048 to 1024 because memory usage was shooting up many MB per click.

		// ^!w,h	The extracted region is scaled so that the width and height of the returned image are not greater than w and h,
		// while maintaining the aspect ratio. The returned image must be as large as possible but not larger than w, h, or server-imposed limits.
		let width = 1024;  // note 2048 is crisp but is like 10MB per image that isnt cleaned up well by browser
		let height = 1024;
		url_left += "/full/!" + width + "," + height + "/0/default.jpg";
		url_right += "/full/!" + width + "," + height + "/0/default.jpg";
		console.log("url_left: " + url_left);
		console.log("url_right: " + url_right);

		// use a helper function to switch texture to one from a url. if not using Babylon then just create the equivalent helper function with the same name!
		var y_invert = false;
		apply_image_url_to_mesh(url_left, "Book_Left_primitive1", y_invert, true);
		apply_image_url_to_mesh(url_right, "Book_right_primitive1", y_invert, true);
	}
	xmlhttp.send();
	//var entity = document.querySelector('[sound]');
	//	entity.components.sound.playSound();
}

function woods_guide_turn_page_back() {
	woods_guide_query_manifest(woods_guide_current_page_number - 2);
}

function woods_guide_turn_page_ahead() {
	woods_guide_query_manifest(woods_guide_current_page_number + 2);
}

function woods_guide_handle_clicks(clicked_mesh_id) {
	if (clicked_mesh_id == woods_guide_left_page_id) {
		woods_guide_turn_page_back();
	} else if (clicked_mesh_id == woods_guide_right_page_id) {
		woods_guide_turn_page_ahead();
	}
}
