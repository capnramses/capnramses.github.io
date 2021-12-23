precision mediump float;

uniform sampler2D tex;
uniform vec4 colour;

void main () {
	gl_FragColor = colour * texture2D (tex, vec2 (gl_PointCoord.s, 1.0 - gl_PointCoord.t));
}
