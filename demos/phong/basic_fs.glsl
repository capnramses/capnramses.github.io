precision mediump float;

varying vec2 texCoords;
varying vec3 ec_3d_norm;
varying vec3 ec_3d_pos;
varying vec3 ec_3d_lightPos;

uniform sampler2D tex;


void main (void) {
	// diffuse
	vec3 Ld_rgb  = vec3 (0.6, 0.6, 0.6); // diffuse light colour
	vec4 Kd_rgba = texture2D (tex, texCoords); // diffuse coefficient using texture
	vec3 ec_3d_surfToLightDir = normalize (ec_3d_lightPos - ec_3d_pos);
	vec4 Id_rgba = vec4 (Ld_rgb * Kd_rgba.rgb * max (dot (ec_3d_surfToLightDir, ec_3d_norm), 0.0), Kd_rgba.a); 
	
	// ambient
	vec3 La_rgb = vec3 (0.1, 0.1, 0.1);
	vec4 Ia_rgba = vec4( La_rgb * Kd_rgba.xyz, 1);
	
	// specular
	vec3 Ls_rgb = vec3 (0.5, 0.5, 0.5);
	vec3 Ks_rgb = vec3 (1, 1, 1); // could use a specular map here or reduce for non-shiny material
	float specPower = 15.0; // load from light source properties or material properties
	vec3 ec_3d_surfToEye = normalize (-ec_3d_pos); // vector from surface to eye (will compare this to light reflection to see if it matches)
	vec3 ec_3d_reflect = reflect (-ec_3d_surfToLightDir, ec_3d_norm); // reflect incoming light straight off surface (around normal)
	float reflectingRightIntoYourEyeFactor = max ( dot (ec_3d_reflect, ec_3d_surfToEye), 0.0);
	vec3 Is_rgb = Ls_rgb * Ks_rgb * pow (reflectingRightIntoYourEyeFactor , specPower); // must have decimal points to compare floats in es 1.0
	vec4 Is_rgba = vec4 (Is_rgb, 1);

	gl_FragColor = Ia_rgba + Id_rgba + Is_rgba;
	//gl_FragColor = vec4 (dot (ec_surfToLightDir, ec_normal.xyz), -1);
	//gl_FragColor = vec4 (Ld.xyz * 0.0, 1); // ahhh multiplying by zero upset the alpha so I could see the webpage background!!!
	//gl_FragColor = vec4 (testN.xyz, 1);
}

/// printing out my ec_normals was dark because my modelMatrix had a scale in it! -- added a normalize afterwards to fix