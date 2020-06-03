attribute vec3 vp_loc;

uniform mat4 proj_mat;
uniform mat4 view_mat;
uniform mat4 model_mat;

void main (void) {
	gl_Position = proj_mat * view_mat * model_mat * vec4 (vp_loc, 1.0);
}
