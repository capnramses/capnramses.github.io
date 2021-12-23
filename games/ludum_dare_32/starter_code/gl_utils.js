// DOM element for the canvas tag on the webpage
var canvas;
// main webgl interface object. all GL functions are variables are called from
// this e.g. gl.bindThingy() or gl.TRIANGLES
var gl;
// interface to Vertex Array Object extension
// simplifies rendering code in modern GL standard
var vao_ext;

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

//
// start graphics context and some useful GL extensions
//
function init_gl () {
	canvas = document.getElementById ("canvas");
	gl = canvas.getContext ("webgl");
	vao_ext = check_ext ("OES_vertex_array_object");
	gl.clearColor (0.2, 0.2, 0.2, 1.0);
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
}

/** FROM Google webgl-utils.js
 * Provides requestAnimationFrame in a cross browser way.
 * which is a reliable way to do a rendering loop via callback in javascript
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
