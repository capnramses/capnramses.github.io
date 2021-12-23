//
// aux framebuffer shader
// Anton Gerdelan 10 March 2015
// antongerdelan.net
//

precision mediump float;

varying vec2 st;
uniform sampler2D fb_rgba_tex;
uniform sampler2D fb_d_tex;
uniform float fb_focus_dist;

void main () {
	//
	// linearised depth buffer
	float z = texture2D (fb_d_tex, st).r;
	float n = 0.1;
	float f = 300.0;
	float c = (2.0 * n) / (f + n - z * (f - n));
	//gl_FragColor = vec4 (c, c, c, 1.0);

	//
	// focus dist as in range 0 to 1
	float nfd = (fb_focus_dist - n) / (f - n);

	//
	// mid-range = no extra samples. near and far = 4 extras each side
	float fac = abs (c - nfd) * 8.0;
	float cfac = floor (fac);
	float dim_f = 1.0 / 800.0;

	vec4 accum = vec4 (0.0, 0.0, 0.0, 0.0);
	float s_c = 0.0;
	// 5x5
	if (cfac >= 3.0) {
		for (float t = -2.0; t <= 2.0; t += 1.0) {
			for (float s = -2.0; s <= 2.0; s += 1.0) {
				vec2 ast = st;
				ast.s += s * dim_f;
				ast.t += t * dim_f;
				accum += texture2D (fb_rgba_tex, ast);
				s_c += 1.0;
			}
		}
		gl_FragColor = accum / s_c;
		
	// 3x3
	} else if (cfac > 1.0) {
		for (float t = -1.0; t <= 1.0; t += 1.0) {
			for (float s = -1.0; s <= 1.0; s += 1.0) {
				vec2 ast = st;
				ast.s += s * dim_f;
				ast.t += t * dim_f;
				accum += texture2D (fb_rgba_tex, ast);
				s_c += 1.0;
			}
		}
		gl_FragColor = accum / s_c;
		
	// in focus
	} else {
		gl_FragColor = texture2D (fb_rgba_tex, st);
	}
	
	
	//gl_FragColor = vec4 (nfd, nfd, nfd, 1.0);
	
	//
	// colour buffer
	//vec4 rgba = texture2D (fb_rgba_tex, st);
	//gl_FragColor = rgba;
	
	//gl_FragColor = vec4 (c, c, c, 1.0);
}
