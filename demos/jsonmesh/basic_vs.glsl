attribute vec3 lc_vp;

uniform mat4 modelMat;

void main (void) {
	gl_Position = modelMat * vec4 (lc_vp, 1);
}