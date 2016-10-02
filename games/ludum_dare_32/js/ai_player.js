var ai_pts = 100;
var point_time_accum = 0.0;
var ai_city_indices = [];
var player_city_indices = [];

function update_ai (elapsed) {
	point_time_accum += elapsed;
	if (point_time_accum > 5.0) {
		ai_pts += 100;
		point_time_accum -= 5.0;
	}
	
	if (ai_pts > 100) {
		ai_pts -= 100;
		var choice = Math.floor (Math.random () * 2);
		
		if (choice < 1) {
			var rand_city = Math.floor (Math.random () * player_city_indices.length);
			var city_index = player_city_indices[rand_city];
			var city_name = city_names[city_index];
			
			if (!g.deployComedian ("Evil Comedian", city_name, 1.0, "stand-up")) {
				// erase from list
				player_city_indices = player_city_indices.splice (rand_city, 1);
				return; // try again next update
			}
			var sound = new Howl ({urls: ['audio/enemy_agent.wav']}).play();
			add_comedian_to_city (0, city_index);
		} else {
			var rand_city = Math.floor (Math.random () * ai_city_indices.length);
			var city_index = ai_city_indices[rand_city];
			var city_name = city_names[city_index];
			
			if (!g.deployHeckler ("Evil Heckler", city_name)) {
				// erase from list
				ai_city_indices = ai_city_indices.splice (rand_city, 1);
				return; // try again next update
			}
			var sound = new Howl ({urls: ['audio/enemy_agent.wav']}).play();
			add_heckler_to_city (0, city_index);
		}
	}
}
