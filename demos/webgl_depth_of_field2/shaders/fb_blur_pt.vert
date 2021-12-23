//
// aux framebuffer shader
// Anton Gerdelan 10 March 2015
// antongerdelan.net
//

attribute vec2 vp; // points

varying vec2 st; // tex coords

void main () {
	st = (vp + 1.0) * 0.5;
	gl_Position = vec4 (vp, 0.0, 1.0);
}
