// DOM element for the canvas tag on the webpage
var canvas;
// main webgl interface object. all GL functions are variables are called from
// this e.g. gl.bindThingy() or gl.TRIANGLES
var gl;
// interface to Vertex Array Object extension
// simplifies rendering code in modern GL standard
var vao_ext;

var mouse_is_down = false;
var mouse_canvas_x;
var mouse_canvas_y;
var key_is_down = false;

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
	
	canvas.onmousedown = function (ev) {
		mouse_is_down = true;
		//console.log ("mouse down at " + mouse_canvas_x + ", " + mouse_canvas_y);
	}
	
	document.onmouseup = function (ev) {
		mouse_is_down = false;
	}
	
	canvas.onmousemove = function (ev) {
		// recursively get location within parent(s)
		var element = canvas;
		var top = 0;
		var left = 0;
		while (element && element.tagName != 'BODY') {
			top += element.offsetTop;
			left += element.offsetLeft;
			element = element.offsetParent;
		}
		// adjust for scrolling
		left += window.pageXOffset;
		top -= window.pageYOffset;
		var x = ev.clientX - left;
		var y = (ev.clientY - top);
		// sometimes range is a few pixels too big
		if (x < 0 || x >= canvas.clientWidth - 1) {
			return;
		}
		if (y < 0 || y >= canvas.clinetHeight - 1) {
			return;
		}
		mouse_canvas_x = x;
		mouse_canvas_y = y;
		//console.log (mouse_canvas_x + ", " + mouse_canvas_y);
	}
	
	gl = canvas.getContext ("webgl");
	vao_ext = check_ext ("OES_vertex_array_object");
	gl.clearColor (0.2, 0.2, 0.2, 1.0);
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	gl.enable (gl.DEPTH_TEST);
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

function create_texture_from_file (url, linear, mipmaps) {
	console.log ("loading image " + url + "...");
	var texture = gl.createTexture();
	var image = new Image();
	image.onload = function () {
		gl.bindTexture (gl.TEXTURE_2D, texture);
		gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
			image);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		// no anti-aliasing by default
		if (linear) {
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		} else {
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		}
		console.log ("texture loaded from " + url);
	}
	image.src = url;
	return texture;
}

function get_uniform_loc (sp, var_str) {
	var loc = gl.getUniformLocation (sp, var_str);
	if (loc < 0) {
		console.error ("uniform variable not active: " + var_str);
	}
	return loc;
}

document.onkeydown = function (event) {
	key_is_down = true;
}

