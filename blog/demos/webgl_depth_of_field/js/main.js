//
// Depth of Field Prototype
// Anton Gerdelan 10 Mar 2015
// antongerdelan.net
//

var canvas;
var gl;
var gl_width;
var gl_height;
// super-sampling factor
var g_ssf = 2.0;
// interfaces for useful extensions
var g_vao_ext;
var g_aniso_ext;
var g_srgb_ext;
var obj_fn = "meshes/cube.obj"
var img = "textures/checkerboard.png"
var vs_url = "shaders/basic.vert";
var fs_url = "shaders/basic.frag";
var tex;
var sp;
var M_loc, V_loc, P_loc;
var M;
var g_prev_s;
var g_curr_s;
// smallest fixed-step update in seconds
var g_time_step_size_s = 1.0 / 50.0;

// cube rotation
var g_cube_vao;
var deg = 0.0;
var g_cube_count = 32;

// aux framebuffer variables
var g_fb_vs_url = "shaders/fb.vert";
var g_fb_fs_url = "shaders/fb.frag";
var g_fb_sp;
var g_fb_sp_rgba_tex_loc;
var g_fb_sp_d_tex_loc;
var g_fb_focus_dist_loc;
var g_fb;
var g_fb_rgba_tex;
var g_fb_d_tex;
var g_fb_vao;
var g_fb_vbo_vp;

var g_fps;
var g_frame_s = 0.0;
var g_frame_count = 0;

var g_focus_dist = 100.0;

function main () {
	//
	// basic setup
	canvas = document.getElementById ("canvas");
	gl_width = canvas.clientWidth;
	gl_height = canvas.clientHeight;
	gl = WebGLUtils.setupWebGL (canvas);
	//
	// khronos ratified
	//check_ext ("OES_texture_float", "errors_id");
	//check_ext ("OES_texture_half_float", "errors_id");
	//check_ext ("WEBGL_lose_context", "errors_id");
	//check_ext ("OES_standard_derivatives", "errors_id"); // enable ext in FS
	g_vao_ext = check_ext ("OES_vertex_array_object", "errors_id");
	//check_ext ("WEBGL_debug_renderer_info", "errors_id"); // not in FF
	//check_ext ("WEBGL_debug_shaders", "errors_id"); // not in FF
	//check_ext ("WEBGL_compressed_texture_s3tc", "errors_id");
	check_ext ("WEBGL_depth_texture", "errors_id");
	//check_ext ("OES_element_index_uint", "errors_id");
	g_aniso_ext = check_ext ("EXT_texture_filter_anisotropic", "errors_id");
	//check_ext ("WEBGL_draw_buffers", "errors_id");
	//check_ext ("ANGLE_instanced_arrays", "errors_id");
	//check_ext ("OES_texture_float_linear", "errors_id"); // texture filters MMaps
	//check_ext ("OES_texture_half_float_linear", "errors_id");
	//
	// community approved
	//check_ext ("WEBGL_compressed_texture_atc", "errors_id"); // not in FF
	//check_ext ("WEBGL_compressed_texture_pvrtc", "errors_id"); // not in FF
	//check_ext ("EXT_color_buffer_half_float", "errors_id");
	//check_ext ("WEBGL_color_buffer_float", "errors_id");
	//check_ext ("EXT_frag_depth", "errors_id"); // in FS set frag depth built-in
	//g_srgb_ext = check_ext ("EXT_sRGB", "errors_id"); // craps out on chrome
	//check_ext ("WEBGL_compressed_texture_etc1", "errors_id"); // not in FF
	//check_ext ("EXT_blend_minmax", "errors_id"); // more alpha-blend params
	//check_ext ("EXT_shader_texture_lod", "errors_id"); // not in FF
	//
	// draft
	//check_ext ("EXT_color_buffer_float", "errors_id"); // not in FF
	//check_ext ("WEBGL_shared_resources", "errors_id"); // not in FF
	//check_ext ("WEBGL_security_sensitive_resources", "errors_id"); // not in FF
	//check_ext ("EXT_disjoint_timer_query", "errors_id"); // not in FF
	//check_ext ("OES_fbo_render_mipmap", "errors_id"); // not in FF
	//check_ext ("WEBGL_compressed_texture_es3", "errors_id"); // not in FF
	
	g_fps = document.getElementById ("fps");
	g_distbox = document.getElementById ("distbox");
	// make sure on refresh correct value is here
	g_distbox.value = g_focus_dist.toString ();
	g_distbox.oninput = function () {
		g_focus_dist = parseFloat (g_distbox.value);
		//console.log (g_distbox.value);
	}
	
	//
	// load stuff
	// cube texture and mesh
	tex = create_texture_from_file (img);
	parse_obj_into_vbos (obj_fn);
	
	// cube shader
	sp = load_shaders_from_files (vs_url, fs_url);
	gl.bindAttribLocation (sp, 0, "vp");
	gl.bindAttribLocation (sp, 1, "vt");
	gl.bindAttribLocation (sp, 2, "vn");
	gl.linkProgram (sp);
	M_loc = get_uniform_loc (sp, "M");
	P_loc = get_uniform_loc (sp, "P");
	V_loc = get_uniform_loc (sp, "V");
	
	M = identity_mat4 ();
	var V = translate_mat4 (identity_mat4 (), [0.0, 0.0, -5.0]);
	var aspect = gl_width / gl_height;
	var P = perspective (67.0, aspect, 0.1, 300.0);
	gl.useProgram (sp);
	gl.uniformMatrix4fv (M_loc, gl.FALSE, new Float32Array (M));
	gl.uniformMatrix4fv (V_loc, gl.FALSE, new Float32Array (V));
	gl.uniformMatrix4fv (P_loc, gl.FALSE, new Float32Array (P));
	
	//
	// set up additional FB
	// aux fb shader
	g_fb_sp = load_shaders_from_files (g_fb_vs_url, g_fb_fs_url);
	gl.linkProgram (g_fb_sp);
	g_fb_sp_rgba_tex_loc = get_uniform_loc (g_fb_sp, "fb_rgba_tex");
	g_fb_sp_d_tex_loc = get_uniform_loc (g_fb_sp, "fb_d_tex");
	g_fb_focus_dist_loc = get_uniform_loc (g_fb_sp, "fb_focus_dist");
	gl.useProgram (g_fb_sp);
	gl.uniform1i (g_fb_sp_rgba_tex_loc, 0);
	gl.uniform1i (g_fb_sp_d_tex_loc, 1);
	// aux fb vbo
	var fb_vp = [
		-1.0, 1.0,
		-1.0, -1.0,
		1.0, 1.0,
		1.0, -1.0
	];
	g_fb_vao = g_vao_ext.createVertexArrayOES ();
	g_vao_ext.bindVertexArrayOES (g_fb_vao);
	g_fb_vbo_vp = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, g_fb_vbo_vp);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (fb_vp), gl.STATIC_DRAW);
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
	// aux fb textures
	g_fb_rgba_tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, g_fb_rgba_tex);
	// linear filter to support SSAA
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	//
	// sRGBA format using extension
	//gl.texImage2D (gl.TEXTURE_2D, 0, g_srgb_ext.SRGB_ALPHA_EXT, gl_width * g_ssf,
	//	gl_height * g_ssf, 0, g_srgb_ext.SRGB_ALPHA_EXT, gl.UNSIGNED_BYTE, null);
	gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl_width * g_ssf,
		gl_height * g_ssf, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	// using depth texture extension
	g_fb_d_tex = gl.createTexture();
	gl.bindTexture (gl.TEXTURE_2D, g_fb_d_tex);
	// linear filter to support SSAA
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D (gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, gl_width * g_ssf,
		gl_height * g_ssf, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
	g_fb = gl.createFramebuffer ();
	gl.bindFramebuffer (gl.FRAMEBUFFER, g_fb);
	gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
		g_fb_rgba_tex, 0);
	gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D,
		g_fb_d_tex, 0);
	gl.bindFramebuffer (gl.FRAMEBUFFER, gl.DEFAULT_FRAMEBUFFER);
	//
	// default rendering modes
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	gl.enable (gl.DEPTH_TEST);
	gl.clearColor (0.2, 0.2, 0.2, 1.0);
	
	//
	// go!
	g_prev_s = (new Date).getTime ();
	main_loop ();
}

function main_loop () {
	var curr_ms = (new Date).getTime ();
	g_curr_s = curr_ms * 0.001;
	var delta_s = g_curr_s - g_prev_s;
	g_prev_s = g_curr_s;

	//
	// bind additional framebuffer
	// set up with colour and depth textures
	gl.bindFramebuffer (gl.FRAMEBUFFER, g_fb);

	//
	// draw normal scene to FB
	gl.viewport (0, 0, gl_width * g_ssf, gl_height * g_ssf);
	draw (delta_s);
	
	//
	// maybe show FB textures somewhere
	
	//
	// do check-and-blur passes to default FB
	gl.flush ();
	gl.finish ();
	gl.viewport (0, 0, gl_width, gl_height);
	gl.bindFramebuffer (gl.FRAMEBUFFER, gl.DEFAULT_FRAMEBUFFER);
	gl.useProgram (g_fb_sp);
	gl.uniform1f (g_fb_focus_dist_loc, g_focus_dist);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, g_fb_rgba_tex);
	gl.activeTexture (gl.TEXTURE1);
	gl.bindTexture (gl.TEXTURE_2D, g_fb_d_tex);
	g_vao_ext.bindVertexArrayOES (g_fb_vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
	
	deg += delta_s * 50.0
	
	// this function is from webgl-utils
	window.requestAnimFrame (main_loop, canvas);
	
	//gl.flush ();
	//gl.finish ();
	g_frame_s += delta_s;
	g_frame_count++;
	if (g_frame_count == 10) {
		g_frame_count = 0;
		var v = 10.0 / g_frame_s;
		g_frame_s = 0.0;
		g_fps.innerHTML = v.toFixed (0) + " fps";
	}
}

function draw (delta_s) {
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram (sp);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, tex);
	g_vao_ext.bindVertexArrayOES (g_cube_vao);
	
	for (var i = 0; i < g_cube_count; i++) {
		M = rotate_y_deg (identity_mat4 (), deg);
		M = translate_mat4 (M, [5.0 - Math.cos (i - 1) * 5.0,
			Math.sin (i + 0.25 * g_curr_s) * 7.0, -i * 5.0]);
		gl.uniformMatrix4fv (M_loc, gl.FALSE, new Float32Array (M));
		gl.drawArrays (gl.TRIANGLES, 0, pc);
		M = rotate_y_deg (identity_mat4 (), -deg);
		M = translate_mat4 (M, [-5.0 - Math.cos (i + 2) * 5.0,
			-Math.sin (i + 0.25 * g_curr_s) * 7.0, -i * 5.0]);
		gl.uniformMatrix4fv (M_loc, gl.FALSE, new Float32Array (M));
		gl.drawArrays (gl.TRIANGLES, 0, pc);
	} // endfor cubes
}
