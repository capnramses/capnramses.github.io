var gl = undefined; // webgl context
var gl_canvas_width = document.getElementById ("gl_canvas").width;
var gl_canvas_height = document.getElementById ("gl_canvas").height;

// start programme here
function main () {
  initialise (); // initialise
  render (); // draw geometry
}

// load all data and set up buffers for rendering
function initialise () {
  var canvas = document.getElementById ("gl_canvas"); // get canvas using DOM
  gl = WebGLUtils.setupWebGL (canvas); // hook up WebGL to the canvas
  gl.clearColor (0.0, 0.0, 0.5, 1.0); // make background red when cleared
  
  // load fonts
  load_font_shaders ();
  var font_index = load_font ("doom.png", "doom.json");
  
  // create text
  var text_index = create_text ("HELLO WORLD\nA CHAINSAW. FIND SOME MEAT!", font_index, 0.0, 0.01, 0.025, [1.0, 0.0, 0.0]);
  var text_indexb = create_text ("ROOM001", font_index, 0.2, 0.2, 0.025, [0.8, 0.8, 1.0]);
  var text_indexc = create_text ("MOONBASE", font_index, 0.5, 0.5, 0.025, [1.0, 1.0, 0.0]);
  var text_indexd = create_text ("some text", font_index, 0.02, 0.95, 0.025, [0.0, 1.0, 0.0]);
  
  // set up event function for that textarea
  var ta = document.getElementById ("textarea");
  ta.onkeyup = function () {
  	change_text (text_indexd, ta.value);
  }
}

 // draw with shaders and vertex buffers
function render () {
	gl.clear (gl.COLOR_BUFFER_BIT); // wipe canvas to background colour
	render_text ();
	
	var canvas = document.getElementById ("gl_canvas"); // get canvas using DOM
  window.requestAnimFrame(render, canvas);
}

