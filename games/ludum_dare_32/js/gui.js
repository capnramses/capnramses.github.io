var player_score = 100;

// special camera to look at 3d models to hire
var gui_V;
var gui_P;
var gui_PV;
var gui_arthur_PV;
var gui_heckler_PV;

var gui_hover_arthur_green = false;
var gui_hover_arthur_red = false;
var gui_hover_heckler_green = false;
var gui_hover_heckler_red = false;

var time_accum_bank = 0.0;
var points_text;
var player_pop_text;
var enemy_pop_text;

function init_gui () {
	var font_px = 40.0;
	var font_voffset = font_px / canvas.clientHeight;
	points_text = add_text ("Bank Account: $" + player_score, -0.9, -0.5,
		font_px, 1.0, 1.0, 1.0, 1.0);
	player_pop_text = add_text ("Player Popu. ", 0.0, -0.5, font_px, 1.0, 1.0,
		1.0, 1.0);
	enemy_pop_text = add_text ("Enemy Popu. ", 0.5, -0.5, font_px, 1.0, 1.0,
		1.0, 1.0);
	add_text ("HIRE COMEDIAN:\n    (100pts)", -0.9, -0.7, font_px, 1.0, 1.0, 1.0, 1.0);
	add_text ("HIRE HECKLER:\n    (100pts)", 0.0, -0.7, font_px, 1.0, 1.0, 1.0, 1.0);
	
	gui_V = look_at ([0.0, 0.5, 5.0], [0.0, 0.5, 0.0], [0.0, 1.0, 0.0]);
	var aspect = canvas.clientWidth / canvas.clientHeight;
	gui_P = perspective (60.0, aspect, 0.1, 100.0);
	gui_PV = mult_mat4_mat4 (gui_P, gui_V);
	gui_arthur_PV = translate_mat4 (gui_PV, [-0.5, -0.8, 0.0]);
	gui_heckler_PV = translate_mat4 (gui_PV, [0.35, -0.8, 0.0]);
}

function draw_gui () {
	gl.useProgram (shader_progs[1]);
	
	if (has_arthur_in_hand) {
		var mouse_PV = translate_mat4 (gui_PV, [mouse_x_clip, mouse_y_clip - 0.1, 0.0]);
		gl.uniformMatrix4fv (agent_PV_loc, gl.FALSE,
			new Float32Array (mouse_PV));
	} else {
		gl.uniformMatrix4fv (agent_PV_loc, gl.FALSE,
			new Float32Array (gui_arthur_PV));
	}
	
	cam_dirty = true;
	
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, arthur_icon_tex);
	gl.activeTexture (gl.TEXTURE1);
	gl.bindTexture (gl.TEXTURE_2D, arthur_icon_palette_tex);

	if (gui_hover_arthur_green) {
		gl.uniform3f (agent_highlight_loc, 0.0, 1.0, 0.0);
	} else if (gui_hover_arthur_red) {
		gl.uniform3f (agent_highlight_loc, 1.0, 0.0, 0.0);
	} else {
		gl.uniform3f (agent_highlight_loc, 0.0, 0.0, 0.0);
	}

	gl.uniformMatrix4fv (agent_M_loc, gl.FALSE,
		new Float32Array (identity_mat4 ()));
	gl.uniform3f (agent_team_col_loc, 0.0, 0.0, 1.0);
	vao_ext.bindVertexArrayOES (arthur_vao);
	gl.drawArrays (gl.TRIANGLES, 0, arthur_pc);
	
	if (has_heckler_in_hand) {
		var mouse_PV = translate_mat4 (gui_PV, [mouse_x_clip, mouse_y_clip - 0.1, 0.0]);
		gl.uniformMatrix4fv (agent_PV_loc, gl.FALSE,
			new Float32Array (mouse_PV));
	} else {
		gl.uniformMatrix4fv (agent_PV_loc, gl.FALSE,
			new Float32Array (gui_heckler_PV));
	}
	cam_dirty = true;
	
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, heckler_icon_tex);
	gl.activeTexture (gl.TEXTURE1);
	gl.bindTexture (gl.TEXTURE_2D, heckler_icon_palette_tex);
	
	if (gui_hover_heckler_green) {
		gl.uniform3f (agent_highlight_loc, 0.0, 1.0, 0.0);
	} else if (gui_hover_heckler_red) {
		gl.uniform3f (agent_highlight_loc, 1.0, 0.0, 0.0);
	} else {
		gl.uniform3f (agent_highlight_loc, 0.0, 0.0, 0.0);
	}

	gl.uniformMatrix4fv (agent_M_loc, gl.FALSE,
		new Float32Array (identity_mat4 ()));
	gl.uniform3f (agent_team_col_loc, 0.0, 0.0, 1.0);
	vao_ext.bindVertexArrayOES (heckler_vao);
	gl.drawArrays (gl.TRIANGLES, 0, heckler_pc);
	
}

function count_enemy_pop () {
	var sum = 0;
	var n = ai_city_indices.length;
	for (var i = 0; i < n; i++) {
		var city_index = ai_city_indices[i];
		var city_name = city_names[city_index];
		var stats = g.getCityStats (city_name);
		sum += Number (stats.population);
	}
	return sum;
}

function count_player_pop () {
	var sum = 0;
	var n = player_city_indices.length;
	for (var i = 0; i < n; i++) {
		var city_index = player_city_indices[i];
		var city_name = city_names[city_index];
		var stats = g.getCityStats (city_name);
		sum += Number (stats.population);
	}
	return sum;
}

function update_gui (elapsed) {
	time_accum_bank += elapsed;
	while (time_accum_bank > 0.1) {
		time_accum_bank -= 0.1;
		player_score += 1;
		update_text (points_text, "Bank Account: $" + player_score);
	}
	
	var enemy_pop = ((count_enemy_pop () / initial_enemy_pop) *
		100.0).toFixed (0);
	var player_pop = ((count_player_pop () / initial_player_pop) *
		100.0).toFixed (0);
	if (enemy_pop > 80) {
		change_text_colour (enemy_pop_text, 0.0, 1.0, 0.0, 1.0);
	} else if (enemy_pop > 50) {
		change_text_colour (enemy_pop_text, 1.0, 1.0, 0.0, 1.0);
	} else {
		change_text_colour (enemy_pop_text, 1.0, 0.0, 0.0, 1.0);
	}
	if (player_pop > 80) {
		change_text_colour (player_pop_text, 0.0, 1.0, 0.0, 1.0);
	} else if (player_pop > 50) {
		change_text_colour (player_pop_text, 1.0, 1.0, 0.0, 1.0);
	} else {
		change_text_colour (player_pop_text, 1.0, 0.0, 0.0, 1.0);
	}
	
	update_text (player_pop_text, "Player Popu. " + player_pop + "%");
	update_text (enemy_pop_text, "Enemy Popu. " + enemy_pop + "%");

	//
	// may as well check for end-game here
	// if < 10 == game over
	if (enemy_pop <= 10) {
		won_game = true;
		game_state = "foot";
		console.log ("Player won the game");
		var sound = new Howl ({urls: ['audio/fart.wav']}).play();
	} else if (player_pop <= 10) {
		won_game = false;
		game_state = "foot";
		console.log ("AI won the game");
		var sound = new Howl ({urls: ['audio/fart.wav']}).play();
	}
}
