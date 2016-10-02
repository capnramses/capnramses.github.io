// agent image files
var arthur_icon_image = "textures/arthur.png";
var arthur_icon_palette_image = "textures/arthur_palette.png";
var heckler_icon_image = "textures/heckler.png";
var heckler_icon_palette_image = "textures/heckler_palette.png";
// arthur mesh file
var arthur_mesh = "meshes/arthur.obj";
var heckler_mesh = "meshes/heckler.obj";
// arthur texture
var arthur_icon_tex;
var arthur_icon_palette_tex;
var heckler_icon_tex;
var heckler_icon_palette_tex;
// VAO for mesh
var arthur_vao;
var heckler_vao;
// # of vertex points in mesh
var arthur_pc;
var heckler_pc;
// actual instances of city mesh things on the map
var arthur_icons = [];
var heckler_icons = [];
var agent_PV_loc;
var agent_M_loc;
var agent_palette_loc;
var agent_team_col_loc;
var agent_highlight_loc;

//
// east/west pos on map between -20 (left) and +20 (right)
// south/north pos on map between -10 (bottom) and +10 (top)
// team_num is 0 (us) or 1 (them)
// returns index number
//
function add_comedian_icon (world_x, world_z, team_num) {
	var arthur = new Object;
	arthur.x = world_x;
	arthur.y = 0.0;
	arthur.z = world_z;
	var S = scale_mat4 (identity_mat4 (), [2.0, 2.0, 2.0]);
	arthur.M = translate_mat4 (S, [arthur.x, arthur.y, arthur.z]);
	arthur.team_num = team_num;
	arthur_icons.push (arthur);

	return arthur_icons.length - 1;
}

function add_heckler_icon (world_x, world_z, team_num) {
	var heckler = new Object;
	heckler.x = world_x;
	heckler.y = 0.0;
	heckler.z = world_z;
	var S = scale_mat4 (identity_mat4 (), [2.0, 2.0, 2.0]);
	heckler.M = translate_mat4 (S, [heckler.x, heckler.y, heckler.z]);
	heckler.team_num = team_num;
	heckler_icons.push (heckler);

	return heckler_icons.length - 1;
}

function init_agent_icons () {
	// texture
	arthur_icon_tex = create_texture_from_file (arthur_icon_image, true);
	arthur_icon_palette_tex = create_texture_from_file (
		arthur_icon_palette_image, true);
	heckler_icon_tex = create_texture_from_file (heckler_icon_image, true);
	heckler_icon_palette_tex = create_texture_from_file (
		heckler_icon_palette_image, true);
	// mesh
	arthur_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (arthur_vao);
	parse_obj_into_vbos (arthur_mesh);
	arthur_pc = pc;
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
	
	heckler_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (heckler_vao);
	parse_obj_into_vbos (heckler_mesh);
	heckler_pc = pc;
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

	agent_PV_loc = get_uniform_loc (shader_progs[1], "PV");
	agent_M_loc = get_uniform_loc (shader_progs[1], "M");
	agent_palette_loc = get_uniform_loc (shader_progs[1], "palette");
	agent_team_col_loc = get_uniform_loc (shader_progs[1], "team_col");
	agent_highlight_loc = get_uniform_loc (shader_progs[1], "highlight");
	
	//gl.useProgram (shader_progs[1]);
	//gl.uniformMatrix4fv (city_PV_loc, gl.FALSE, new Float32Array (PV));
	//gl.uniform1i (city_palette_loc, 1);
	//gl.uniform3f (city_team_col_loc, 0.2, 0.2, 0.2);
}

function draw_agent_icons () {
	gl.useProgram (shader_progs[1]);
	if (cam_dirty) {
		gl.uniformMatrix4fv (agent_PV_loc, gl.FALSE, new Float32Array (PV));
	}
	gl.uniform3f (agent_highlight_loc, 0.0, 0.0, 0.0);
	
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, arthur_icon_tex);
	gl.activeTexture (gl.TEXTURE1);
	gl.bindTexture (gl.TEXTURE_2D, arthur_icon_palette_tex);
	
	var n = arthur_icons.length;
	for (var i = 0; i < n; i++) {
		gl.uniformMatrix4fv (agent_M_loc, gl.FALSE,
			new Float32Array (arthur_icons[i].M));
		if (arthur_icons[i].team_num == 0) {
			gl.uniform3f (agent_team_col_loc, 1.0, 0.0, 0.0);
		} else if (arthur_icons[i].team_num == 1) {
			gl.uniform3f (agent_team_col_loc, 0.0, 0.0, 1.0);
		} else {
			gl.uniform3f (agent_team_col_loc, 0.2, 0.2, 0.2);
		}
		vao_ext.bindVertexArrayOES (arthur_vao);
		gl.drawArrays (gl.TRIANGLES, 0, arthur_pc);
	}
	
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, heckler_icon_tex);
	gl.activeTexture (gl.TEXTURE1);
	gl.bindTexture (gl.TEXTURE_2D, heckler_icon_palette_tex);

	var n = heckler_icons.length;
	for (var i = 0; i < n; i++) {
		gl.uniformMatrix4fv (agent_M_loc, gl.FALSE,
			new Float32Array (heckler_icons[i].M));
		if (heckler_icons[i].team_num == 0) {
			gl.uniform3f (agent_team_col_loc, 1.0, 0.0, 0.0);
		} else if (heckler_icons[i].team_num == 1) {
			gl.uniform3f (agent_team_col_loc, 0.0, 0.0, 1.0);
		} else {
			gl.uniform3f (agent_team_col_loc, 0.2, 0.2, 0.2);
		}
		vao_ext.bindVertexArrayOES (heckler_vao);
		gl.drawArrays (gl.TRIANGLES, 0, heckler_pc);
	}
}

function add_comedian_to_city (agent_team, city_num) {
	var n = city_icons[city_num].num_agents;
	var degs_per_agent = 38.0;
	var our_deg = degs_per_agent * n;
	var offset_vec = [0.0, 0.0, -2.0, 1.0];
	var R = rotate_y_deg (identity_mat4 (), our_deg);
	var rotated_vec = mult_mat4_vec4 (R, offset_vec);
	var city_pos = [city_icons[city_num].x, 0.0, city_icons[city_num].z];
	var wp = add_vec3_vec3 (rotated_vec, city_pos);
	add_comedian_icon (wp[0], wp[2], agent_team);
	city_icons[city_num].num_agents++;
}

function add_heckler_to_city (agent_team, city_num) {
	var n = city_icons[city_num].num_agents;
	var degs_per_agent = 38.0;
	var our_deg = degs_per_agent * n;
	var offset_vec = [0.0, 0.0, -2.0, 1.0];
	var R = rotate_y_deg (identity_mat4 (), our_deg);
	var rotated_vec = mult_mat4_vec4 (R, offset_vec);
	var city_pos = [city_icons[city_num].x, 0.0, city_icons[city_num].z];
	var wp = add_vec3_vec3 (rotated_vec, city_pos);
	add_heckler_icon (wp[0], wp[2], agent_team);
	city_icons[city_num].num_agents++;
}
