var gl = undefined;
var gCam = undefined;
var gFrameBuffer = undefined; // 2nd frame buffer for off-screen rendering
var gDrawIntermediate = false;
var gBlandShader = undefined;
var gFullShader = undefined;
var gDoor = undefined;
var gColourUniLoc = undefined;
var gMultiplyUniLoc = undefined;
var gTexMapUniLoc = undefined;
var gSelected = -1;

// entry point
function main () {
	toterm ("starting main...\n");
	if (!init ()) {
		toterm ("ERROR: failed to init\n");
		return false;
	}
	toterm ("starting main loop...\n");
	if (!main_loop ()) {
		printf ("ERROR: main loop fail\n");
	}
	toterm ("main done\n");
	return true;
}

// print out to a text area on the web page that works like a console
function toterm (string) {
	document.getElementById ("glterm").innerHTML = document.getElementById ("glterm").innerHTML + string;
}

// load everything
function init () {
	toterm ("starting init...\n");
	var canvas = document.getElementById ("glcanvas");
	var debugging = true;
	var logging = false;
	gl = initGL (canvas, debugging, logging);
	if (!gl) {
		toterm ("ERROR: failed to start gl\n");
		return false;
	}
	toterm ("setting callbacks...\n");
	set_callbacks ();
	toterm ("creating camera...\n");
	gCam = new Camera (45, 256 / 256, 0.1, 100, [0, 2, 5], [0, 1.5, 0]);
	toterm ("camera created\n");
	
	toterm ("loading shaders...\n");
	if (!loadShaders ()) {
		toterm ("ERROR: loading shaders\n");
		return false;
	}
	toterm ("loading objects...\n");
	if (!loadObjects ()) {
		toterm ("ERROR: loading objects\n");
		return false;
	}
	// set up 2nd frame buffer
	create_frame_buffer ();
	gl.clearColor (0.2, 0.2, 0.4, 1.0);
	// enable some modes
	gl.enable (gl.DEPTH_TEST);
	toterm ("init done\n");
	return true;
}

// set up event-driven callbacks
function set_callbacks () {
	var canvas = document.getElementById ("glcanvas");
	canvas.onmouseup = function (ev) {
		// recursively get location within parent(s)
		var element = canvas;
		var top = 0;
		var left = 0;
		while (element && element.tagName != 'BODY') {
			top += element.offsetTop;
			left += element.offsetLeft;
			element = element.offsetParent;
		}
		// adjust for scrolling
		left += window.pageXOffset;
		top -= window.pageYOffset;
		var x = ev.clientX - left;
		var y = (ev.clientY - top);
		// sometimes range is a few pixels too big
		if (x >= gl.viewportWidth) {
			return;
		}
		if (y >= gl.viewportHeight) {
			return;
		}
		toterm ("mouse click " + x + " " + y + "\n");
		picker (x, y);
	}
}

function loadShaders () {
	gBlandShader = new ShaderProgramme ();
	if (!gBlandShader.loadVertexShaderFromURL ("bland_vs.glsl", false)) {
		toterm ("ERROR: loading bland_vs.glsl\n");
		return false;
	}
	if (!gBlandShader.loadFragmentShaderFromURL ("bland_fs.glsl", false)) {
		toterm ("ERROR: loading bland_fs.glsl\n");
		return false;
	}
	if (!gBlandShader.link ()) {
		toterm ("ERROR: linking bland shader\n");
		return false;
	}
	gBlandShader.mHasVPAttrib = true;
	gBlandShader.mVPAttribLoc = gBlandShader.getAttributeLocation ("vp_loc");
	gBlandShader.mHasVTAttrib = false;
	gBlandShader.mHasVNAttrib = false;
	gBlandShader.use ();
	gBlandShader.setUniformMat4ByName ("proj_mat", gCam.mProjMat);
	gBlandShader.setUniformMat4ByName ("view_mat", gCam.mViewMat);
	var modelMat = mat4.create ();
	modelMat = mat4.identity ();
	gBlandShader.setUniformMat4ByName ("model_mat", modelMat);
	gColourUniLoc = gBlandShader.getUniformLocation ("colour");
	var colour = vec4.createFrom (1, 0, 0, 1);
	gBlandShader.setUniformFloat4ByLocation (gColourUniLoc, colour);
	
	gFullShader = new ShaderProgramme ();
	if (!gFullShader.loadVertexShaderFromURL ("full_vs.glsl", false)) {
		toterm ("ERROR: loading full_vs.glsl\n");
		return false;
	}
	if (!gFullShader.loadFragmentShaderFromURL ("full_fs.glsl", false)) {
		toterm ("ERROR: loading full_fs.glsl\n");
		return false;
	}
	if (!gFullShader.link ()) {
		toterm ("ERROR: linking full shader\n");
		return false;
	}
	gFullShader.mHasVPAttrib = true;
	gFullShader.mVPAttribLoc = gFullShader.getAttributeLocation ("vp_loc");
	gFullShader.mHasVTAttrib = true;
	gFullShader.mVTAttribLoc = gFullShader.getAttributeLocation ("vt");
	gFullShader.mHasVNAttrib = false;
	gFullShader.mHasDiffuseMapUniform = true;
	gFullShader.use ();
	gFullShader.setUniformMat4ByName ("proj_mat", gCam.mProjMat);
	gFullShader.setUniformMat4ByName ("view_mat", gCam.mViewMat);
	gFullShader.setUniformMat4ByName ("model_mat", modelMat);
	gMultiplyUniLoc = gFullShader.getUniformLocation ("multiply");
	var colour = vec4.createFrom (1, 1, 1, 1);
	gFullShader.setUniformFloat4ByLocation (gMultiplyUniLoc, colour);
	
	return true;
}

function loadObjects () {
	gDoor = new Renderable ();
	gDoor.loadMeshFromJSON ("dungeondoor.json");
	var doorTextureIdx = gl.createTexture();
	var image = new Image();
	image.onload = function () {
		gl.bindTexture (gl.TEXTURE_2D, doorTextureIdx);
		gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // bi-linear filtering
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // bi-linear filtering
	}
	image.src = "door.png";
	document.getElementById ("debugBuffer").src = image.src;
	
	// also bind texture (hopefully this is not too soon)
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, doorTextureIdx);
	gTexMapUniLoc = gFullShader.getUniformLocation ("tex");
	gFullShader.setUniformIntByLocation (gTexMapUniLoc, 0);
	gDoor.mDiffuseMapIdx = doorTextureIdx;
	return true;
}

// build a texture to store the intermediate buffer
function create_colour_buffer () {
	toterm ("creating colour buffer...\n");
	var colourBuffer = gl.createTexture ();
	gl.bindTexture (gl.TEXTURE_2D, colourBuffer);
	// null (last param) means load no data in yet. it still allocates space though. 
	gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.viewportWidth, gl.viewportHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	return colourBuffer;
}

// build a render buffer to store depth buffer
function create_render_buffer () {
	toterm ("creating render buffer...\n");
	var renderBuffer = gl.createRenderbuffer ();
	gl.bindRenderbuffer (gl.RENDERBUFFER, renderBuffer);
	// same dimensions as colour buffer
	gl.renderbufferStorage (gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.viewportWidth, gl.viewportHeight);
	return renderBuffer;
}

// build 2nd frame buffer
function create_frame_buffer () {
	toterm ("creating frame buffer...\n");
	var colourBuffer = create_colour_buffer ();
	var renderBuffer = create_render_buffer ();
	gFrameBuffer = gl.createFramebuffer ();
	gl.bindFramebuffer (gl.FRAMEBUFFER, gFrameBuffer);
	// attach texture
	gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colourBuffer, 0);
	// attach depth buffer
	gl.framebufferRenderbuffer (gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.bindTexture (gl.TEXTURE_2D, null); // unbind to avoid read-write feedback horror
	gl.bindRenderbuffer (gl.RENDERBUFFER, null); // unbind to avoid read-write feedback horror
	gl.bindFramebuffer (gl.FRAMEBUFFER, null); // unbind to render back to default buffer
	toterm ("frame buffer created\n");
}

// simulation steps and drawing
function main_loop () {
	if (!draw ()) {
		toterm ("ERROR: drawing\n");
		return false;
	}
	window.requestAnimFrame (main_loop); // this function is from webgl-utils
	return true;
}

// draw scene once
function draw () {
	// off-screen
	gl.bindFramebuffer (gl.FRAMEBUFFER, gFrameBuffer);
	gl.viewport (0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// enable boring shader and simple attributes
	gBlandShader.startRendering ();
	
	// draw each object
	drawDoors (gBlandShader, true);
	
	// on-screen
	gl.bindFramebuffer (gl.FRAMEBUFFER, null);
	gl.viewport (0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// allow a debug mode where we draw the intermediate buffer to the screen
	if (!gDrawIntermediate) {
		// disable bland shader
		gBlandShader.stopRendering ();
		// enable normal shader all attributes	
		gFullShader.startRendering ();
		
		// draw each
		drawDoors (gFullShader, false);
		gFullShader.stopRendering ();
	} else {
		drawDoors (gBlandShader, true);
	}
	return true;
}

function drawDoors (shader, chooseColours) {
	var modelmat = mat4.create ();
	modelmat = mat4.identity ();
	shader.setUniformMat4ByName ("model_mat", modelmat);
	if (chooseColours) {
		var colour = vec4.createFrom (1, 0, 0, 1);
		gBlandShader.setUniformFloat4ByLocation (gColourUniLoc, colour);
	} else {
		var colour;
		if (gSelected == 0) {
			colour = vec4.createFrom (0, 1, 0, 1);
		} else {
			colour = vec4.createFrom (1, 1, 1, 1);
		}
		gFullShader.setUniformFloat4ByLocation (gMultiplyUniLoc, colour);
	}
	gDoor.render (shader);
	modelmat = mat4.translate (modelmat, [2, 2, -10], modelmat);
	shader.setUniformMat4ByName ("model_mat", modelmat);
	if (chooseColours) {
		var colour = vec4.createFrom (0, 1, 1, 1);
		gBlandShader.setUniformFloat4ByLocation (gColourUniLoc, colour);
	} else {
		var colour;
		if (gSelected == 1) {
			colour = vec4.createFrom (0, 1, 0, 1);
		} else {
			colour = vec4.createFrom (1, 1, 1, 1);
		}
		gFullShader.setUniformFloat4ByLocation (gMultiplyUniLoc, colour);
	}
	gDoor.render (shader);
}

// if view mode changed
function radio (element) {
	gDrawIntermediate = false;
	if (element.value == "debug") {
		gDrawIntermediate = true;
	}
	toterm ("drawing debug set to " + gDrawIntermediate + "\n");
}

// sample the image
function picker (x, y) {
	// space for sample
	var out = new Uint8Array (1 * 1 * 4); // 4 channels 1x1 size
	gl.bindFramebuffer (gl.FRAMEBUFFER, gFrameBuffer);
	// y is upside down in the browser
	gl.readPixels (x, gl.viewportHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
	gl.bindFramebuffer (gl.FRAMEBUFFER, null);
	toterm ("colour picked = [" + out[0] + ", " + out[1] + ", " + out[2] + ", " + out[3] + "]\n");
	// for bigger number of objects write a look-up table instead of a formula to add all three numbers together into an integer?
	if (out[0] == 255) {
		gSelected = 0;
	} else if (out[1] == 255) {
		gSelected = 1;
	} else {
		gSelected = -1;
	}
}

