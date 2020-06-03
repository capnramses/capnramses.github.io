//
// basic texturing shader
// Anton Gerdelan 23 Dec 2014
// antongerdelan.net
//

precision mediump float;

varying vec2 st;
varying vec3 n, p;
uniform sampler2D dm;

void main () {
	//
	// shading darker based on angle to eye
	vec3 n_eye = normalize (n);
	vec3 p_to_eye = normalize (-p);
	float dp = dot (n_eye, p_to_eye) * 0.5 + 0.5;
	
	vec4 texel = texture2D (dm, st * 2.0);
	texel *= vec4 (1.0, 1.0, 0.0, 1.0);
	vec3 rgb = texel.rgb * dp;
	
	//vec3 srgb = pow (rgb, vec3 (2.2, 2.2, 2.2));
	//gl_FragColor = vec4 (srgb, 1.0);
	gl_FragColor = vec4 (rgb, 1.0);
}
