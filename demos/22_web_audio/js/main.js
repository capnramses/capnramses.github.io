var aud;
var recording;

function main(canvas_id) {
  apg_gfx_start(canvas_id);

  aud = new Audio("audio/taunt.wav");
  recording = new Audio();

  // get permission to use microphone
  navigator.mediaDevices.getUserMedia({ audio: true });

  const constraints = { audio: true };
  const mic_audio = document.getElementById('mic_audio');
  navigator.mediaDevices.getUserMedia(constraints).
    then((stream) => { mic_audio.srcObject = stream });
}

function play_sound() {
  if (aud) {
    aud.currentTime = 0.0; // if already playing start again
    aud.play();
  }
}
