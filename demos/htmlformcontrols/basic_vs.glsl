attribute vec3 lc_vp;
attribute vec2 vt;
attribute vec3 lc_vn;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projMat;

varying vec2 texCoords;
varying vec3 ec_3d_norm;
varying vec3 ec_3d_pos;
varying vec3 ec_3d_lightPos;

void main (void) {

	vec4 wp_4d_lightPos = vec4 (2, 1, 3, 1);
	vec4 ec_4d_lightPos = viewMat * wp_4d_lightPos;
	ec_3d_lightPos = ec_4d_lightPos.xyz;

	texCoords = vt;
	ec_3d_norm = normalize (viewMat * modelMat * vec4 (lc_vn, 0)).xyz; // should be using normalMat (inverse-transpose of 3x3 modelMat)
	vec4 ec_4d_pos = viewMat * modelMat * vec4 (lc_vp, 1);
	ec_3d_pos = ec_4d_pos.xyz;
	
	gl_Position = projMat * ec_4d_pos;
}