var gl = undefined;
var g_shader_prog_idx = undefined;
var g_speakers_prog_idx = undefined;
var g_vbos = undefined;
var g_x = undefined;
var g_z = undefined;
var g_y = undefined;
var g_second_x = undefined;
var g_second_z = undefined;
var g_second_y = undefined;
var okay = true;
var g_time_loc;
var old_time = 0.0;
var seconds = 0.0;
var fps = document.getElementById ("fps_id");
var step_element = document.getElementById ("step_id");
var g_step = 0;
var step_timer = 0.0;
var colour_loc;
var model_mat_loc;
var mantex;
var guidetex;
var g_dudevbo = undefined;

function main () {
	var vs_url = "vert_disp_vs.glsl";
	var fs_url = "vert_disp_fs.glsl";
	var svs_url = "speakers_vs.glsl";
	var sfs_url = "speakers_fs.glsl";
	var mesh_url = "flag.json";
	var texture_url = "drongo2.png";
	var guide_texture_url = "guide.png";
	var x_url = "x.json";
	var y_url = "y.json";
	var z_url = "z.json";
	var x_second_url = "x_second.json";
	var y_second_url = "y_second.json";
	var z_second_url = "z_second.json";
	
	var canvas = document.getElementById ("gl_canvas_id");
	gl = WebGLUtils.setupWebGL (canvas);
	if (!gl) {
		return;
	}
	gl = WebGLDebugUtils.makeDebugContext (gl);
	gl.clearColor (0.0, 0.0, 0.0, 1.0);
	
	g_shader_prog_idx = load_shaders (vs_url, fs_url);
	g_time_loc = gl.getUniformLocation (g_shader_prog_idx, "time");
	gl.uniform1f (g_time_loc, 0.0);
	var tl = gl.getUniformLocation (g_shader_prog_idx, "tex");
	gl.uniform1i (tl, 0);
	
	g_x = load_json (x_url);
	g_y = load_json (y_url);
	g_z = load_json (z_url);
	g_second_x = load_json (x_second_url);
	g_second_y = load_json (y_second_url);
	g_second_z = load_json (z_second_url);
	g_speakers_prog_idx = load_shaders (svs_url, sfs_url);
	colour_loc = gl.getUniformLocation (g_speakers_prog_idx, "colour");
	gl.uniform4fv (colour_loc, [1.0,1.0,0.5,1.0]);
	model_mat_loc = gl.getUniformLocation (g_speakers_prog_idx, "model_mat");
	
	g_vbos = load_geom (mesh_url);
	g_dudevbo = create_dude ();
	
	gl.enable (gl.DEPTH_TEST);
	gl.enable (gl.BLEND);
	gl.depthFunc (gl.LESS);
	gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // 1 minus alpha is what we want
	
	create_texture (texture_url, 0);
	create_texture (guide_texture_url, 1);
	if (okay) {
		old_time = (new Date ()).getTime ();
		render ();
	}
}

function load_shaders (vs_url, fs_url) {
	var vs = compile_shader (vs_url, gl.VERTEX_SHADER);
	var fs = compile_shader (fs_url, gl.FRAGMENT_SHADER);
	var p = gl.createProgram ();
	gl.attachShader (p, vs);
	gl.attachShader (p, fs);
	gl.linkProgram (p);
	if (!gl.getProgramParameter (p, gl.LINK_STATUS)) {
		console.error ("linking error");
		okay = false;
		return;
	}
	// set shader uniform
	gl.useProgram (p);
	// matrix
	var view = mat4.create ();
	mat4.identity (view);
	mat4.lookAt ([0.0, 0.5, 1.0], [0.0, 0.0, 0.0], [0.0, 0.0, -1.0], view);
	var vl = gl.getUniformLocation (p, "view_mat");
	gl.uniformMatrix4fv (vl, false, view);
	
	var persp = mat4.create ();
	mat4.identity (persp);
	mat4.perspective (90.0, 1.0, 0.1, 100.0, persp);
	var pl = gl.getUniformLocation (p, "proj_mat");
	gl.uniformMatrix4fv (pl, false, persp);
	
	gl.validateProgram (p);
	// this tells you if uniforms dont have default values set
	if (!gl.getProgramParameter (p, gl.VALIDATE_STATUS)) {
		console.error ("program not valid");
		okay = false;
		return;
	}
	console.log (gl.getProgramInfoLog (p));
	console.log ("ACTIVE_ATTRIBUTES: " + gl.getProgramParameter (p, gl.ACTIVE_ATTRIBUTES));
	console.log ("ACTIVE_UNIFORMS: " + gl.getProgramParameter (p, gl.ACTIVE_UNIFORMS));
	return p;
}

function compile_shader (url, type) {
	var c = get_string_from_URL (url);
	var s = gl.createShader (type);
	gl.shaderSource (s, c);
	gl.compileShader (s);
	if (!gl.getShaderParameter (s, gl.COMPILE_STATUS)) {
		console.error ("shader " + url + " not compiled");
		okay = false;
		console.log (gl.getShaderInfoLog (s));
		return;
	}
	console.log (gl.getShaderInfoLog (s));
	return s;
}

function get_string_from_URL (url) {
  var xmlhttp = new XMLHttpRequest ();
  xmlhttp.open ("GET", url, false);
  xmlhttp.send ();
  return xmlhttp.responseText;
}

function load_geom (url) {
	var xmlhttp = new XMLHttpRequest ();
	xmlhttp.open ("GET", url, false);
	xmlhttp.send ();
	var json = eval ("(" + xmlhttp.responseText + ")");
  var buffers = new BufferCluster ();
  buffers.count = json.vp.length / 3; // get from x,y,z to xyz count
  buffers.vp_vbo_idx = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, buffers.vp_vbo_idx);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (json.vp), gl.STATIC_DRAW);
  buffers.vt_vbo_idx = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, buffers.vt_vbo_idx);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (json.vt), gl.STATIC_DRAW);
	return buffers;
}

function create_dude () {
  var buffer_idx = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, buffer_idx);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array ([0,0,0]), gl.STATIC_DRAW);
	return buffer_idx;
}

function load_json (url) {
	var xmlhttp = new XMLHttpRequest ();
	xmlhttp.open ("GET", url, false);
	xmlhttp.send ();
	var json = eval ("(" + xmlhttp.responseText + ")");
	return json;
}

function BufferCluster () {
	this.vp_vbo_idx = undefined;
	this.vt_vbo_idx = undefined;
	this.vn_vbo_idx = undefined;
	this.count = 0;
}

function create_texture (url, n) {
	var ext = gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
	if (!ext) {
		ext = gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
	}

	var i = new Image();
	i.onload = function () {
		if (0 == n) {
			mantex = gl.createTexture ();
			gl.bindTexture (gl.TEXTURE_2D, mantex);
			gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap (gl.TEXTURE_2D);
		} else {
			guidetex = gl.createTexture ();
			gl.bindTexture (gl.TEXTURE_2D, guidetex);
			gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
			gl.generateMipmap (gl.TEXTURE_2D);
		}
		// write texture into slot 0
		//gl.activeTexture (gl.TEXTURE0);
		//gl.bindTexture (gl.TEXTURE_2D, t);
	}
	i.src = url;
}

var fcount = 0;

function render () {
	fcount++;
	var time = (new Date()).getTime();
	var elapsed = time - old_time;
	if (fcount > 9) {
		var paintCount = window.mozPaintCount;
		fps.innerHTML = (1000.0/elapsed).toFixed(2) + "fps<br />";
		fcount = 0;
	}
	old_time = time;
	seconds += elapsed;
	step_timer += elapsed / 100;
	while (step_timer > 1.0) {
		step_timer -= 1.0;
		g_step++;
		// loop
		if (g_step > g_x.x.length - 1) {
			g_step = 0;
		}
		step_element.innerHTML = "step " + g_step + "<br />";
	}
	
	gl.clear (gl.COLOR_BUFFER_BIT);
	gl.useProgram (g_shader_prog_idx);
	gl.uniform1f (g_time_loc, seconds);
	gl.enableVertexAttribArray (0);
	gl.enableVertexAttribArray (1);
	
	gl.bindBuffer (gl.ARRAY_BUFFER, g_vbos.vp_vbo_idx);
	gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer (gl.ARRAY_BUFFER, g_vbos.vt_vbo_idx);
	gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 0);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, guidetex);
	gl.drawArrays (gl.TRIANGLES, 0, g_vbos.count);
	gl.disableVertexAttribArray (0);
	gl.disableVertexAttribArray (1);
	
	gl.useProgram (g_speakers_prog_idx);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, mantex);
	
	gl.enableVertexAttribArray (0);
	gl.bindBuffer (gl.ARRAY_BUFFER, g_dudevbo);
	gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 0);
	
	
	var model_mat;
	gl.depthMask(false);
	if (g_step > 6) {
		model_mat = create_model_mat (g_step - 6);
		gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
		gl.uniform4fv (colour_loc, [1.0,1.0,0.5,0.05]);
		gl.drawArrays (gl.POINTS, 0, 1);
		model_mat = create_second_model_mat (g_step-6);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [0.4,0.7,1.0,0.05]);
	gl.drawArrays (gl.POINTS, 0, 1);
	}
	if (g_step > 5) {
		model_mat = create_model_mat (g_step - 5);
		gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
		gl.uniform4fv (colour_loc, [1.0,1.0,0.5,0.1]);
		gl.drawArrays (gl.POINTS, 0, 1);
		model_mat = create_second_model_mat (g_step-5);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [0.4,0.7,1.0,0.1]);
	gl.drawArrays (gl.POINTS, 0, 1);
	}
	if (g_step > 4) {
		model_mat = create_model_mat (g_step - 4);
		gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
		gl.uniform4fv (colour_loc, [1.0,1.0,0.5,0.15]);
		gl.drawArrays (gl.POINTS, 0, 1);
		model_mat = create_second_model_mat (g_step-4);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [0.4,0.7,1.0,0.15]);
	gl.drawArrays (gl.POINTS, 0, 1);
	}
	if (g_step > 3) {
		model_mat = create_model_mat (g_step - 3);
		gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
			gl.uniform4fv (colour_loc, [1.0,1.0,0.5,0.2]);
		gl.drawArrays (gl.POINTS, 0, 1);
	model_mat = create_second_model_mat (g_step-3);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [0.4,0.7,1.0,0.2]);
	gl.drawArrays (gl.POINTS, 0, 1);
	}
	if (g_step > 2) {
		model_mat = create_model_mat (g_step - 2);
		gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
			gl.uniform4fv (colour_loc, [1.0,1.0,0.5,0.25]);
		gl.drawArrays (gl.POINTS, 0, 1);
	model_mat = create_second_model_mat (g_step -2);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [0.4,0.7,1.0,0.25]);
	gl.drawArrays (gl.POINTS, 0, 1);
	}
	if (g_step > 1) {
		model_mat = create_model_mat (g_step - 1);
		gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
			gl.uniform4fv (colour_loc, [1.0,1.0,0.5,0.3]);
		gl.drawArrays (gl.POINTS, 0, 1);
	
		model_mat = create_second_model_mat (g_step -1);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [0.4,0.7,1.0,0.3]);
	gl.drawArrays (gl.POINTS, 0, 1);
	}
	model_mat = create_model_mat (g_step);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [1.0,1.0,0.5,1.0]);
	gl.drawArrays (gl.POINTS, 0, 1);
	
	model_mat = create_second_model_mat (g_step);
	gl.uniformMatrix4fv (model_mat_loc, false, model_mat);
	gl.uniform4fv (colour_loc, [0.4,0.7,1.0,1.0]);
	gl.drawArrays (gl.POINTS, 0, 1);
	
	gl.depthMask(true);
	gl.disableVertexAttribArray (0);
	gl.disableVertexAttribArray (1);
	//if time step then g_step++;
	window.requestAnimFrame (render, gl.canvas);
}

function create_model_mat (step_num) {
	var model_mat = mat4.create ();
	mat4.identity (model_mat);
	var x = g_x.x[step_num];
	var z = g_z.z[step_num];
	var y = g_y.y[step_num];
	model_mat = mat4.translate (model_mat, [x, y, z], model_mat);
	//!!!! COULD BASE SCALE ON AREA!!!!!!
	//!!! COULD USE X AND Y PIXELS FOR POSITION! THEN MAKE 3D BY ROTATING
	model_mat = mat4.scale (model_mat, [0.125, 0.125, 0.125], model_mat);
	return model_mat;
}

function create_second_model_mat (step_num) {
	var model_mat = mat4.create ();
	mat4.identity (model_mat);
	var x = g_second_x.x[step_num];
	var z = g_second_z.z[step_num];
	var y = g_second_y.y[step_num];
	model_mat = mat4.translate (model_mat, [x, y, z], model_mat);
	//!!!! COULD BASE SCALE ON AREA!!!!!!
	//!!! COULD USE X AND Y PIXELS FOR POSITION! THEN MAKE 3D BY ROTATING
	model_mat = mat4.scale (model_mat, [0.125, 0.125, 0.125], model_mat);
	return model_mat;
}

