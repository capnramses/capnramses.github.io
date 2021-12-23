precision mediump float;

uniform sampler2D tex;
uniform vec4 colour;

varying vec2 st;

void main () {
	gl_FragColor = colour * texture2D (tex, st);
}
