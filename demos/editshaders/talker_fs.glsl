precision mediump float;

varying vec2 texCoords;
varying vec3 ec_3d_norm;
varying vec3 ec_3d_pos;
varying vec3 ec_3d_lightPos;

uniform sampler2D tex;

void main (void) {
	// diffuse
	vec3 Ld_rgb  = vec3 (0.3, 0.5, .9); // diffuse light colour
	vec4 Kd_rgba = texture2D (tex, texCoords); // diffuse coefficient using texture
	vec3 ec_3d_surfToLightDir = normalize (ec_3d_lightPos - ec_3d_pos);
	vec4 Id_rgba = vec4 (Ld_rgb * Kd_rgba.rgb * max (dot (ec_3d_surfToLightDir, ec_3d_norm), 0.0), Kd_rgba.a); 
	
	// ambient
	vec3 La_rgb = vec3 (0.3, 0.3, 0.3);
	vec4 Ia_rgba = vec4( La_rgb * Kd_rgba.xyz, 1);
	
	// specular
	vec3 Ls_rgb = vec3 (1,1,1);
	vec3 Ks_rgb = vec3 (.5, .6, 1); // could use a specular map here or reduce for non-shiny material
	float specPower = 1.0; // load from light source properties or material properties
	vec3 ec_3d_surfToEye = normalize (-ec_3d_pos); // vector from surface to eye (will compare this to light reflection to see if it matches)
	vec3 ec_3d_reflect = reflect (-ec_3d_surfToLightDir, ec_3d_norm); // reflect incoming light straight off surface (around normal)
	float reflectingRightIntoYourEyeFactor = max ( dot (ec_3d_reflect, ec_3d_surfToEye), 0.0);
	vec3 Is_rgb = Ls_rgb * Ks_rgb * pow (reflectingRightIntoYourEyeFactor , specPower); // must have decimal points to compare floats in es 1.0
	vec4 Is_rgba = vec4 (Is_rgb, 1);

	// phong lighting
	gl_FragColor = Ia_rgba + Id_rgba + Is_rgba;
	// transparency
  gl_FragColor.a = 0.7;
}