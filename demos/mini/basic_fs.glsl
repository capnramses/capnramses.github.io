precision mediump float;

varying vec2 texCoords;
uniform sampler2D tex;

void main (void) {
	//vec4 Kd = texture2D (tex, vec2 (texCoords.s, texCoords.t));
	vec4 Kd = texture2D (tex, texCoords);
	gl_FragColor = Kd;
	//gl_FragColor = vec4 (0, 0, 1, 1);
}