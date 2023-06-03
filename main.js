import * as faceapi from 'face-api.js';

let cam;
let canvas;
let ctx;
let stream;
let interval;
let chkLandmarks = false;
let chkExpressiosn = false;
let btnInit;
let btnStop;
let timeout;

async function faceDetect() {
  const detectorInstance = new faceapi.TinyFaceDetectorOptions();
  const display = { width: cam.width, height: cam.height };

  faceapi.matchDimensions(canvas, display);

  interval = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(cam, detectorInstance)
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedResults = faceapi.resizeResults(detections, display);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedResults);

    if (chkLandmarks) {
      faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
    }

    if (chkExpressiosn) {
      faceapi.draw.drawFaceExpressions(canvas, resizedResults);
    }
  }, 100);
}

async function loadModels() {
  await faceapi.loadTinyFaceDetectorModel('/weights');
  await faceapi.loadFaceLandmarkModel('/weights');
  await faceapi.loadFaceRecognitionModel('/weights');
  await faceapi.loadFaceExpressionModel('/weights');
}

async function startVideo() {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });

  cam.srcObject = stream;
  cam.play();
}

function stopVideo() {
  stream.getTracks().forEach((track) => {
    track.stop();
  });

  clearTimeout(timeout);

  timeout = setTimeout(() => {
    clearInterval(interval);
  }, 200);

  stream = null;
}

async function init() {
  const landmarksCheck = document.querySelector('#btn-check-landmark');
  const expressionsCheck = document.querySelector('#btn-check-expressions');

  btnInit = document.querySelector('#btn-start');
  btnStop = document.querySelector('#btn-stop');
  cam = document.querySelector('#video');
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  btnInit.addEventListener('click', async function () {
    this.disabled = true;
    this.innerText = 'Carregando...';
    await startVideo();
    await faceDetect();
    this.style.display = 'none';
    btnStop.style.display = 'block';
  });

  btnStop.addEventListener('click', function () {
    this.style.display = 'none';
    btnInit.innerText = 'Iniciar';
    btnInit.style.display = 'block';
    btnInit.disabled = false;
    stopVideo();
  });

  landmarksCheck.addEventListener('change', ({ target }) => {
    chkLandmarks = target.checked;
  });

  expressionsCheck.addEventListener('change', ({ target }) => {
    chkExpressiosn = target.checked;
  });

  await loadModels();
}

document.addEventListener('DOMContentLoaded', async () => {
  await init();
});
