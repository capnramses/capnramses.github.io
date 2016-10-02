//

var map_image = "textures/map.png"
// map texture
var map_tex;
// location of camera matrices in shader
var map_PV_loc;
var map_M_loc;
var map_M;

function init_map () {
	map_tex = create_texture_from_file (map_image);
	map_PV_loc = get_uniform_loc (shader_progs[0], "PV");
	map_M_loc = get_uniform_loc (shader_progs[0], "M");
	var S = scale_mat4 (identity_mat4 (), [20.0, 10.0, 0.0]);
	var R = rotate_x_deg (S, -90.0);
	map_M = translate_mat4 (R, [0.0, 0.0, 0.0]);
	
	gl.useProgram (shader_progs[0]);
	gl.uniformMatrix4fv (map_PV_loc, gl.FALSE, new Float32Array (PV));
	gl.uniformMatrix4fv (map_M_loc, gl.FALSE, new Float32Array (map_M));
}

//
// param shd probably be current world pos of centre of view?
//
function draw_map () {
	gl.useProgram (shader_progs[0]);
	if (cam_dirty) {
		gl.uniformMatrix4fv (map_PV_loc, gl.FALSE, new Float32Array (PV));
	}
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, map_tex);
	vao_ext.bindVertexArrayOES (quad_vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
}
