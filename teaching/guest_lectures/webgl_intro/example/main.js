var gl = undefined; // webgl context
var shader_programme_idx = undefined; // shader programme
var vertex_buffer_idx = undefined; // vertex buffer holding a triangle shape

// start programme here
function main () {
  initialise (); // initialise
  render (); // draw geometry
}

// load all data and set up buffers for rendering
function initialise () {
  var canvas = document.getElementById ("gl_canvas"); // get canvas using DOM
  gl = WebGLUtils.setupWebGL (canvas); // hook up WebGL to the canvas
  gl.clearColor (0.5, 0.2, 0.0, 1.0); // make background red when cleared
  shader_programme_idx = load_shaders (vertex_shader_string, fragment_shader_string); // prepare a shader programme
  vertex_buffer_idx = init_geometry (points_array); // prepare a triangle of points as a vertex buffer
}

var vertex_shader_string = "\
attribute vec3 vp;\
void main () {\
  gl_Position = vec4 (vp, 1.0);\
}";

var fragment_shader_string = "\
precision mediump float;\
void main () {\
  gl_FragColor = vec4 (0.0, 0.0, 1.0, 1.0);\
}";

// load some default shaders
function load_shaders (vertex_shader_code, fragment_shader_code) {
  // create empty shaders in WebGL, and get an index to each
  var vertex_shader_idx = gl.createShader (gl.VERTEX_SHADER);
  var fragment_shader_idx = gl.createShader (gl.FRAGMENT_SHADER);
  // copy shader source code from JavaScript strings into shaders in WebGL
  gl.shaderSource (vertex_shader_idx, vertex_shader_code);
  gl.shaderSource (fragment_shader_idx, fragment_shader_code);
  gl.compileShader (vertex_shader_idx); // compile shader code in WebGL
  gl.compileShader (fragment_shader_idx); // compile shader code in WebGL
  var sp_idx = gl.createProgram (); // create 2-stage shader programme
  gl.attachShader (sp_idx, vertex_shader_idx); // attach compiled shader to program
  gl.attachShader (sp_idx, fragment_shader_idx); // attach compiled shader to program
  gl.linkProgram (sp_idx); // link shader programme
  return sp_idx;
}

// create 3 xyz points in one long array; xyzxyzxyz
var points_array = [
  -0.5, -0.5,  0.0,
   0.0,  0.5,  0.0,
   0.5, -0.5,  0.0
];

// create some default geometry
function init_geometry (array) {
  var vb_idx = gl.createBuffer (); // create an emtpy buffer in WebGL
  gl.bindBuffer (gl.ARRAY_BUFFER, vb_idx); // "bind" buffer in GL state machine
  // copy the array of points into the buffer with WebGL (onto the video card)
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (array), gl.STATIC_DRAW);
  return vb_idx;
}

// draw with shaders and vertex buffers
function render () {
  gl.clear (gl.COLOR_BUFFER_BIT); // wipe canvas to background colour
  switch_to_shader (shader_programme_idx); // use our shader programme
  draw_buffer (vertex_buffer_idx, 3); // draw the 3 points for the triangle
}

// switch a shader into use
function switch_to_shader (sp_idx) {
  gl.useProgram (sp_idx); // "use" shader for drawing all subsequent geometry
  gl.enableVertexAttribArray (0); // the vertex shader has one attribute variable. enable it
}

// draw a vertex buffer
function draw_buffer (vb_idx, number_of_points) {
  gl.bindBuffer (gl.ARRAY_BUFFER, vb_idx); // switch to this vertex buffer
  gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 0); // use its data for zeroth shader attribute
  gl.drawArrays (gl.TRIANGLES, 0, number_of_points); // draw the geometry
}
