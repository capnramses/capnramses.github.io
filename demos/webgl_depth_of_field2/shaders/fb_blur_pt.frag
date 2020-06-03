//
// aux framebuffer shader
// Anton Gerdelan 10 March 2015
// antongerdelan.net
//

precision mediump float;

varying vec2 st;
uniform sampler2D fb_rgba_tex;

void main () {
	vec2 l = vec2 (st.s - 1.0 / 256.0, st.t);
	vec2 r = vec2 (st.s + 1.0 / 256.0, st.t);
	vec2 d = vec2 (st.s, st.t - 1.0 / 256.0);
	vec2 u = vec2 (st.s, st.t + 1.0 / 256.0);
	vec2 dl = vec2 (st.s - 1.0 / 256.0, st.t - 1.0 / 256.0);
	vec2 dr = vec2 (st.s + 1.0 / 256.0, st.t - 1.0 / 256.0);
	vec2 ul = vec2 (st.s - 1.0 / 256.0, st.t + 1.0 / 256.0);
	vec2 ur = vec2 (st.s + 1.0 / 256.0, st.t + 1.0 / 256.0);
	
	vec3 rgb = vec3 (0.0, 0.0, 0.0);
	rgb += texture2D (fb_rgba_tex, l).rgb;
	rgb += texture2D (fb_rgba_tex, r).rgb;
	rgb += texture2D (fb_rgba_tex, d).rgb;
	rgb += texture2D (fb_rgba_tex, u).rgb;
	rgb += texture2D (fb_rgba_tex, dl).rgb;
	rgb += texture2D (fb_rgba_tex, dr).rgb;
	rgb += texture2D (fb_rgba_tex, ul).rgb;
	rgb += texture2D (fb_rgba_tex, ur).rgb;
	
	rgb /= 8.0;
	gl_FragColor = vec4 (rgb, 1.0);
}
