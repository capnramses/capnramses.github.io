// based on https://threejsfundamentals.org/threejs/lessons/threejs-webvr.html

//import * as THREE from './resources/three/r122/build/three.module.js';
import * as THREE from './build/three.module.js';
//import { VRButton } from './examples/jsm/webxr/VRButton.js';
//import {VRButton} from './resources/threejs/r122/examples/jsm/webxr/VRButton.js';
//import { FlyControls } from './jsm/controls/FlyControls.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
/* i just downloaded this from github manually and copied it into a local folder
NOTE: this stupid thing NEEDS to see three.module.js under relative (to index.html) path ./build/three.modules.js or it will shit the bed -- FFS! why
*/
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';

function main() {
	const canvas = document.getElementById("canvas");

	// Instantiate a loader
	var loader = new GLTFLoader();

	// NOTE(Anton) BASIS U is also there
	////////////
	var dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('./examples/js/libs/draco/');
	dracoLoader.setDecoderConfig({ type: 'js' });
	///////////////

	loader.setDRACOLoader(dracoLoader);

	var stats = new Stats();
	stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild(stats.dom);

	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.y = 50.5;
	camera.position.z = 50.25;

	var scene = new THREE.Scene();
	{
		scene.background = new THREE.Color(0x443333);

		// Lights
		const colour = 0xFFFFFF;
		const intensity = 1;
		const light = new THREE.DirectionalLight(colour, intensity);
		light.position.set(-1, 2, 4);
		scene.add(light);

		var light2 = new THREE.HemisphereLight(0x443333, 0x111122);
		scene.add(light2);
	}

	// Load a glTF resource (with draco support)
	loader.load(
		// resource URL
		'mesh/treasury_draco.glb',
		// called when the resource is loaded
		function (gltf) {
			scene.add(gltf.scene);
			// TODO(Anton) why are these hanging here? - should commas separate them?
			gltf.animations; // Array<THREE.AnimationClip>
			gltf.scene; // THREE.Group
			gltf.scenes; // Array<THREE.Group>
			gltf.cameras; // Array<THREE.Camera>
			gltf.asset; // Object

			// make navmesh etc invisible
			var utilities_group = scene.getObjectByName("Utilities");
			utilities_group.visible = false;

			// make shelf material with grille floor transparent.
			// unfortunately getObjectByName() doesn't fetch the material from the gltf.
			gltf.scene.traverse(function (child) {
				if (child.material && child.material.name === 'Shelf') {
					child.material.transparent = true;
				}
			});
		},
		// TODO(Anton) put something on screen to tell the user
		// called while loading is progressing
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		// called when loading has errors
		function (error) {
			console.log('An error happened');
		}
	);



	var renderer = new THREE.WebGLRenderer({ antialias: true });
	//renderer.xr.enabled = false; // NOTE(Anton) just a flag to set here
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	//renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);

	// VR enabled button
	//document.body.appendChild(VRButton.createButton(renderer));

	function resize_renderer_to_display() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		console.log("Anton: window resized");
	}
	window.addEventListener('resize', resize_renderer_to_display, false);

	const clock = new THREE.Clock();

	var controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = true;

	controls.minDistance = 1;
	controls.maxDistance = 500;

	controls.maxPolarAngle = Math.PI / 2;
	function draw_frame() { // note XR has an elapsed_ms param

		stats.begin();
		var timer = Date.now() * 0.0003;
		const delta = clock.getDelta();
		camera.lookAt(0, 0.1, 0);

		stats.end();
		controls.update(delta);
		requestAnimationFrame(draw_frame);
		renderer.render(scene, camera);
	}
	draw_frame();

	// let Three.js XR handle render loop ( ~2 cameras ) instead of requestAnim...
	// renderer.setAnimationLoop(draw_frame);

} // endfunc main

main();
