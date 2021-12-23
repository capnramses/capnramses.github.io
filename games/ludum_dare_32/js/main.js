// game state stored as string
var game_state = "title";

// some test geometry to draw
var quad_vao;
// timers in seconds used for working out time steps
var previous_millis;
var time_step_accum_s = 0.0;
var tic_step_accum_s = 0.0;
var tic_step_size = 1.0; // 1second per turn
// updates at 100Hz
var time_step_size_s = 0.01;

var initial_enemy_pop = 0;
var initial_player_pop = 0;

var font_img = "textures/abys.png"
var font_meta = "fonts/abys.meta"

// GAME GRAPH (presume this needs to be a global)
var g;
var city_names = [];
var vis; //visualisation of a citys population

// if game ends and this is true then we lost
// else we won
var won_game = false;

//
// start context and start loading assets
//
function init () {
	init_gl ();
	
	// actual programmes to build from embedded in tags on the index.html page
	var shader_prog_srcs = [
		"map.glsl", // 0
		"city.glsl", // 1
		"title.glsl", // 2
		"font.glsl", // 3
		"foot.glsl" // 4
	];
	if (!load_shaders (shader_prog_srcs)) {
		return false;
	}
	
	// test geometry creation
	var quad_pts = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
	quad_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (quad_vao);
	var quad_vp_vbo = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, quad_vp_vbo);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (quad_pts), gl.STATIC_DRAW);
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
	
	init_cam ();
	init_text_rendering (canvas.clientWidth, canvas.clientHeight);
	load_font (font_img, font_meta);
	init_title ();
	init_map ();
	init_city_icons ();
	init_agent_icons ();
	var sound = new Howl ({urls: ['audio/epic.ogg']}).play();
	
	init_gui ();
	
	/*-------------------------------------------------------------------------*/
	// START GRAPHIING LOGIC
	//
	console.log("Starting grpah viewer executions");

	g = new game_graph();
	g.addCity("Dublin",10,2,0.5);
	g.addCity("Cape Town",100,4,0.1);
	g.addCity("New York", 150, 2, 0.1);
	g.addCity("Rio de Janeiro", 200, 4, 0.4);
	g.addCity("Delhi", 300, 8, 1.0);
	g.addCity("Sydney", 50, 3, 0.4);
	g.addCity("Moscow", 120, 4, 0.13);
	g.addCity("Tokyo", 160, 10, 0.05);
	positionCityNodes("Dublin", g);
	positionCityNodes("Cape Town", g);
	positionCityNodes("New York", g);
	positionCityNodes("Rio de Janeiro", g);
	positionCityNodes("Delhi", g);
	positionCityNodes("Sydney", g);
	positionCityNodes("Moscow", g);
	positionCityNodes("Tokyo", g);

	g.connectCities("Cape Town", "Rio de Janeiro", 10);
	g.connectCities("Dublin", "Cape Town", 1);
	g.connectCities("Cape Town", "New York", 5);
	g.connectCities("Moscow", "Delhi", 1);
	g.connectCities("Tokyo", "Delhi", 4);
	g.connectCities("Tokyo", "Moscow", 8);
	g.connectCities("Sydney", "Delhi",2);
	g.connectCities("Sydney", "New York",2);

	
	city_names.push ("Dublin");
	city_names.push ("Cape Town");
	city_names.push ("New York");
	city_names.push ("Rio de Janeiro");
	city_names.push ("Delhi");
	city_names.push ("Sydney");
	city_names.push ("Moscow");
	city_names.push ("Tokyo");
	add_city_icon ("Dublin", -3.0, -7.0, 1);
	add_city_icon ("Cape Town", 1.0, 4.0, 0);
	add_city_icon ("New York", -11.0, -5.0, 0);
	add_city_icon ("Rio de Janeiro", -7.5, 2.5, 1);
	add_city_icon ("Delhi", 7.5, -3.0, 0);
	add_city_icon ("Sydney", 16.0, 4.0, 1);
	add_city_icon ("Moscow", 2.0, -7.0, 0);
	add_city_icon ("Tokyo", 14.0, -5.0, 1);
	
	initial_enemy_pop = count_enemy_pop ();
	console.log (initial_enemy_pop);
	initial_player_pop = count_player_pop ();
	console.log (initial_player_pop);
	
	/*-------------------------------------------------------------------------*/
	
	return true;
}

//
// main drawing function
//
function draw_frame () {
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport (0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
	
	var cd_at_st = cam_dirty;
	
	switch (game_state) {
		case "title":
			draw_title ();
			break;
		case "map":
			draw_map ();
			// ignore any depth values written by map so always-on-top
			draw_city_icons ();
			draw_agent_icons ();
			draw_gui ();
			draw_texts ();
			break;
		case "foot":
			draw_foot ();
			break;
		default:
	}
	
	if (cd_at_st) {
		//cam_dirty = false;
	}
}

//
// main time-step based logic update function
//
function update (elapsed) {
	tic_step_accum_s += elapsed;

	switch (game_state) {
		case "title":
			update_title (elapsed);
			break;
		
		case "map":
			update_input ();
			update_ai (elapsed);
			update_city_stats ();
			update_gui (elapsed);
			//
			// make tics in simulation
			//
			while (tic_step_accum_s > tic_step_size) {
				g.nextTurn();
				
				// TODO vis update colours here too?
				if(vis) {
					vis.upateColors();
				}
				
				tic_step_accum_s -= tic_step_size;
			}
			break;
			
		case "foot":
			update_foot (elapsed);
			break;
			
		default:
	}
}

function main_loop () {
	// update timers
	var current_millis = (new Date).getTime ();
	var elapsed_millis = current_millis - previous_millis;
	previous_millis = current_millis;
	var elapsed_s = elapsed_millis / 1000.0;
	time_step_accum_s += elapsed_s;
	// drawing
	draw_frame ();
	// logic updates
	while (time_step_accum_s >= time_step_size_s) {
		update (time_step_size_s);
		time_step_accum_s -= time_step_size_s;
	}

	window.requestAnimFrame (main_loop, canvas);
}

//
// programme entry point
//
function main () {
	// start context, start loading assets
	if (!init ()) {
		return;
	}
	// animate and do logic
	previous_millis = (new Date).getTime ();
	main_loop ();
}
//
//
function get_string_from_URL (url) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open ("GET", url, false);
	xmlhttp.send ();
	return xmlhttp.responseText;
}
