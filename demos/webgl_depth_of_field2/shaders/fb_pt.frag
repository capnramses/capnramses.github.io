//
// aux framebuffer shader
// Anton Gerdelan 10 March 2015
// antongerdelan.net
//

precision mediump float;

varying vec2 st;
uniform sampler2D fb_rgba_tex;

void main () {
	gl_FragColor = texture2D (fb_rgba_tex, st);
}
