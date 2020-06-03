attribute vec3 lc_vp;
attribute vec2 vt;
attribute vec3 lc_vn;
attribute vec3 mtarget_loc;
attribute vec3 mad_loc;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projMat;
uniform float morphtimefactor;
uniform float madfactor;

varying vec2 texCoords;
varying vec3 ec_3d_norm;
varying vec3 ec_3d_pos;
varying vec3 ec_3d_lightPos;

void main (void) {

	// total of factors
        float totalfactors = morphtimefactor + madfactor;
        float defaultfacefactor = 1.0 - totalfactors;
        defaultfacefactor = clamp (defaultfacefactor, 0.0, 1.0);
        totalfactors = totalfactors + defaultfacefactor;
        float smilefactor = morphtimefactor / totalfactors;
        float angryfactor = madfactor / totalfactors;
	vec3 localPos = mix (lc_vp, mad_loc, smilefactor);
	localPos = mix (localPos, mtarget_loc, angryfactor);
        //localPos = mad_loc;
	vec4 wp_4d_lightPos = vec4 (1, 1, 10, 1);
	vec4 ec_4d_lightPos = viewMat * wp_4d_lightPos;
	ec_3d_lightPos = ec_4d_lightPos.xyz;

	texCoords = vt;
	ec_3d_norm = normalize (viewMat * modelMat * vec4 (lc_vn, 0)).xyz; // should be using normalMat (inverse-transpose of 3x3 modelMat)
	vec4 ec_4d_pos = viewMat * modelMat * vec4 (localPos, 1);
	ec_3d_pos = ec_4d_pos.xyz;
	
	gl_Position = projMat * ec_4d_pos;
}

