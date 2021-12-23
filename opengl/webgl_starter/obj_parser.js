//
// Wavefront .obj parser for WebGL
// Anton Gerdelan 23 Dec 2014
// 18 May 2015: upgraded to asynch and VAO
// antongerdelan.net
//

//
// could alternatively do one single, interleaved VBO here
function start_loading_obj (url) {
	// first create an empty VAO using the extension's interface object
	var vao = vao_ext.createVertexArrayOES ();
	// inject an is_loaded boolean
	vao.is_loaded = false;
	// inject point count into VAO (yeah...)
	vao.pc = 0;
	
	console.log ("starting obj download: " + url);
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open ("GET", url, true);
	xmlhttp.onload = function (e) {
		var str = xmlhttp.responseText;
		var lines = str.split ('\n');

		var unsorted_vp = new Array ();
		var unsorted_vt = new Array ();
		var unsorted_vn = new Array ();
		var sorted_vp = new Array ();
		var sorted_vt = new Array ();
		var sorted_vn = new Array ();
		
		// i put the mesh into 3 vertex buffers without indexing or padding
		// you may prefer an indexed or single-buffer set-up
		// i assume mesh is triangulated
		for (var i = 0; i < lines.length; i++) {
			var line_tokens = lines[i].split (' ');
			if (lines[i][0] == 'v' && lines[i][1] == ' ') {
				unsorted_vp.push (parseFloat (line_tokens[1]));
				unsorted_vp.push (parseFloat (line_tokens[2]));
				unsorted_vp.push (parseFloat (line_tokens[3]));
			} else if (lines[i][0] == 'v' && lines[i][1] == 't') {
				unsorted_vt.push (parseFloat (line_tokens[1]));
				unsorted_vt.push (parseFloat (line_tokens[2]));
			} else if (lines[i][0] == 'v' && lines[i][1] == 'n') {
				unsorted_vn.push (parseFloat (line_tokens[1]));
				unsorted_vn.push (parseFloat (line_tokens[2]));
				unsorted_vn.push (parseFloat (line_tokens[3]));
			} else if (lines[i][0] == 'f' && lines[i][1] == ' ') {
				var p0 = line_tokens[1].split ('/');
				var p1 = line_tokens[2].split ('/');
				var p2 = line_tokens[3].split ('/');
				var vp0_i = 3 * (parseInt (p0[0]) - 1);
				var vp1_i = 3 * (parseInt (p1[0]) - 1);
				var vp2_i = 3 * (parseInt (p2[0]) - 1);
				sorted_vp.push (unsorted_vp[vp0_i]);
				sorted_vp.push (unsorted_vp[vp0_i + 1]);
				sorted_vp.push (unsorted_vp[vp0_i + 2]);
				sorted_vp.push (unsorted_vp[vp1_i]);
				sorted_vp.push (unsorted_vp[vp1_i + 1]);
				sorted_vp.push (unsorted_vp[vp1_i + 2]);
				sorted_vp.push (unsorted_vp[vp2_i]);
				sorted_vp.push (unsorted_vp[vp2_i + 1]);
				sorted_vp.push (unsorted_vp[vp2_i + 2]);
				var vt0_i = 2 * (parseInt (p0[1]) - 1);
				var vt1_i = 2 * (parseInt (p1[1]) - 1);
				var vt2_i = 2 * (parseInt (p2[1]) - 1);
				sorted_vt.push (unsorted_vt[vt0_i]);
				sorted_vt.push (unsorted_vt[vt0_i + 1]);
				sorted_vt.push (unsorted_vt[vt1_i]);
				sorted_vt.push (unsorted_vt[vt1_i + 1]);
				sorted_vt.push (unsorted_vt[vt2_i]);
				sorted_vt.push (unsorted_vt[vt2_i + 1]);
				var vn0_i = 3 * (parseInt (p0[2]) - 1);
				var vn1_i = 3 * (parseInt (p1[2]) - 1);
				var vn2_i = 3 * (parseInt (p2[2]) - 1);
				sorted_vn.push (unsorted_vn[vn0_i]);
				sorted_vn.push (unsorted_vn[vn0_i + 1]);
				sorted_vn.push (unsorted_vn[vn0_i + 2]);
				sorted_vn.push (unsorted_vn[vn1_i]);
				sorted_vn.push (unsorted_vn[vn1_i + 1]);
				sorted_vn.push (unsorted_vn[vn1_i + 2]);
				sorted_vn.push (unsorted_vn[vn2_i]);
				sorted_vn.push (unsorted_vn[vn2_i + 1]);
				sorted_vn.push (unsorted_vn[vn2_i + 2]);
			} 
		}

		// copy data into buffers and set up VAO attribute pointers, enable attribs
		vao_ext.bindVertexArrayOES (heckler_vao);

		var vbo_vp = gl.createBuffer ();
		gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vp);
		gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (sorted_vp),
			gl.STATIC_DRAW);
		gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray (0);
		var vbo_vt = gl.createBuffer ();
		gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vt);
		gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (sorted_vt),
			gl.STATIC_DRAW);
		gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray (1);
		var vbo_vn = gl.createBuffer ();
		gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vn);
		gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (sorted_vn),
			gl.STATIC_DRAW);
		gl.vertexAttribPointer (2, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray (2);
		
		// store loaded state and point count in VAO
		vao.pc = sorted_vp.length / 3;
		vao.is_loaded = true;
		console.log ("loaded " + url + "point count: " + vao.pc);
	}
	xmlhttp.send ();
	// return the VAO, even if it's still empty
	return vao;
}
