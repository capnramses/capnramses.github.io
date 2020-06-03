var gl = undefined;
var g_shader_prog_idx = undefined;
var g_vbos = undefined;
var okay = true;
var g_time_loc;
var old_time = 0.0;
var seconds = 0.0;

function main () {
	var canvas = document.getElementById ("gl_canvas_id");
	gl = WebGLUtils.setupWebGL (canvas);
	if (!gl) {
		return;
	}
	gl = WebGLDebugUtils.makeDebugContext (gl);
	gl.clearColor (0.0, 0.0, 0.0, 1.0);
	var vs_url = "vert_disp_vs.glsl";
	var fs_url = "vert_disp_fs.glsl";
	g_shader_prog_idx = load_shaders (vs_url, fs_url);
	var mesh_url = "flag.json";
	g_vbos = load_geom (mesh_url);
	var texture_url = "flag2.png";
	create_texture (texture_url);
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
	var tl = gl.getUniformLocation (p, "tex");
	gl.uniform1i (tl, 0);
	// matrix
	var view = mat4.create ();
	mat4.identity (view);
	mat4.lookAt ([0.0, 1.5, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, -1.0], view);
	var vl = gl.getUniformLocation (p, "view_mat");
	gl.uniformMatrix4fv (vl, false, view);
	
	var persp = mat4.create ();
	mat4.identity (persp);
	mat4.perspective (90.0, 1.0, 0.1, 100.0, persp);
	var pl = gl.getUniformLocation (p, "proj_mat");
	gl.uniformMatrix4fv (pl, false, persp);
	
	g_time_loc = gl.getUniformLocation (p, "time");
	gl.uniform1f (g_time_loc, 0.0);
	
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

function BufferCluster () {
	this.vp_vbo_idx = undefined;
	this.vt_vbo_idx = undefined;
	this.vn_vbo_idx = undefined;
	this.count = 0;
}

function create_texture (url) {
	var i = new Image();
	i.onload = function () {
		var t = gl.createTexture ();
		gl.bindTexture (gl.TEXTURE_2D, t);
		gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		// write texture into slot 0
		gl.activeTexture (gl.TEXTURE0);
		gl.bindTexture (gl.TEXTURE_2D, t);
	}
	i.src = url;
}

function render () {
	var time = (new Date()).getTime();
	elapsed = time - old_time;
	old_time = time;
	seconds += elapsed;
	gl.uniform1f (g_time_loc, seconds);
	
	gl.clear (gl.COLOR_BUFFER_BIT);
	gl.useProgram (g_shader_prog_idx);
	gl.enableVertexAttribArray (0);
	gl.enableVertexAttribArray (1);
	
	gl.bindBuffer (gl.ARRAY_BUFFER, g_vbos.vp_vbo_idx);
	gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer (gl.ARRAY_BUFFER, g_vbos.vt_vbo_idx);
	gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 0);
	gl.activeTexture (gl.TEXTURE0);
	
	gl.drawArrays (gl.TRIANGLES, 0, g_vbos.count);
	window.requestAnimFrame (render, gl.canvas);
}
