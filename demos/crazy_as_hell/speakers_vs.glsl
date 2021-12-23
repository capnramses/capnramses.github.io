uniform mat4 proj_mat;
uniform mat4 view_mat;
uniform mat4 model_mat;// bearing; // or better -> xyz pos or even better -> model mat

attribute vec3 vp;
attribute vec2 vt;

varying vec2 st;

void main () {
	//gl_PointSize = 4.0;
	st = vt;
	gl_Position = proj_mat * view_mat * model_mat * vec4 (vp, 1.0);
}
