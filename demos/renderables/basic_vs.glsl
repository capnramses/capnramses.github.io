attribute vec3 lc_vp;

void main (void) {
	gl_Position = vec4 (lc_vp, 1);
}