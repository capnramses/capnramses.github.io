/*
Functions for querying Woods' Guide and changing page textures to turn the page.
Copyright:   Beyond 2022
Licence:     TBD
Language:    JavaScript
History:
2020 Aug 24: First version. Anton Gerdelan
*/

var woods_guide_manifest_url = "manifest.json";
var woods_guide_left_page_id = "Book_Left_primitive1";
var woods_guide_right_page_id = "Book_right_primitive1"; // NOTE capitalisation difference
var woods_guide_first_page_number = 3;
var woods_guide_current_page_number = woods_guide_first_page_number;

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
		// ^!w,h	The extracted region is scaled so that the width and height of the returned image are not greater than w and h,
		// while maintaining the aspect ratio. The returned image must be as large as possible but not larger than w, h, or server-imposed limits.
		let width = 2048; // NOTE(Anton) Three.js will resize the image to max dims and square 2048x2048
		let height = 2048;
		url_left += "/full/!" + width + "," + height + "/0/default.jpg";
		url_right += "/full/!" + width + "," + height + "/0/default.jpg";
		console.log("url_left: " + url_left);
		console.log("url_right: " + url_right);

		apply_image_url_to_mesh(url_left, "Book_Left_primitive1");
		apply_image_url_to_mesh(url_right, "Book_right_primitive1");
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
