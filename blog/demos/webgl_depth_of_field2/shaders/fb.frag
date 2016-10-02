//
// aux framebuffer shader
// Anton Gerdelan 10 March 2015
// antongerdelan.net
//

precision mediump float;

varying vec2 st;
uniform sampler2D fb_rgba_tex;
uniform sampler2D fb_half_rgba_tex;
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
	gl_FragColor = vec4 (nfd, nfd, nfd, 1.0);

	// abs dist factor 0 to 1
	float df = abs (c - nfd);
	gl_FragColor = vec4 (df, df, df, 1.0);
	
	vec3 blur_rgb = texture2D (fb_half_rgba_tex, st).rgb;
	vec3 clear_rgb = texture2D (fb_rgba_tex, st).rgb;
	
	// too close to camera
	if (c < 0.05) {
		gl_FragColor = vec4 (blur_rgb, 1.0);
		return;
	}
	// background TODO remove -- had artifacts
	//if (c > 0.5) {
		//gl_FragColor = vec4 (blur_rgb, 1.0);
	//	return;
//	}
	// clear near the focus point
	if (df < 0.2) {
		gl_FragColor = vec4 (clear_rgb, 1.0);
		return;
	}
	//gl_FragColor.rgb = mix (clear_rgb * vec3 (1.0, 0.0, 0.0), blur_rgb * vec3 (0.0, 1.0, 0.0), df * 1.5);
	df = clamp (df, 0.0, 1.0);
	gl_FragColor.rgb = mix (clear_rgb, blur_rgb, df);
	gl_FragColor.a = 1.0;
}
