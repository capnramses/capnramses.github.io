attribute vec3 lc_vp;
attribute vec2 vt;

uniform mat4 modelMat;

varying vec2 texCoords;

void main (void) {
	texCoords = vt;
	gl_Position = modelMat * vec4 (lc_vp, 1);
}