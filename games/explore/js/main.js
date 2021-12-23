// Explore Game - copyright Anton Gerdelan
// Main file - JavaScript

var previous_millis;
function main_loop() {
    // update timers
    var current_millis = performance.now();
    var elapsed_millis = current_millis - previous_millis;
    previous_millis = current_millis;
    var elapsed_s = elapsed_millis / 1000.0;
    //document.getElementById("fpstextid").innerHTML = 1.0 / elapsed_s; 

    // draw
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /*gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.useProgram(sp);
    if (cam_dirty) {
        gl.uniformMatrix4fv(heckler_PV_loc, gl.FALSE, new Float32Array(PV));
        cam_dirty = false;
    }
    var R = rotate_y_deg(identity_mat4(), current_millis * 0.075);
    gl.uniformMatrix4fv(heckler_M_loc, gl.FALSE, new Float32Array(R));
    vao_ext.bindVertexArrayOES(heckler_vao);
    gl.drawArrays(gl.TRIANGLES, 0, heckler_vao.pc);
*/
    // "automatically re-call this function please"
    window.requestAnimFrame(main_loop, canvas);
}

function main() {
    console.log("Explore Game by Anton Gerdelan");
    init_gl();

    previous_millis = performance.now();
    main_loop();
}