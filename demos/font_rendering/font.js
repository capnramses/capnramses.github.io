/* TODO

1. load shaders from file
2. store fonts in array of push_backs
3. store text info in array of push_backs
4. count instances of text
5. use 3 and 4 in rendering
6. create geometry with texcoords function, store vbo in text array
*/

var g_atlas_cols = 16;
var g_font_shader_programme_idx; // shader programme
var g_font_shader_size_loc;
var g_font_shader_colour_loc;
var g_font_meta_array = new Array ();
var g_text_array = new Array ();

var font_vertex_shader_string = "\
attribute vec3 vp;\
attribute vec2 vt;\
uniform float point_size;\
varying vec2 st;\
void main () {\
	gl_PointSize = point_size;\
	st = vt; \
  gl_Position = vec4 (vp, 1.0);\
}";

var font_fragment_shader_string = "\
precision mediump float;\
varying vec2 st;\
uniform sampler2D tex;\
uniform vec3 colour;\
void main () {\
	vec2 texcoords = vec2 (gl_PointCoord.s * 0.0625 + st.s, 1.0 - gl_PointCoord.t * 0.0625 - st.t);\
  gl_FragColor = texture2D (tex, texcoords);\
	gl_FragColor.rgb *= colour;\
}";

/*! this function loads the shaders used for font rendering */
function load_font_shaders () {
  // create empty shaders in WebGL, and get an index to each
  var vertex_shader_idx = gl.createShader (gl.VERTEX_SHADER);
  var fragment_shader_idx = gl.createShader (gl.FRAGMENT_SHADER);
  
  // copy shader source code from JavaScript strings into shaders in WebGL
  gl.shaderSource (vertex_shader_idx, font_vertex_shader_string);
  gl.shaderSource (fragment_shader_idx, font_fragment_shader_string);
  gl.compileShader (vertex_shader_idx); // compile shader code in WebGL
  gl.compileShader (fragment_shader_idx); // compile shader code in WebGL
  g_font_shader_programme_idx = gl.createProgram (); // create 2-stage shader programme
  gl.attachShader (g_font_shader_programme_idx, vertex_shader_idx); // attach compiled shader to program
  gl.attachShader (g_font_shader_programme_idx, fragment_shader_idx); // attach compiled shader to program
  gl.linkProgram (g_font_shader_programme_idx); // link shader programme
  
  // get uniform for pixel size
  g_font_shader_size_loc = gl.getUniformLocation (g_font_shader_programme_idx, "point_size");
  g_font_shader_colour_loc = gl.getUniformLocation (g_font_shader_programme_idx, "colour");
}

/*!	@return json containing glyphs data
		@param url URL of meta-data JSON file */
function load_font_meta (url) {
	console.log ("loading font meta " + url + "\n");
	// JSON file for meta-data
	var json = null;
	var xmlhttp = new XMLHttpRequest ();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			json = eval ("(" + xmlhttp.responseText + ")");
		}
	}
	xmlhttp.open("GET", url, false);
	xmlhttp.send(null);
	console.log ("space glyph width. index 0. ascii code: " + json.glyphs[0].ascii_code + " width: " + json.glyphs[1].width_prop);
	return json;
}

/*! @return GL index to loaded texture
		@param url URL of image to load texture from */
function load_font_texture (url) {
	console.log ("loading font texture " + url + "\n");
	// create gl texture index
	var t_index = gl.createTexture ();
	// create javascript image
	var image = new Image ();
	// tell JS how to load image
	image.onload = function () {
		// bind gl texture index
		gl.bindTexture (gl.TEXTURE_2D, t_index);
		// tell image to load upside-down
		gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
		// copy data from JS image into the bound GL texture
		gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // bi-linear filtering
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // tri-linear filtering
	}
	// load image
	image.src = url;
	return t_index;
}


/*! @remarks this function loads a font atlas (image with all the letters) and a
meta-data file, and stores this information in an array of "Font" objects.
@return when loaded, an index to the loaded font is returned from this function
@param atlas_url font atlas to load (image with all the letters)
@param meta_data_url JSON file containing width and position offsets required for each letter */
function load_font (atlas_url, meta_data_url) {
	// load meta
	var font_json = load_font_meta (meta_data_url);
	// load image as texture
	var texture_index = load_font_texture (atlas_url);
	// push back font meta and texture ID onto global font array
	var index = g_font_meta_array.length;
	g_font_meta_array[index] = font_json;
	g_font_meta_array[index].texture_index = texture_index;
	return index;
}

/*! @remarks this function creates a string of text and put it on the screen
@return an index to the created text, so that it can be altered later
@param text a string. line breaks with '\n' are respected
@param font_index index of a loaded font to use, as returned by load_font ()
@param x_min 0.0-1.0 left-right proportion of screen to use as left margin
@param y_min 0.0-1.0 top-bottom proportion of screen to use as top margin
@param scale 0.0-1.0 proportion of screen width as maximum size of glyphs i.e. 0.1 allows 10 columns of characters
@param colour a 3d array representing the RGB (red, blue, green) colour components; each in the range 0-1 */
function create_text (text, font_index, x_min, y_min, scale, colour) {
	// create vertex buffers and vertex arrays
	var point_vbo_index = gl.createBuffer (); // create an emtpy buffer in WebGL
	var texcoord_vbo_index = gl.createBuffer (); // create an emtpy buffer in WebGL

	// put in array
	var text_index = g_text_array.length;
	g_text_array[text_index] = new Object;
	g_text_array[text_index].font_index = font_index;
	g_text_array[text_index].x_min = x_min;
	g_text_array[text_index].y_min = y_min;
	g_text_array[text_index].scale = scale;
	g_text_array[text_index].colour = colour;
	g_text_array[text_index].texture_id = g_font_meta_array[font_index].texture_index;
	g_text_array[text_index].point_vbo_index = point_vbo_index;
	g_text_array[text_index].texcoord_vbo_index = texcoord_vbo_index;

	change_text (text_index, text);
	
	return text_index;
}

/*! @remarks modify the string of an existing on-screen text
@param text_index index of text, as returned by create_text()
@param text the new string */
function change_text (text_index, text) {
	// look up needed meta-data
	var font_index = g_text_array[text_index].font_index;
	var x_min = g_text_array[text_index].x_min;
	var y_min = g_text_array[text_index].y_min;
	var scale = g_text_array[text_index].scale;
	var point_vbo_index = g_text_array[text_index].point_vbo_index;
	var texcoord_vbo_index = g_text_array[text_index].texcoord_vbo_index;

	// Get size or length of string.
	var length = text.length;
	var number_of_points = length;
	console.log ("changing text of " + text_index + " to " + text);
	
	// 'cursor' position
	var current_x_pos = g_text_array[text_index].x_min + scale * 0.5;
	var current_y_pos = -g_text_array[text_index].y_min;
	
	// temporary buffers
	var points = new Array ();
	var texcoords = new Array ();
	var point_index = 0; // this increments by 2 per character in string, not by 1
	var texcoord_index = 0;
	
	// for each element in the string
	for (var i = 0; i < length; i++) {
		// get ascii code as integer
    var ascii_code = text.charCodeAt (i);
    
    // if \n found then just drop to new row
    if ("\n".charCodeAt (0) == ascii_code) {
    	number_of_points--;
    	current_y_pos -= scale;
    	current_x_pos = x_min + scale * 0.5;
    	continue;
    }
    
    // work out row and column in atlas
    var atlas_col = (ascii_code - ' '.charCodeAt (0)) % g_atlas_cols;
    var atlas_row = Math.floor ((ascii_code - ' '.charCodeAt (0)) / g_atlas_cols); // truncate to integer
    
    // work out texture coordinates in atlas
    var s = atlas_col * 0.0625;
    var t = atlas_row * 0.0625;
    
  	// get glyph data from font meta
  	var glyph_y_offset = g_font_meta_array[font_index].glyphs[ascii_code - 32].y_offset;
  	var glyph_width = g_font_meta_array[font_index].glyphs[ascii_code - 32].width_prop * scale;
    var glyph_height = g_font_meta_array[font_index].glyphs[ascii_code - 32].height_prop;
    var glyph_y_pos = (glyph_height - 0.5 + glyph_y_offset) * scale;
    
    // work out position of glyph
    var x_pos = current_x_pos;
    var y_pos = current_y_pos + glyph_y_pos;//+ glyph_y_offset;
    current_x_pos += glyph_width;

    //add point and texture coordinates to buffers
    points[point_index++] = x_pos * 2.0 - 1.0;
    points[point_index++] = y_pos * 2.0 + 1.0;
    texcoords[texcoord_index++] = s;
    texcoords[texcoord_index++] = t;
	}
	
	gl.bindBuffer (gl.ARRAY_BUFFER, point_vbo_index); // "bind" buffer in GL state machine
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (points), gl.STATIC_DRAW);
	gl.bindBuffer (gl.ARRAY_BUFFER, texcoord_vbo_index); // "bind" buffer in GL state machine
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (texcoords), gl.STATIC_DRAW);
	
	g_text_array[text_index].point_count = number_of_points;
}

/*! @remarks this function draws all active on-screen text */
function render_text () {
	// use shader
	gl.useProgram (g_font_shader_programme_idx);
	
	// enable transparency
	gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // 1 minus alpha is what we want
	gl.enable (gl.BLEND); // enable transp
	
	// enable vertex arrays for shader
	gl.enableVertexAttribArray (0); // points
	gl.enableVertexAttribArray (1); // texture coordinates
	
	// enable correct font texture
	gl.activeTexture (gl.TEXTURE0);
	
	// loop through active texts
	var text_count = g_text_array.length;
	for (var i = 0; i < text_count; i++) {
		// use our texture as active texture 0
		gl.bindTexture (gl.TEXTURE_2D, g_text_array[i].texture_id); // get from text meta
		// scale points
		gl.uniform1f (g_font_shader_size_loc, gl_canvas_width * g_text_array[i].scale);
		gl.uniform3f (g_font_shader_colour_loc, g_text_array[i].colour[0], g_text_array[i].colour[1], g_text_array[i].colour[2]);
		
		// set up arrays TODO get from text meta
		gl.bindBuffer (gl.ARRAY_BUFFER, g_text_array[i].point_vbo_index); // switch to this vertex buffer
		gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 0, 0); // use its data for zeroth shader attribute
		gl.bindBuffer (gl.ARRAY_BUFFER, g_text_array[i].texcoord_vbo_index); // switch to this vertex buffer
		gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 0); // use its data for zeroth shader attribute
		gl.drawArrays (gl.POINTS, 0, g_text_array[i].point_count); // draw the geometry
	}
  // disable vertex arrays for other shaders that don't use them
  gl.disableVertexAttribArray (1); // texture coordinates
}
