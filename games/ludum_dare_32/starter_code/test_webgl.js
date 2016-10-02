var canvas;
var gl;
var vao_ext;
var quad_vao;

//
// check if an extension exists in the browser
// if not, writes an error message to web element with id given
// return ext or false if ext is missing
//
function check_ext (name) {
	var ext = gl.getExtension (name);
	if (!ext) {
		pg_err ("ERROR: Your browser does not support WebGL extension: " + name);
		return false;
	}
	return ext;
}

function init_gl () {
	canvas = document.getElementById ("canvas");
	gl = canvas.getContext ("webgl");
	vao_ext = check_ext ("OES_vertex_array_object");
	gl.clearColor (0.2, 0.2, 0.2, 1.0);
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	
	//
	// geom
	var quad_pts = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
	quad_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (quad_vao);
	var quad_vp_vbo = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, quad_vp_vbo);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (quad_pts), gl.STATIC_DRAW);
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
}

/** FROM Google webgl-utils.js
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
		return window.setTimeout (callback, 1000 / 60);
	};
})();
