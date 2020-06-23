
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
	//alert("ds " + myMesh.mVertexPoints.length);
	// draw test VBO ( no VAOs oddly )
	gl.bindTexture(glContext.TEXTURE_2D, texture);
  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, myMesh.mVertexPoints.length / 3);
	gl.drawArrays(gl.TRIANGLES, 0, myMesh.mVertexPoints.length / 3);	
}
