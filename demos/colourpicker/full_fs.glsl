precision mediump float;

uniform sampler2D tex;
uniform vec4 multiply;
varying vec2 texcoords;

void main () {
	//gl_FragColor = vec4 (texcoords.x, texcoords.y, 0, 1);
	gl_FragColor = texture2D (tex, texcoords) * multiply;
}
