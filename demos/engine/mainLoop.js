function startMainLoop (timer, canvas) {
	// timer for main loop
	gFrameTimer = new Timer();
	gFrameTimer.start();
	// kick off loop
	timeStepLoop ();
}

// this function is the looper
function timeStepLoop () {
	// update timers
	var milliSeconds = gFrameTimer.milliseconds ();
	var deltaSeconds = milliSeconds / 1000.0;
	// don't try to compute tiny updates
	if (milliSeconds > 10) {
		gTimeStepAccumSeconds += deltaSeconds;
		gFrameCounterSeconds += deltaSeconds;
		gFrameTimer.start(); // restart timer
	}
	// compute time steps
	while (gTimeStepAccumSeconds > gSettings.mTimeStepSizeSeconds) {
		gTimeStepAccumSeconds -= gSettings.mTimeStepSizeSeconds;
	}
	// render
	drawScene ();
	gFrameCount++;
	if (gFrameCount > 9) {
		gFrameCount = 0;
		document.getElementById("fps").innerHTML = (10.0 / gFrameCounterSeconds).toFixed(2);
		gFrameCounterSeconds = 0.0;
	}
	// request another iteration
	window.requestAnimFrame (timeStepLoop); // this function is from webgl-utils
}
