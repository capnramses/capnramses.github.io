// load a JSON format mesh. returns the populated object. easy. returns null on error.
function loadMeshFromJSON (url) {
	var json = null;
	// create Ajax object (Asynchronous JavaScript and XML)
	var xmlhttp = new XMLHttpRequest();
	// define function that executes when response is ready
	xmlhttp.onreadystatechange = function() {
		// if response code is correct
		if (xmlhttp.readyState == 4) {
			// read a JSON format file to auto-create the object. add opening and closing parantheses
			json = eval ("(" + xmlhttp.responseText + ")");
			return json;
		}
	}
	xmlhttp.open("GET", url, false); // false means not asynchronous i.e wait here
	xmlhttp.send(null);
	return json;
}