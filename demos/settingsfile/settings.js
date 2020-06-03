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
			// parse the file. I gave the stand-alone function name because this. doesn't apply here
			GLSettings_parseFile(xmlhttp.responseText); 
		}
 }
 xmlhttp.open("GET", url, false);
 xmlhttp.send(null);
}

// parse a settings file - should use JSON for this
function GLSettings_parseFile(fileText) {
	// break whole text string into an array of lines based on endline character
	var lines = fileText.split("\n");
	// count number of indices in array
	var numLines = lines.length;
	// parse file
	for (var i = 0; i < numLines; i++) {
		// get the current line
		var line = lines[i];
		// skip empty lines early
		if (lines[i].length < 2) {
			continue;
		}
		// skip comment lines early
		if (lines[i][0] == '#') {
			continue;
		}
		// tokenise		
		var tokens = lines[i].split(" ");
		var numTokens = tokens.length;
		// set background colour
		if (tokens[0] == "setBackgroundColour") {
			// cut out everything that isn't numbers, dots, or commas
			// should use a better regular expression to allow comments at the end
			var subStr = lines[i].replace(/[^0-9.,]+/g, '');
			// split tokens based on commas and store in an array of strings
			var rgb = subStr.split(',');
			// convert string array into floats
			// these are stored in a global instance - in a better class we might pass instance as a param
			// to this function instead.
			gGLSettings.mBackgroundColour.r = parseFloat(rgb[0]);
			gGLSettings.mBackgroundColour.g = parseFloat(rgb[1]);
			gGLSettings.mBackgroundColour.b = parseFloat(rgb[2]);
			continue;
		}	
		// unknown line warning so that user can double-check i.e. typos or change of spec
		alert("WARNING unknown setting: " + line);
	}
}

