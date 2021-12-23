attribute vec3 lc_vp;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projMat;

void main (void) {
  gl_PointSize = 1.5;
	gl_Position = projMat * viewMat * modelMat * vec4(lc_vp, 1);
}