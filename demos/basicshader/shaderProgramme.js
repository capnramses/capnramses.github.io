
// constructor for a shader object
function ShaderProgramme (gl) {
	// handle of main shader programme
	this.mShaderProgrammeHandle = gl.createProgram();
	// handle of vertex shader
	this.mVSHandle;
	// handle of fragment shader
	this.mFSHandle;
	
	// fetch from url, load, compile, and attach a vertex shader
	this.loadVertexShaderFromURL = function (gl, url) {
		var sourceString = getURLAsString (url);
		alert("loading vertex shader from: " + url + "\n--source:--\n" + sourceString);
		this.loadVertexShader (gl, sourceString);
	}
	
	// fetch from url, load, compile, and attach a fragment shader
	this.loadFragmentShaderFromURL = function (gl, url) {
		var sourceString = getURLAsString (url);
		alert("loading fragment shader from: " + url + "\n--source:--\n" + sourceString);
		this.loadFragmentShader (gl, sourceString);
	}
	
	// load, compile, and attach a vertex shader
	this.loadVertexShader = function (gl, sourceString) {
		this.mVSHandle = gl.createShader (gl.VERTEX_SHADER);
		gl.shaderSource (this.mVSHandle, sourceString);
		gl.compileShader (this.mVSHandle);
		// print any compile errors in an alert
		if (!gl.getShaderParameter(this.mVSHandle, gl.COMPILE_STATUS)) {
			alert (gl.getShaderInfoLog (this.mVSHandle));
			return null;
		} 
		gl.attachShader (this.mShaderProgrammeHandle, this.mVSHandle);
	}
	
	// load,compile, and attach a fragment shader
	this.loadFragmentShader = function (gl, sourceString) {
		this.mFSHandle = gl.createShader (gl.FRAGMENT_SHADER);
		gl.shaderSource (this.mFSHandle, sourceString);
		gl.compileShader (this.mFSHandle);
		// print any compile errors in an alert
		if (!gl.getShaderParameter(this.mFSHandle, gl.COMPILE_STATUS)) {
			alert (gl.getShaderInfoLog (this.mFSHandle));
			return null;
		} 
		gl.attachShader (this.mShaderProgrammeHandle, this.mFSHandle);
	}
	
	// link shader programme
	this.link = function (gl) {
		gl.linkProgram (this.mShaderProgrammeHandle);
		// does this go here...I think so
		gl.validateProgram (this.mShaderProgrammeHandle);
	}
	
	// enable this as the shader programme to use for the next draw calls
	this.use = function (gl) {
		gl.useProgram(this.mShaderProgrammeHandle);
	}
	
	// get handle to per-vertex attribute
	this.getAttributeLocation = function (gl, attributeName) {
		return gl.getAttribLocation(this.mShaderProgrammeHandle, attributeName);
	}
	
	// get handle to a uniform variable
	this.getUniformLocation = function (gl, variableName) {
		return gl.getUniformLocation(this.mShaderProgrammeHandle, variableName);
	}
	
	// set a unform variable value based on its name
	this.setUniformMat4ByName = function (gl, variableName, matrix) {
		var location = getUniformLocation(gl, variableName);
		gl.uniformMatrix4fv (location, false, matrix);
	}
	// set a unform variable value based on its location (might be a bit faster than looking up the name each time)
	this.setUniformMat4ByLocation = function (gl, location, matrix) {
		gl.uniformMatrix4fv (location, false, matrix);
	}
}

// get a plain text string from a url
function getURLAsString (url) {
	// create Ajax object (Asynchronous JavaScript and XML)
	var xmlhttp = new XMLHttpRequest();
	// define function that executes when response is ready
	xmlhttp.onreadystatechange = function() {
		// if response code is correct
		if (xmlhttp.readyState == 4) {
			// get as string
		}
	}
	xmlhttp.open("GET", url, false); // false means not asynchronous i.e wait here
	xmlhttp.send(null);
	return xmlhttp.responseText;
}
