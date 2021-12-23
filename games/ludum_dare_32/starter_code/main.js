// some test geometry to draw
var quad_vao;
// timers in seconds used for working out time steps
var prev_time_s;
var time_step_accum_s = 0.0;
// updates at 100Hz
var time_step_size_s = 0.01;

//
// start context and start loading assets
//
function init () {
	init_gl ();
	
	// actual programmes to build from embedded in tags on the index.html page
	var shader_prog_srcs = [
		"test.glsl"
	];
	if (!load_shaders (shader_prog_srcs)) {
		return false;
	}
	
	// test geometry creation
	var quad_pts = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
	quad_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (quad_vao);
	var quad_vp_vbo = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, quad_vp_vbo);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (quad_pts), gl.STATIC_DRAW);
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
	
	return true;
}

//
// main drawing function
//
function draw_frame () {
	gl.clear (gl.COLOR_BUFFER_BIT);
	
	gl.useProgram (shader_progs[0]);
	vao_ext.bindVertexArrayOES (quad_vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
}

//
// main time-step based logic update function
//
function update () {
	
}

function main_loop () {
	// update timers
	var curr_time_s = (new Date).getTime () / 1000.0;
	var elapsed_s = curr_time_s - prev_time_s;
	prev_time_s = curr_time_s;
	time_step_accum_s += elapsed_s;
	
	// drawing
	draw_frame ();
	
	// logic updates
	while (time_step_accum_s >= time_step_size_s) {
		time_step_accum_s -= time_step_size_s;
		
		//
		// call updates here, with elapsed time of "time_step_size_s"
		//
		
	}

	window.requestAnimFrame (main_loop, canvas);
}

//
// programme entry point
//
function main () {
	// start context, start loading assets
	if (!init ()) {
		return;
	}
	// animate and do logic
	prev_time = (new Date).getTime () / 1000.0;
	main_loop ();
}
