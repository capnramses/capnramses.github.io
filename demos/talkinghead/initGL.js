
// start WebGL
function initGL (canvas, debugging, withLogging) {
	// use wrapper to add some cross-browser support to initialisation of webgl
	// this also validates the context gracefully
	var context = WebGLUtils.setupWebGL (canvas);
	// add debugging support
	if (debugging) {
		if (withLogging) {
			context = WebGLDebugUtils.makeDebugContext(context, throwOnGLError, logAndValidate); // debug version
		} else {
			context = WebGLDebugUtils.makeDebugContext(context, throwOnGLError); // debug version
		}
	}
	// set up viewport
	context.viewportWidth = canvas.width;
	context.viewportHeight = canvas.height;
	return context;
}

// verbose glError output
function throwOnGLError(err, funcName, args) {
	throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
}

// verbose glError output
function logAndValidate(functionName, args) {
	logGLCall(functionName, args);
	validateNoneOfTheArgsAreUndefined (functionName, args);
}

// verbose glError output
function logGLCall(functionName, args) {   
	console.log("gl." + functionName + "(" + WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
} 

// safety check for variable name typos that javascript creates a sometimes valid NULL variable for
function validateNoneOfTheArgsAreUndefined(functionName, args) {
	for (var ii = 0; ii < args.length; ++ii) {
		if (args[ii] == undefined) {
			console.error("undefined passed to gl." + functionName + "(" +
			WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
		}
	}
} 

function drawScene (gl) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// draw back-drop
  planeShaderProg.use (gl); // enable shader
	// enable all attributes used (AND NO OTHER ONES!!!!)
	gl.enableVertexAttribArray (basicShaderVPAttribLoc);
	gl.enableVertexAttribArray (basicShaderVTAttribLoc);
  // bind texture
	gl.activeTexture (gl.TEXTURE0); // open texture slot 0 (same for all shaders)
  gl.bindTexture(gl.TEXTURE_2D, backdropTexture); // put our texture into slot 0. remember we already bound our 'tex' name to location 0, which will point at slot 0
  // associate attributes with data
  gl.bindBuffer (gl.ARRAY_BUFFER, backdropVPVBO); // bind buffer so we can point to it
  gl.vertexAttribPointer (basicShaderVPAttribLoc, 3, gl.FLOAT, false, 0, 0);  // tell shader attrib where to find data
	gl.bindBuffer (gl.ARRAY_BUFFER, backdropVTVBO); // bind buffer so we can point to it
  gl.vertexAttribPointer (basicShaderVTAttribLoc, 2, gl.FLOAT, false, 0, 0);  // tell shader attrib where to find data
  // draw call
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  //alert ("drew plane");
	// disable attributes not used by next shader
	gl.disableVertexAttribArray (basicShaderVPAttribLoc);
	gl.disableVertexAttribArray (basicShaderVTAttribLoc);
  
	if (!pauseRendering) {
		// draw talking head
		myShaderProg.use (gl); // enable shader
		// enable all attributes used (AND NO OTHER ONES!!!!)
		// enable attributes in shader (disabled by default)
		gl.enableVertexAttribArray (neutral_vp_loc); 
		gl.enableVertexAttribArray (vn_loc);
		gl.enableVertexAttribArray (happy_vp_loc);
		gl.enableVertexAttribArray (angry_vp_loc);
		// assciate attributes with data in separate buffers
		gl.bindBuffer (gl.ARRAY_BUFFER, vboHandle); // bind buffer so we can point to it
		gl.vertexAttribPointer (neutral_vp_loc, 3, gl.FLOAT, false, 0, 0);  // tell shader attrib where to find data
		gl.bindBuffer (gl.ARRAY_BUFFER, vboVNHandle);
		gl.vertexAttribPointer (vn_loc, 3, gl.FLOAT, false, 0, 0); // link shader attribute to VBO
		gl.bindBuffer (gl.ARRAY_BUFFER, madVBO);
		gl.vertexAttribPointer (happy_vp_loc, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer (gl.ARRAY_BUFFER, happyVBO);
		gl.vertexAttribPointer (angry_vp_loc, 3, gl.FLOAT, false, 0, 0);
		// draw call
		gl.drawArrays(gl.TRIANGLES, 0, myMesh.mVertexPoints.length / 3);
		// disable attributes not used by next shader
		gl.disableVertexAttribArray (neutral_vp_loc);
		gl.disableVertexAttribArray (vn_loc);
		gl.disableVertexAttribArray (happy_vp_loc);
		gl.disableVertexAttribArray (angry_vp_loc);
	}
}
