precision mediump float;

varying vec2 texCoords;
uniform sampler2D tex;

void main (void) {
	gl_FragColor = texture2D (tex, texCoords);
	//gl_FragColor = vec4 (1, 0, 1, 1);
}
