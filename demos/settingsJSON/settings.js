// object containing various settings used by GL. Can also parse these from a file
var gGLSettings = new GLSettings();

// default constructor for GLSettings objects
function GLSettings () {
	// assign public methods to object (private methods don't seem to work)
	this.printAll = GLSettings_printAll;
	this.loadFromFile = GLSettings_loadFromFile;
	
	// attributes
	this.mBackgroundColour = { r: 1.0, g: 0.0, b: 1.0 };
}

// a function that will become a method. I named it similarly to C++ style
function GLSettings_printAll () {
	document.getElementById('summaryP').innerHTML="mBackgroundColour (" + this.mBackgroundColour.r + ", " + this.mBackgroundColour.g + ", " + this.mBackgroundColour.b + ")";
}

// load settings from a file on a server
function GLSettings_loadFromFile (url) {
	// create Ajax object (Asynchronous JavaScript and XML)
	var xmlhttp = new XMLHttpRequest();
	// define function that executes when response is ready
	xmlhttp.onreadystatechange = function() {
		// if response code is correct
		if (xmlhttp.readyState == 4) {
			// read a JSON format file to auto-create the object. add opening and closing parantheses
			gGLSettings = eval ("(" + xmlhttp.responseText + ")");
			// this completely rebuilds the object, so we can do constructor stuff here:
			gGLSettings .printAll = GLSettings_printAll;
		}
 }
 xmlhttp.open("GET", url, false);
 xmlhttp.send(null);
}
