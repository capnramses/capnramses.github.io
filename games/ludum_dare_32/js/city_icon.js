/*
TODO:
population remaining indicator
--shrinking person/bar in 3d?
--text tag same as city
joke virus spread indicator?
*/

// city image files
var city_icon_image = "textures/city.png";
var city_icon_palette_image = "textures/city_palette.png";
// city mesh file
var city_mesh = "meshes/city.obj";
// city texture
var city_icon_tex;
var city_icon_palette_tex;
// VAO for mesh
var city_vao;
// # of vertex points in mesh
var city_pc;
// actual instances of city mesh things on the map
var city_icons = [];
var city_PV_loc;
var city_M_loc;
var city_palette_loc;
var city_team_col_loc;
var city_highlight_loc;
var highlight_city = -1;
var city_texts = [];

//
// name of city and
// east/west pos on map between -20 (left) and +20 (right)
// south/north pos on map between -10 (bottom) and +10 (top)
// team_num is 0 (us) or 1 (them)
//
function add_city_icon (name_str, world_x, world_z, team_num) {
	var font_px = 40.0;

	var icon = new Object;
	icon.name_str = name_str;
	icon.x = world_x;
	icon.y = 0.0;
	icon.z = world_z;
	icon.M = translate_mat4 (identity_mat4 (), [icon.x, icon.y, icon.z]);
	icon.team_num = team_num;
	icon.num_agents = 0;
	city_icons.push (icon);

	// convert city world coords to screen coords
	var screen_pos = mult_mat4_vec4 (V, [world_x, 0.0, world_z, 1.0]);
	screen_pos = mult_mat4_vec4 (P, screen_pos);
	// perspective division
	screen_pos[0] /= screen_pos[3];
	screen_pos[1] /= screen_pos[3];
	screen_pos[2] /= screen_pos[3];
	var text_id = add_text (name_str, screen_pos[0], screen_pos[1], font_px,
		1.0, 1.0, 1.0, 1.0);
	city_texts.push (text_id);
	
	if (team_num == 0) {
		ai_city_indices.push (city_icons.length - 1);
	} else {
		player_city_indices.push (city_icons.length - 1);
	}
}

function init_city_icons () {
	// texture
	city_icon_tex = create_texture_from_file (city_icon_image, true);
	city_icon_palette_tex = create_texture_from_file (city_icon_palette_image,
		true);
	// mesh
	city_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (city_vao);
	parse_obj_into_vbos (city_mesh);
	city_pc = pc;
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vp);
	gl.vertexAttribPointer (gl.getAttribLocation (shader_progs[1], "vp"), 3,
		gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vt);
	gl.vertexAttribPointer (gl.getAttribLocation (shader_progs[1], "vt"), 2,
		gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (1);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vn);
	gl.vertexAttribPointer (gl.getAttribLocation (shader_progs[1], "vn"), 3,
		gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (2);

	city_PV_loc = get_uniform_loc (shader_progs[1], "PV");
	city_M_loc = get_uniform_loc (shader_progs[1], "M");
	city_palette_loc = get_uniform_loc (shader_progs[1], "palette");
	city_team_col_loc = get_uniform_loc (shader_progs[1], "team_col");
	city_highlight_loc = get_uniform_loc (shader_progs[1], "highlight");
	
	gl.useProgram (shader_progs[1]);
	gl.uniformMatrix4fv (city_PV_loc, gl.FALSE, new Float32Array (PV));
	gl.uniform1i (city_palette_loc, 1);
	gl.uniform3f (city_team_col_loc, 0.2, 0.2, 0.2);
}

function draw_city_icons () {
	gl.useProgram (shader_progs[1]);
	if (cam_dirty) {
		gl.uniformMatrix4fv (city_PV_loc, gl.FALSE, new Float32Array (PV));
	}
	
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, city_icon_tex);
	gl.activeTexture (gl.TEXTURE1);
	gl.bindTexture (gl.TEXTURE_2D, city_icon_palette_tex);

	var n = city_icons.length;
	for (var i = 0; i < n; i++) {
		if (highlight_city == i) {
			gl.uniform3f (city_highlight_loc, 0.0, 1.0, 0.0);
		} else {
			gl.uniform3f (city_highlight_loc, 0.0, 0.0, 0.0);
		}
	
		gl.uniformMatrix4fv (city_M_loc, gl.FALSE,
			new Float32Array (city_icons[i].M));
		if (city_icons[i].team_num == 0) {
			gl.uniform3f (city_team_col_loc, 1.0, 0.0, 0.0);
		} else if (city_icons[i].team_num == 1) {
			gl.uniform3f (city_team_col_loc, 0.0, 0.0, 1.0);
		} else {
			gl.uniform3f (city_team_col_loc, 0.2, 0.2, 0.2);
		}
		vao_ext.bindVertexArrayOES (city_vao);
		gl.drawArrays (gl.TRIANGLES, 0, city_pc);
	}
}

function get_closest_city_to (x_clip, y_clip, range, team) {
	var n = city_icons.length;
	for (var i = 0; i < n; i++) {
		if (team > -1) {
			if (team != city_icons[i].team_num) {
				continue;
			}
		}
		var wp = [city_icons[i].x, 0.0, city_icons[i].z, 1.0];
		var cs = mult_mat4_vec4 (PV, wp);
		var nds = [cs[0] / cs[3], cs[1] / cs[3], cs[2] / cs[3]];
		
		var x_r = x_clip - nds[0];
		var y_r = y_clip - nds[1];
		var dsq = x_r * x_r + y_r * y_r;
		//console.log (i + " " + x_r + " " + y_r);
		
		if (dsq < range * range) {
			return i;
		}
	}
	return -1;
}

function update_city_stats () {
	var n = city_names.length;
	for (var i = 0; i < n; i++) {
		var name = city_names[i];
		var stats = g.getCityStats (name);
		var popu = stats.population;
		// HACK to hide a bug when pop is negative
		if (popu < 0) {
			popu = 0;
		}
		update_text (city_texts[i], name + "\npopu. " + popu +
			"\nvictims: " + stats.victims);
		// can also put  + "\nhumour " + stats.humourLevel
	}
}
