// camera matrices
var V, P, PV;
var cam_dirty = false;

function init_cam () {
	V = look_at ([3.0, 25.0, 15.0], [3.0, 1.0, 5.0],
		normalise_vec3 ([0.0, 2.5, -1.0]));
	var aspect = canvas.clientWidth / canvas.clientHeight;
	P = perspective (50.0, aspect, 0.1, 100.0);
	// changed fovy from 67.0 to 50.0 -- anton
	PV = mult_mat4_mat4 (P, V);
	cam_dirty = true;
}
