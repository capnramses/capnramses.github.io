attribute vec3 vp_loc;
attribute vec2 vt;

varying vec2 texCoords;

void main (void) {
	texCoords = vt;
	gl_Position = vec4 (vp_loc, 1);
}
