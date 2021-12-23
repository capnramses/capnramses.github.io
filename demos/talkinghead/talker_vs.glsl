attribute vec3 neutral_vp;
attribute vec3 angry_vp;
attribute vec3 happy_vp;
attribute vec3 vn;

uniform mat4 M, V, P;
// weights for morph targets -- neutral is auto-derived
uniform float angry_w;
uniform float happy_w;

varying vec3 n_eye;
varying vec3 pos_eye;
// light position
varying vec3 Lp_eye;

void main () {
  // work out neutral weight
  float neutral_w = 1.0 - angry_w + happy_w;
  neutral_w = clamp (neutral_w, 0.0, 1.0);
  
  // sum of weights and weighted average
  float sum_w = neutral_w + angry_w + happy_w;
  float neutral_f = neutral_w / sum_w;
  float happy_f = happy_w / sum_w;
  float angry_f = angry_w / sum_w;
	vec3 pos = neutral_f * neutral_vp + angry_f * angry_vp + happy_f * happy_vp;

	pos_eye = (V * M * vec4 (pos, 1.0)).xyz; 
	Lp_eye = (V * vec4 (1.0, 1.0, 10.0, 1.0)).xyz;
	n_eye = (V * M * vec4 (vn, 0.0)).xyz;

	gl_Position = P * vec4 (pos_eye, 1.0);
}

