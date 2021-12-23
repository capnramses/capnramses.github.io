uniform mat4 proj_mat;
uniform mat4 view_mat;
uniform mat4 model_mat;// bearing; // or better -> xyz pos or even better -> model mat

attribute vec3 vp;

void main () {
	gl_PointSize = 40.0;
	gl_Position = proj_mat * view_mat * model_mat * vec4 (vp, 1.0);
}
