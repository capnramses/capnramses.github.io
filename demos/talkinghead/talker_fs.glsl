precision mediump float;

varying vec3 n_eye;
varying vec3 pos_eye;
// light position
varying vec3 Lp_eye;

void main () {
	vec3 n = normalize (n_eye);
	// diffuse
	vec3 Ld  = vec3 (0.3, 0.5, 0.9); // diffuse light colour
	vec3 l_to_e = normalize (Lp_eye - pos_eye);
	float dp = max (dot (l_to_e, n), 0.0);
	vec3 Id = Ld * dp; 
	
	// ambient
	vec3 Ia = vec3 (0.3, 0.3, 0.3);
	
	// specular
	vec3 Ls = vec3 (0.5, 0.6, 1.0);
	float specPower = 1.0; // load from light source properties or material properties
	vec3 p_to_e = normalize (-pos_eye); // vector from surface to eye (will compare this to light reflection to see if it matches)
	vec3 r = reflect (-p_to_e, n); // reflect incoming light straight off surface (around normal)
	float dp2 = max (dot (r, p_to_e), 0.0);
	vec3 Is = Ls * pow (dp2 , specPower);

	// phong lighting
	gl_FragColor.rgb = Ia + Id + Is;
  gl_FragColor.a = 1.0;
}
