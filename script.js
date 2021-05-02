// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
var file = document.getElementById('image-input');
var form = document.getElementById('generate-meme');
var reset = document.querySelector("[type='reset']");
var canvas = document.getElementById('user-image');
var read = document.querySelector("[type='button']");
var ctx = canvas.getContext('2d');
var listvoices = speechSynthesis.getVoices();
var synth = window.speechSynthesis;
var range = document.querySelector("[type='range']");
var utterThis = new SpeechSynthesisUtterance();

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  document.querySelector("[type='submit']").disabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  reset.disabled = false;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var dim = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);
});

file.addEventListener('change', (image) => {
  if(image.target.files) {
    let file = image.target.files[0];
    var reader  = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function (srcimg) {
        img.src = srcimg.target.result;
        img.alt = file.name;
    }
  }
});

form.addEventListener('submit', (e) => {
  document.querySelector("[type='button']").disabled = false;
  document.getElementById('voice-selection').disabled = false;
  document.querySelector("[type='submit']").disabled = true;
  var topMessage = document.getElementById('text-top');
  var botMessage = document.getElementById('text-bottom');
  ctx.font = 'bold 48px serif'
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(topMessage.value, 200, 48)
  ctx.strokeText(topMessage.value, 200, 48);
  ctx.fillText(botMessage.value, 200, canvas.height - 30);
  ctx.strokeText(botMessage.value, 200, canvas.height - 30);
  ctx.fill();
  ctx.stroke();
  reset.disabled = false;
  e.preventDefault();
});

reset.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  reset.disabled = true; 
  document.querySelector("[type='button']").disabled = true;
  document.getElementById('voice-selection').disabled = true;
  document.querySelector("[type='submit']").disabled = false;
});

function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  var voices = speechSynthesis.getVoices();
  listvoices = voices;

  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    document.getElementById("voice-selection").appendChild(option);
  }
}

populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

read.addEventListener('click', (e) => {
  var topMessage = document.getElementById('text-top');
  var botMessage = document.getElementById('text-bottom');
  utterThis.text = topMessage.value + ' ' + botMessage.value;
  var selectedOption = document.getElementById("voice-selection").selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < listvoices.length ; i++) {
    if(listvoices[i].name === selectedOption) {
      utterThis.voice = listvoices[i];
    }
  }
  utterThis.pitch = 1;
  utterThis.rate = 1;

  synth.speak(utterThis);
  e.preventDefault();
});

range.addEventListener('input', () => {
  var vol = document.getElementById('volume-group');
  var volimgsrc = vol.getElementsByTagName('img')[0];
  utterThis.volume = range.value / 100;
  if(range.value == 0)
  {
    volimgsrc.src = '/icons/volume-level-0.svg';
  }
  else if(range.value > 0 && range.value < 34)
  {
    volimgsrc.src = '/icons/volume-level-1.svg';
  }
  else if(range.value > 33 && range.value < 67)
  {
    volimgsrc.src = '/icons/volume-level-2.svg';
  }
  else if(range.value > 66)
  {
    volimgsrc.src = '/icons/volume-level-3.svg';
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
