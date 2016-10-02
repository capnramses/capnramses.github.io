precision mediump float;

varying float fgroup;

void main () {
	float b = mod (fgroup, 10.0);
	float g = mod (fgroup - b, 100.0);
	float r = mod (fgroup - g - b, 1000.0);
	b /= 10.0;
	g /= 100.0;
	r /= 1000.0;
	
	gl_FragColor = vec4 (r, g, b, 1.0);
}
