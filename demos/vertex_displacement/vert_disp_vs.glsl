uniform mat4 proj_mat;
uniform mat4 view_mat;
uniform float time;

attribute vec3 vp;
attribute vec2 vt;

varying vec2 st;
/*
// look down birds-eye. can move up by adjusting the 4th column
const mat4 view_mat = mat4 (1.0, 0.0, 0.0, 0.0,
												0.0, 0.0, -1.0, 0.0,
												0.0, 1.0, 0.0, 0.0,
												0.0, 0.0, 0.0, 1.0);
												// woooops! shd be bottom row for p. last column is scale
												// movement happens after correction so if pointing -y, then +y is the new up and down (global z)
*/
void main () {
	st = vt;
	vec3 pos = vp;
	//float poley = sin (6.28 * -1.0 + time * 0.005) * 0.125;
	pos.y = sin (6.28 * -pos.x + time * 0.005) * 0.125;
	gl_Position = proj_mat * view_mat * vec4 (pos, 1.0);
}
