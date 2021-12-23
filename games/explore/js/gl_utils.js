// Explore Game - copyright Anton Gerdelan
// WebGL Utils - JavaScript

var canvas, gl;

function init_gl() {
    canvas = document.getElementById("canvasid");
    gl = canvas.getContext("webgl");

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // set some GL states that I want to use for rendering
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var vao_ext = gl.getExtension("OES_vertex_array_object");
    if (!vao_ext) {
        console.error("ERROR: Your browser does not support WebGL VAO extension");
    }
}

// TODO -- load texture
// TODO -- load mesh
// TODO -- load shaders

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();