//
// apg_glsl: experimental GLSL parser supporting #include
// https://github.com/capnramses/apg_glsl
// First version 8 April 2015, by Anton Gerdelan
//

var shader_progs = [];

//
// pull text out of shader script block
//
function extract_shader_str (id) {
	var el = document.getElementById (id);
	var str = "";
	var n = el.firstChild;
	while (n) {
		if (3 == n.nodeType) {
			str += n.textContent;
		}
		n = n.nextSibling;
	}
	return str;
}

//
// parse GLSL stored in a string
//
function parse_glsl (str) {
	// the final shader str
	var final_str = "";

	// split str into lines
	var lines = str.split ("\n");
	
	// NOTE WARNING:
	// i ignore the first and last line because <script>here would be number 0
	for (var i = 1; i < lines.length - 1; i++) {
		// remove leading/ending whitespace
		var line = lines[i].trim ();
		if ('#' == line[0]) {
			console.log ("pre-processor directive found on line " + i);
			var tokens = line.match (/\w+|"[^"]+"/g);
			switch (tokens[0]) {
				case "include":
					var id = tokens[1].replace(/['"]+/g, '');
					console.log ("#include shader: " + id);
					var snippet_str = extract_shader_str (id);
					// recurse in case of includes IN the snippet
					var final_snippet_str = parse_glsl (snippet_str);
					// note: already has a '\n' at end
					final_str += final_snippet_str;
					break;
				default:
				 // assume it wasn't for us, and leave in
				 final_str += (lines[i] + '\n');
			} // endswitch
		} else {
			final_str += (lines[i] + '\n');
		} // endif
	} // endfor
	// return new, expanded string
	return final_str;
}

function extract_shader (str, type) {
	var final_str = "";
	var lines = str.split ("\n");
	var found_type_tag = false;
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim ();
		if ('#' == line[0]) {
			var tokens = line.match (/\w+|"[^"]+"/g);
			console.log (tokens[0]);
			switch (tokens[0]) {
				case "vert":
					if (type == "vert") {
						found_type_tag = true;
					} else {
						// end of section found. if we were in OUR section already, quit
						if (found_type_tag) {
							return final_str;
						}
					}
					break;
				case "frag":
					if (type == "frag") {
						found_type_tag = true;
					} else {
						// end of section found. if we were in OUR section already, quit
						if (found_type_tag) {
							return final_str;
						}
					}
					break;
				default:
					// assume it wasn't for us, and leave in
					final_str += (lines[i] + '\n');
			} // endswitch
		} else {
			if (found_type_tag) {
				final_str += (lines[i] + '\n');
			}
		}// endif
	} // endfor
	return final_str;
}

function load_shaders_from_strings (vs_str, fs_str) {
	var vs = gl.createShader (gl.VERTEX_SHADER);
	var fs = gl.createShader (gl.FRAGMENT_SHADER);
	gl.shaderSource (vs, vs_str);
	gl.shaderSource (fs, fs_str);
	gl.compileShader (vs);
	if (!gl.getShaderParameter (vs, gl.COMPILE_STATUS)) {
		console.error ("ERROR compiling vert shader. log: " +
			gl.getShaderInfoLog (vs));
		return null;
	}
	gl.compileShader (fs);
	if (!gl.getShaderParameter (fs, gl.COMPILE_STATUS)) {
		console.error ("ERROR compiling frag shader. log: " +
			gl.getShaderInfoLog (fs));
		return null;
	}
	var sp = gl.createProgram ();
	gl.attachShader (sp, vs);
	gl.attachShader (sp, fs);
	//
	// TODO this should be after binding stuff??
	// or fetch common names later?
	gl.linkProgram (sp);
	if (!gl.getProgramParameter (sp, gl.LINK_STATUS)) {
		console.error ("ERROR linking program. log: " + gl.getProgramInfoLog (sp));
		return null;
	}
	gl.validateProgram (sp);
	if (!gl.getProgramParameter(sp, gl.VALIDATE_STATUS)) {
		console.error ("ERROR validating program. log: " +
			gl.getProgramInfoLog (sp));
		return null;
	}
	return sp;
}

//
// main 'start getting all the shaders in this list' function
//
function load_shaders (shader_prog_srcs) {
	for (var i = 0; i < shader_prog_srcs.length; i++) {
		var str = extract_shader_str (shader_prog_srcs[i]);
		var final_str = parse_glsl (str);
		//alert (final_str);
		var v_s = extract_shader (final_str, "vert");
		var f_s = extract_shader (final_str, "frag");
		shader_progs[i] = load_shaders_from_strings (v_s, f_s);
		if (!shader_progs[i]) {
			return false;
		}
	}
	return true;
}
