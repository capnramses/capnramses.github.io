function apg_gfx_start(canvas_id) {
  var canvas = document.getElementById(canvas_id);
  if (!canvas) {
    console.error("ERROR: couldn't find canvas with id `" + canvas_id + "`");
    return;
  }
  var gl = canvas.getContext("webgl2"); // options here https://www.khronos.org/files/webgl20-reference-guide.pdf
  if (!gl) {
    console.error("ERROR: couldn't start webGL 2.0 context.");
    return;
  }
  console.log("apg webgl 2.0 context created");
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
