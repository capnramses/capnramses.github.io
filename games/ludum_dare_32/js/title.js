//

var title_images = [
	"textures/title.png",
	"textures/title2.png",
	"textures/story.png",
	"textures/instruc.png"
];
var foot_image = "textures/foot.png";
// map texture
var title_texs = [];
var foot_tex;

var title_timer = 0.0;
var title_anim_step = 0.5;
var title_curr_frame = 0;
var foot_y_loc;
var foot_y = 2.0;
var end_text_added = false;
var end_text;

function init_title () {
	title_texs[0] = create_texture_from_file (title_images[0]);
	title_texs[1] = create_texture_from_file (title_images[1]);
	title_texs[2] = create_texture_from_file (title_images[2]);
	title_texs[3] = create_texture_from_file (title_images[3]);
	foot_tex = create_texture_from_file (foot_image);
	foot_y_loc = get_uniform_loc (shader_progs[4], "y");
}

function update_title (seconds) {
	title_timer += seconds;
	
	if (title_curr_frame < 2) {
		if (title_timer > 3.0) {
			title_curr_frame = 2;
		} else if (title_timer > 2.5) {
			title_curr_frame = 1;
		} else if (title_timer > 2.0) {
			title_curr_frame = 0;
		} else if (title_timer > 1.5) {
			title_curr_frame = 1;
		} else if (title_timer > 1.0) {
			title_curr_frame = 0;
		} else if (title_timer > 0.5) {
			title_curr_frame = 1;
		} else {
			title_curr_frame = 0;
		}
	}

	// advance to map
	// perhaps fade out first in shader?
	if (mouse_is_down || key_is_down) {
		switch (title_curr_frame) {
			case 0:
				title_curr_frame = 2;
				break;
			case 1:
				title_curr_frame = 2;
				break;
			case 2:
				title_curr_frame = 3;
				break;
			case 3:
				game_state = "map";
				break;
			default:
		}
		key_is_down = false;
		mouse_is_down = false;
	}
}

function update_foot (seconds) {
	if (foot_y > 0.0) {
		foot_y -= seconds;
	}
	if (foot_y < 0.0) {
		foot_y = 0.0;
		
		if (!end_text_added) {
			// put appropriate text on screen
			var font_px = 100.0;
			if (won_game) {
				end_text = add_text (
					"          VICTORY!\n\nEnemy Population Laughed to\n         Annhilation!",
					-0.75, 0.5, font_px, 0.0, 1.0, 0.0, 1.0);
			} else {
				end_text = add_text (
					"           DEFEAT!\n\nOur Population Was Laughed to\n         Annhilation!",
					-0.75, 0.5, font_px, 1.0, 0.0, 0.0, 1.0);
			}
			end_text_added = true;
		}
	}
}

//
// param shd probably be current world pos of centre of view?
//
function draw_title () {
	gl.useProgram (shader_progs[2]);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, title_texs[title_curr_frame]);
	vao_ext.bindVertexArrayOES (quad_vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
}

function draw_foot () {
	gl.useProgram (shader_progs[4]);
	gl.uniform1f (foot_y_loc, foot_y);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, foot_tex);
	vao_ext.bindVertexArrayOES (quad_vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
	
	if (end_text_added) {
		draw_one_text (end_text);
	}
}
