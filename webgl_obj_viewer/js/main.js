//
// Wavefront .obj viewer for WebGL
// Anton Gerdelan 23 Dec 2014
// antongerdelan.net
//

var canvas;
var obj_fn = "webgl_obj_viewer/meshes/cube.obj"
var img = "images/antonmoherbig.png";//"webgl_obj_viewer/textures/checkerboard.png"
var vs_url = "webgl_obj_viewer/shaders/basic.vert";
var fs_url = "webgl_obj_viewer/shaders/basic.frag";
var tex;
var sp;
var M_loc, V_loc, P_loc;
var M;
var deg = 0.0;
var previous_millis;

var g_time_step_size_s = 1.0 / 50.0; // smallest fixed-step update in seconds

function main () {
	canvas = document.getElementById ("canvas");
	gl = WebGLUtils.setupWebGL (canvas, {alpha:true, antialias:true});
	tex = create_texture_from_file (img);
	parse_obj_into_vbos (obj_fn);
	sp = load_shaders_from_files (vs_url, fs_url);
	gl.bindAttribLocation (sp, 0, "vp");
	gl.bindAttribLocation (sp, 1, "vt");
	gl.bindAttribLocation (sp, 2, "vn");
	gl.linkProgram (sp);
	M_loc = get_uniform_loc (sp, "M");
	P_loc = get_uniform_loc (sp, "P");
	V_loc = get_uniform_loc (sp, "V");
	
	M = identity_mat4 ();
	var V = translate_mat4 (identity_mat4 (), [0.0, 0.0, -3.0]);
	var P = perspective (67.0, 1.0, 0.1, 100.0);
	gl.useProgram (sp);
	gl.uniformMatrix4fv (M_loc, gl.FALSE, new Float32Array (M));
	gl.uniformMatrix4fv (V_loc, gl.FALSE, new Float32Array (V));
	gl.uniformMatrix4fv (P_loc, gl.FALSE, new Float32Array (P));
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	gl.enable (gl.DEPTH_TEST);
	//gl.enable (gl.BLEND);
	
	//F2F1E6
	
	gl.clearColor (255 / 255, 255 / 255, 255 / 255, 1.0);
	gl.viewport (0, 0, canvas.clientWidth, canvas.clientHeight);
	previous_millis = (new Date).getTime ();
	main_loop ();
}

function main_loop () {
	// timer
	var current_millis = (new Date).getTime ();
	var elapsed_millis = current_millis - previous_millis;
	previous_millis = current_millis;
	var elapsed_s = elapsed_millis / 1000.0;

	draw ();
	
	deg = 6.0 * elapsed_s;
	M = rotate_y_deg (M, deg);
	gl.uniformMatrix4fv (M_loc, gl.FALSE, new Float32Array (M));
	// this function is from webgl-utils
	window.requestAnimFrame (main_loop, canvas);
}

function draw () {
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram (sp);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, tex);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vp);
	gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vt);
	gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vn);
	gl.vertexAttribPointer (2, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
	gl.enableVertexAttribArray (1);
	gl.enableVertexAttribArray (2);
	gl.drawArrays (gl.TRIANGLES, 0, pc);
	gl.disableVertexAttribArray (0);
	gl.disableVertexAttribArray (1);
	gl.disableVertexAttribArray (2);
}
