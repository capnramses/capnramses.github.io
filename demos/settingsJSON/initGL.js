// start WebGL
function initGL (canvas) {
	var gl;
	try {
		gl = canvas.getContext ("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
			alert("Could not initialise WebGL, sorry :-(");
	}
	return gl;
}

function drawScene (gl) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}