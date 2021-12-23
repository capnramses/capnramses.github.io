
	// global for vertex buffer for testing the shader
	var vboHandle;
	var myShaderProg;
	var modelMatLoc;
	// degrees
	var degrees = 0.0;
	var frameTimer;
	var glContext;
	var stepTimeAccum = 0;
	var stepSize = 0.02;
	var myMesh;
	var texture;

	function main() {
		console.log ("main()");
		// get handle to the HTML5 canvas that we made
		var canvas = document.getElementById ("miniCanvas");
		// start GL
		var debugging = true;
		var withLogging = false;
		glContext = initGL (canvas, debugging, withLogging);
		// validate
		if (!glContext) {
			alert("failed to start GL");
			return;
		}
		// create global settings object from JSON file
		gGLSettings.loadFromFile("https://antongerdelan.net/demos/mini/glsettings.json");
		// update HTML section
		//gGLSettings.printAll();
		
		// create a shader programme
		myShaderProg = new ShaderProgramme (glContext);
		myShaderProg.loadVertexShaderFromURL (glContext, "https://antongerdelan.net/demos/mini/basic_vs.glsl");
		myShaderProg.loadFragmentShaderFromURL (glContext, "https://antongerdelan.net/demos/mini/basic_fs.glsl");
		myShaderProg.link (glContext);
		
		// enable the shader
		myShaderProg.use (glContext);
		// get a handle to the vp attribute in the shader
		var vertexPositionAttribute = myShaderProg.getAttributeLocation (glContext, "lc_vp");
		var textureCoordAttribute = myShaderProg.getAttributeLocation (glContext, "vt");
		
		// get matrix location in shader
		modelMatLoc = myShaderProg.getUniformLocation (glContext, "modelMat");
		
		// create a hard-coded vertex buffer for testing the shader
		vboHandle = glContext.createBuffer ();
		// enable buffer
		glContext.bindBuffer (glContext.ARRAY_BUFFER, vboHandle);
		// create some data to put in buffer
		/*var vertices = [
			-0.5, -0.5, 0.0,
			0.0, 0.5, 0.0,
			0.5, -0.5, 0.0
		];*/
		//myMesh = loadMeshFromJSON ("testmesh2.json");
		console.log ("loading " + "https://antongerdelan.net/demos/mini/dungeonDoor.json");
		myMesh = loadMeshFromJSON ("https://antongerdelan.net/demos/mini/dungeondoor.json");
		//alert(myMesh.mVertexPoints.length / 3 + " vertices, " + myMesh.mTextureCoords.length / 2 + " texture coords");
		
		// put data into buffer
		glContext.bufferData (glContext.ARRAY_BUFFER, new Float32Array (myMesh.mVertexPoints), glContext.STATIC_DRAW);
		// enable attribute for rendering
		glContext.enableVertexAttribArray (vertexPositionAttribute);
		// define attribute using currently bound VBO
		glContext.vertexAttribPointer (vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0); 
		
		vboVTHandle = glContext.createBuffer ();
		glContext.bindBuffer (glContext.ARRAY_BUFFER, vboVTHandle);
		glContext.bufferData (glContext.ARRAY_BUFFER, new Float32Array (myMesh.mTextureCoords), glContext.STATIC_DRAW);
		glContext.enableVertexAttribArray (textureCoordAttribute);
		glContext.vertexAttribPointer (textureCoordAttribute, 2, glContext.FLOAT, false, 0, 0); 
		
		// goes into a separate looping function later
		glContext.clearColor (1, 1, 1, 1.0);
		glContext.enable (glContext.DEPTH_TEST);
		
		// load texture
		texture = glContext.createTexture();
		texture.image = new Image();
		texture.image.onload = function() {
			//alert("loaded texture");
			glContext.bindTexture(glContext.TEXTURE_2D, texture);
			glContext.pixelStorei(glContext.UNPACK_FLIP_Y_WEBGL, true);
			glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, texture.image);
			glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR); // bi-linear filtering
			glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR); // tri-linear filtering
		//	glContext.bindTexture(glContext.TEXTURE_2D, null); // unbind -- this was screwing me up
		}
		console.log ("loading " + "https://antongerdelan.net/demos/mini/dungeonDoor.png");
		texture.image.src = "https://antongerdelan.net/demos/mini/dungeonDoor.png";
		
		// also bind texture (hopefully this is not too soon)
		glContext.activeTexture(glContext.TEXTURE0);
		glContext.bindTexture(glContext.TEXTURE_2D, texture);
		var samplerLocation = myShaderProg.getUniformLocation (glContext, "tex");
		myShaderProg.setUniformIntByLocation(glContext, samplerLocation, 0); // texture location 0 in shader
		
		// create a frame timer
		frameTimer = new Timer();
		frameTimer.start();
		
		// render loop
		render (canvas);
	}

	// rendering loop
	function render (canvas) {
		// update matrix based on timer
		var milliSeconds = frameTimer.milliseconds();
		var deltaSeconds = milliSeconds / 1000.0;
		if (milliSeconds > 10) {
			stepTimeAccum += deltaSeconds;
			frameTimer.start();
		}
		// compute time steps
		while (stepTimeAccum > stepSize) {
			// update matrix for shader
			var modelMat = mat4.create();
			mat4.identity (modelMat);
			degrees += stepSize * 2.0;
			var axis = vec3.createFrom(0, 1, 0);
			vec3.normalize(axis);
			mat4.rotate (modelMat, degrees, axis);
			mat4.scale (modelMat, [.6, .6, .6]);
			mat4.translate (modelMat, [0, -1.5, 0]);
			// enable the shader
			myShaderProg.use (glContext);
			myShaderProg.setUniformMat4ByLocation(glContext, modelMatLoc, modelMat);

			stepTimeAccum -= stepSize;
		}
		
		// draw geometry (the suggest order of functions on the webgl wiki was wrong)
		drawScene (glContext);
		
		
		window.requestAnimFrame(render, canvas); // this function is from webgl-utils
	}
