precision mediump float;

uniform sampler2D tex;

varying vec2 st;

void main () {
	//gl_FragColor = vec4 (st, 0.0, 1.0);
	gl_FragColor = texture2D (tex, st);
}
