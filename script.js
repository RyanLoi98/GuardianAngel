var video1,
  video2,
  canvas1,
  canvas2,
  context1,
  context2,
  imageData1,
  imageData2;
var detector, posit;
var markerSize = 70.0; // Marker size in millimeters
let verboseMode = false; // this will be used to control the display of additional data

// supplemental variables for added functionality (aka functions made by me ontop of the forked code)

// markers
const selfMarker = 87; // this is the id of the self marker used for fall detection
const phoneMarker = 88; // this will be the id of a piece of property (in this case lets pretend this is a phone)
const keyMarker = 89; // this will be the id of a piece of property (in this case lets pretend this is some car keys)
const objMarker1 = 84; // this will be the id of an object for object detection
const objMarker2 = 85; // this will be the id of a 2nd object for object detection
const objMarker3 = 86; // this will be the id of a 3rd object for object detection

// Camera frame Swapping
let frameMode = 1; // this variable will determine which frame mode we will currently display
let numModes = 5; // this determine the number of modes we will have (normal, swapped, only rear, only front, all off)

// fall detection
let fallDetectionEnabled = false; // this controls if fall detection is enabled or not
let fallDetectionLock = false; // this variable makes sure the user is fully detected before fully activating fall detection
let selfDetected1 = false; // checks for us in canvas 1
let selfDetected2 = false; // checks for us in canvas 2
let selfDetectionTime = null; // this is a timer to implement a 5 second time out after a fall before we trigger an alert
const selfDetectionTimeOut = 5000; // 5 second time out
let fallAlertCancel = false; // this variable allows the fall alert cancel button to stop the count down

// anti-theft detection
let ATFDetectionEnabled = false; // this will control anti-theft detection
let propertyDetectionTime = null; // this will be used to implement property missing timer before an alarm is triggered
let propertyDetectionLock = false; // // this variable makes sure the property is fully detected before fully activating anti-theft detection
let propertyAlertCancel = false; // this variable allows the anti-theft alert cancel button to stop the count down
let phoneDetected1 = false; // checks for phone in canvas 1
let phoneDetected2 = false; // checks for phone in canvas 2
let keyDetected1 = false; // checks for keys in canvas 1
let keyDetected2 = false; // checks for keys in canvas 2
let selectedProperties = []; // this stores all the selected properties we want to protect with anti-theft
const propertyDetectionTimeOut = 5000; // 5 second time out
const itemDetectionTimeOut = 4000; // 4second time out
let phoneDetectionTime = null; // track when phone is detected
let keyDetectionTime = null; // track when key is detected

// sleep mode
let sleepModeEnabled = false; // this flag controls the activation of sleep mode
let sleepMarkerLockTime = null; // keeps track of last time sleep marker has been seen
const sleepTimer = 500; // this is the amount of time before the system searches for the marker again
let sleepMarkerDistance = null; // keeps track if the sleep marker distance from the camera

// object detection mode
let objectModeEnabled = false; // flag used to control object detection mode
let obj1Detected = false; // flag to determine if object 1 has been detected yet
let obj2Detected = false; // flag to determine if object 1 has been detected yet
let obj3Detected = false; // flag to determine if object 1 has been detected yet
// booleans for marker positions
let objLeft = false;
let objMid = false;
let objRight = false;
let objDetectionTime = Date.now(); //keeps track of object's detection time
const objTime = 500; // the refresh time when we will redetect objects on screen
// to draw the markers
let marker84Color = "blue";
let marker85Color = "blue";
let marker86Color = "blue";

let objDetectionAlertTime = 0; // controls how frequently the obj detection alert can play

// audio files

// fall detection alert audio file
const fallAlertAudio = new Audio(
  "https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/level-up-191997.mp3?v=1731474821298"
);

// fall detection alarm audio file - played when a fall is actually confirmed
const fallAlarmAudio = new Audio(
  "https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/security-alarm-63578.mp3?v=1731474826307"
);

// anti-theft detection alert audio file
const ATFAlertAudio = new Audio(
  "https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/level-up-191997.mp3?v=1731474821298"
);

// anti-theft detection alarm audio file
const ATFAlarmAudio = new Audio(
  "https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/alert-102266.mp3?v=1731544553251"
);

// object detection audio file
const objDetectionAlert = new Audio(
  "https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/public-domain-beep-sound-100267.mp3?v=1731672906147"
);

// this is for menu button presses
const buttonPressSound = new Audio(
  "https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/button_09-190435.mp3?v=1731736127514"
);

// this is for menu button presses disabling the button
const buttonPressSoundOff = new Audio(
  "https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/button-pressed-38129.mp3?v=1731735473019"
);

// this function loads the program
async function onLoad() {
  video1 = document.getElementById("video1");
  video2 = document.getElementById("video2");
  canvas1 = document.getElementById("canvas1");
  canvas2 = document.getElementById("canvas2");
  context1 = canvas1.getContext("2d");
  context2 = canvas2.getContext("2d");

  canvas1.width = parseInt(canvas1.style.width);
  canvas1.height = parseInt(canvas1.style.height);
  canvas2.width = parseInt(canvas2.style.width);
  canvas2.height = parseInt(canvas2.style.height);

  // resize the canvases
  canvas1.style.width = "20vw";
  canvas1.style.height = "11.25vw";
  canvas1.style.borderRadius = "1rem";

  canvas2.style.width = "100%";
  canvas2.style.height = "100%";

  // Initialize ArUco detector and POSIT library
  detector = new AR.Detector();
  posit = new POS.Posit(markerSize, canvas1.width);

  // Get video devices and warn the user if not enough web cams are plugged in (we need 2)
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  if (videoDevices.length < 2) {
    alert(`Two webcams are required for Guardian Angel to function.

If your device currently has 2 webcams and this error is being displayed, please enable camera permissions in your browser and reload the page.

Note: Guardian Nest will not function on mobile devices (phones or tablets), please utilize a desktop computer, laptop, or Windows tablet (e.g. Microsoft Surface).`);

    return;
  }

  // Set up video streams from the web camera to the web page
  const stream1 = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: videoDevices[0].deviceId },
  });
  const stream2 = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: videoDevices[1].deviceId },
  });
  video1.srcObject = stream1;
  video2.srcObject = stream2;

  // Start processing for each video stream
  requestAnimationFrame(tick1);
  requestAnimationFrame(tick2);

  // updating the clock every 1 second
  setInterval(updateClock, 1000);
  updateClock();

  // listeners

  // listener to control Swaping camera frames
  document.getElementById("swapButton").addEventListener("click", swapCameras);
  // listener to start sleep mode
  document
    .getElementById("sleepButton")
    .addEventListener("click", startSleepMode);
  // listener to stop sleep mode
  document
    .getElementById("sleepModeDisable")
    .addEventListener("click", stopSleepMode);
  // listener to start and stop fall detection
  document
    .getElementById("fallDetectionButton")
    .addEventListener("click", triggerFallDetection);
  // listener to close fall detection alert box
  document
    .getElementById("fallDetectionCancel")
    .addEventListener("click", closeFallDetectionAlert);
  // listener to close fall detection lock alert box
  document
    .getElementById("fallDetectionLockCancel")
    .addEventListener("click", closeFallDetectionLockAlert);
  // listener to start anti-theft detection
  document
    .getElementById("antiTheftDetectionButton")
    .addEventListener("click", triggerAntiTheftDetection);
  // listener to gather form data for what to protect with anti-theft
  document
    .getElementById("submitProperties")
    .addEventListener("click", gatherPropertyData);
  // listener to cancel anti-theft alarm
  document
    .getElementById("theftDetectionCancel")
    .addEventListener("click", closeFallATFAlarm);
  // listener to cancel anti-theft lock alert
  document
    .getElementById("ATFDetectionLockCancel")
    .addEventListener("click", closeATFDetectionLockAlert);
  // listener to start and stop object detection
  document
    .getElementById("objectDetectionButton")
    .addEventListener("click", startObjectDetectionMode);
}

function tick1() {
  requestAnimationFrame(tick1);
  if (video1.readyState === video1.HAVE_ENOUGH_DATA) {
    snapshot(video1, context1, canvas1, 1);
  }
}

function tick2() {
  requestAnimationFrame(tick2);
  if (video2.readyState === video2.HAVE_ENOUGH_DATA) {
    snapshot(video2, context2, canvas2, 2);
  }
}

function snapshot(video, context, canvas, canvasNum) {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const markers = detector.detect(imageData);

  //drawCorners(markers, context); // This function outlines the markers
  //drawId(markers, context); // This function displays the id of the marker
  //getCornerPosition(markers, context, canvas)  // This function displays the coordinates of the corners of the marker
  //showOrientation(markers, context, canvas); // This function displays the orientation data, only used for gesture control (if I have time to implement it), credit: ai helped make this function b/c I had no idea how to calculate angles...

  // enable fall detection function
  if (fallDetectionEnabled) {
    fallDetection(markers, canvasNum);
  }

  if (ATFDetectionEnabled) {
    antiTheftDetection(markers, canvasNum);
  }

  if (sleepModeEnabled) {
    sleepMode(markers, canvasNum);
  }

  if (objectModeEnabled) {
    objectDetection(markers, context, canvas);
  }
}

// Function for calculating distances, orientation, and drawing markers for both cameras
function calculateDistance(point1, point2) {
  const xDiff = point2[0] - point1[0];
  const yDiff = point2[1] - point1[1];
  const zDiff = point2[2] - point1[2];
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
}

// Gets the distance from a single marker to the camera and returns it
function showDistance(marker) {
  if (!marker || !marker.corners) {
    console.warn("Invalid marker or the marker does not have corners.");
    return null;
  }

  const corners = marker.corners;

  const pose = posit.pose(
    corners.map((c) => ({
      x: c.x - canvas1.width / 2,
      y: canvas1.height / 2 - c.y,
    }))
  );

  const { bestTranslation } = pose;

  // Calculate the distance from the camera to the marker using the Euclidean distance formula
  const distanceFromCamera = Math.sqrt(
    bestTranslation[0] ** 2 + bestTranslation[1] ** 2 + bestTranslation[2] ** 2
  );

  return distanceFromCamera;
}

// Function to outline the markers
function drawCorners(markers, context, color = "blue") {
  context.lineWidth = 5;
  markers.forEach((marker) => {
    context.strokeStyle = color;
    context.beginPath();
    marker.corners.forEach((corner, j) => {
      context.moveTo(corner.x, corner.y);
      context.lineTo(
        marker.corners[(j + 1) % marker.corners.length].x,
        marker.corners[(j + 1) % marker.corners.length].y
      );
    });
    context.stroke();
  });
}

// Function to display the ID of the markers
function drawId(markers, context) {
  markers.forEach((marker) => {
    const x = Math.min(...marker.corners.map((corner) => corner.x));
    const y = Math.min(...marker.corners.map((corner) => corner.y));
    context.strokeStyle = "green";
    context.lineWidth = 1;
    context.strokeText(marker.id, x, y - 10);
  });
}

// Function to draw the coordinates of a single marker
function getCornerPosition(marker, context, canvas) {
  if (!marker || !marker.corners || !marker.corners.length) {
    console.error("Invalid marker:", marker);
    return null; // Return null if marker is invalid
  }

  const positionInSpace = posit.pose(
    marker.corners.map((c) => ({
      x: c.x - canvas.width / 2,
      y: canvas.height / 2 - c.y,
    }))
  ).bestTranslation;

  if (verboseMode) {
    context.strokeStyle = "blue";
    context.lineWidth = 1;
    context.strokeText(
      `${Math.trunc(positionInSpace[0])},${Math.trunc(
        positionInSpace[1]
      )},${Math.trunc(positionInSpace[2])}`,
      marker.corners[0].x,
      marker.corners[0].y
    );
  }

  return positionInSpace[0]; // Return the X coordinate
}

// Function to show the orientation data of the markers
function showOrientation(markers, context, canvas) {
  if (markers.length > 0) {
    const pose = posit.pose(
      markers[0].corners.map((corner) => ({
        x: corner.x - canvas.width / 2,
        y: canvas.height / 2 - corner.y,
      }))
    );
    const rotationMatrix = pose.bestRotation;
    const eulerAngles = getEulerAngles(rotationMatrix);
    drawOrientation(eulerAngles, context, canvas);
  }
}

// Function to get the angles of the markers
function getEulerAngles(rotationMatrix) {
  const pitch = Math.asin(rotationMatrix[2][0]) * (180 / Math.PI);
  const yaw =
    Math.atan2(-rotationMatrix[2][1], rotationMatrix[2][2]) * (180 / Math.PI);
  const roll =
    Math.atan2(-rotationMatrix[1][0], rotationMatrix[0][0]) * (180 / Math.PI);
  return { pitch, yaw, roll };
}

// Function to draw these orientations onto the canvas
function drawOrientation(eulerAngles, context, canvas) {
  context.font = "20px Arial";
  context.fillStyle = "white";
  context.fillText(
    `Pitch: ${eulerAngles.pitch.toFixed(2)}°, Yaw: ${eulerAngles.yaw.toFixed(
      2
    )}°, Roll: ${eulerAngles.roll.toFixed(2)}°`,
    10,
    canvas.height - 10
  );
}

// Supplemental Functions made by me

// Clock function
function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const month = now.toLocaleString("default", { month: "long" });
  const day = now.getDate();
  const year = now.getFullYear();

  // Converting to 12-hour format
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }

  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${ampm}`;

  const formattedDate = `${month} ${day}, ${year}`;

  document.getElementById("clock").innerText = formattedTime;
  document.getElementById("clock2").innerText = formattedTime;
  document.getElementById("date").innerText = formattedDate;
  document.getElementById("date2").innerText = formattedDate;
}

// function to swap camera views
function swapCameras() {
  const swapButton = document.getElementById("swapButton");
  buttonPressSound.play();
  buttonPressSound.currentTime = 0;
  // display the camera views normally
  if (frameMode === 0) {
    swapButton.style.background =
      "url('https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/camera-1710849.svg?v=1731714995285') center center no-repeat, " +
      "linear-gradient(to top, rgb(3, 128, 252), rgb(3, 232, 252))";

    swapButton.style.backgroundSize = "70%, 100%";

    // resize the canvases
    canvas1.style.width = "20vw";
    canvas1.style.height = "11.25vw";
    canvas1.style.borderRadius = "1rem";
    canvas1.style.zIndex = "-1";
    canvas1.style.top = "1rem";
    canvas1.style.left = "1rem";

    canvas2.style.width = "100%";
    canvas2.style.height = "100%";
    canvas2.style.borderRadius = "0";
    canvas2.style.zIndex = "-3";
    canvas2.style.top = "0";
    canvas2.style.left = "0";

    // display the canvases
    canvas1.style.display = "flex";
    canvas2.style.display = "flex";

    // flip the camera views
  } else if (frameMode === 1) {
    // resize the canvases
    canvas1.style.width = "100%";
    canvas1.style.height = "100%";
    canvas1.style.borderRadius = "0";
    canvas1.style.zIndex = "-3";
    canvas1.style.top = "0";
    canvas1.style.left = "0";

    canvas2.style.width = "20vw";
    canvas2.style.height = "11.25vw";
    canvas2.style.borderRadius = "1rem";
    canvas2.style.zIndex = "-1";
    canvas2.style.top = "1rem";
    canvas2.style.left = "1rem";

    // only display the front camera (atleast this should be the front camera, but can vary depending on usb port useage on external webcams)
  } else if (frameMode === 2) {
    // disable the back cam
    canvas2.style.display = "none";

    // display only the back camera
  } else if (frameMode === 3) {
    // resize the canvas2
    canvas2.style.width = "100%";
    canvas2.style.height = "100%";
    canvas2.style.borderRadius = "0";
    canvas2.style.zIndex = "-3";
    canvas2.style.top = "0";
    canvas2.style.left = "0";

    // reenable the back cam
    canvas2.style.display = "flex";

    // disable the front cam
    canvas1.style.display = "none";

    // disable both cameras
  } else if (frameMode === 4) {
    // disable both cams
    canvas2.style.display = "none";
    swapButton.style.background =
      "url('https://cdn.glitch.global/07e03d19-30c0-487f-b678-1dd81ff3e84f/camera%20disabled.svg?v=1731714999557') center center no-repeat, " +
      "linear-gradient(to top, rgb(3, 128, 252), rgb(3, 232, 252))";

    swapButton.style.backgroundSize = "70%, 100%";
  }

  // increment the frameMode
  frameMode = (frameMode + 1) % numModes;
}

// SLEEP MODE LOGIC

// function to start sleep mode
function startSleepMode() {
  buttonPressSound.play();
  buttonPressSound.currentTime = 0;
  sleepModeEnabled = true;
  document.getElementById("sleepModal").style.display = "flex";
}

// sleep mode function
function sleepMode(markers, canvasNum) {
  const marker87 = markers.find((marker) => marker.id === selfMarker);

  if (marker87) {
    if (Date.now() - sleepMarkerLockTime > sleepTimer) {
      sleepMarkerLockTime = Date.now();
      // get distance of sleep marker
      sleepMarkerDistance = showDistance(marker87);
      console.log(sleepMarkerDistance);
      
      if (sleepMarkerDistance < 250) {
        document.getElementById("sleepBorder").style.border = "5px solid red";
        document.getElementById("bedRailStatus").innerHTML =
          "Bed Rail Status: Raising to Max Height";
      } else if (sleepMarkerDistance < 500) {
        document.getElementById("sleepBorder").style.border =
          "5px solid orange";
        document.getElementById("bedRailStatus").innerHTML =
          "Bed Rail Status: Raising to Medium Height";
      } else {
        document.getElementById("sleepBorder").style.border = "";
        document.getElementById("bedRailStatus").innerHTML =
          "Bed Rail Status: Disabled";
      }
    }
  } else {
    if (Date.now() - sleepMarkerLockTime > 3 * sleepTimer) {
      document.getElementById("sleepBorder").style.border = "";
      document.getElementById("bedRailStatus").innerHTML =
        "Bed Rail Status: Disabled";
    }
  }
}

// function to end sleep mode
function stopSleepMode() {
  buttonPressSoundOff.play();
  buttonPressSoundOff.currentTime = 0;
  sleepModeEnabled = false;
  document.getElementById("sleepModal").style.display = "none";
  document.getElementById("sleepBorder").style.border = "";
}

// FALL DETECTION LOGIC

// function to start and stop fall detection
function triggerFallDetection() {
  if (fallDetectionEnabled) {
    buttonPressSoundOff.play();
    buttonPressSoundOff.currentTime = 0;
    document.getElementById("fallDetectionButton").style.border = "";
    fallDetectionEnabled = !fallDetectionEnabled;
    selfDetectionTime = null;
    fallDetectionLock = false;
    fallAlertCancel = true;
  } else {
    buttonPressSound.play();
    buttonPressSound.currentTime = 0;
    document.getElementById("fallDetectionButton").disabled = true;
    document.getElementById("fallDetectionButton").style.border =
      "0.5rem solid orange";
    fallDetectionEnabled = !fallDetectionEnabled;
  }
}

// function for fall detection
function fallDetection(markers, canvasNum) {
  // Check if marker with ID 87 is in the array of detected markers
  const marker87 = markers.some((marker) => marker.id === selfMarker);

  if (marker87) {
    if (canvasNum === 1) {
      selfDetected1 = true;
    } else {
      selfDetected2 = true;
    }

    selfDetectionTime = null;
    fallDetectionLock = true;
    document.getElementById("fallDetectionButton").style.border =
      "0.5rem solid green";
    document.getElementById("fallDetectionButton").disabled = false;
  } else {
    if (canvasNum === 1) {
      selfDetected1 = false;
    } else {
      selfDetected2 = false;
    }

    if (selfDetectionTime === null) {
      selfDetectionTime = Date.now();
    }
  }

  // react depending on if marker 87 is in the fame or not and if we even locked it for the first time
  if (
    !selfDetected1 &&
    !selfDetected2 &&
    selfDetectionTime !== null &&
    Date.now() - selfDetectionTime > selfDetectionTimeOut &&
    fallDetectionLock
  ) {
    // reset everything
    fallDetectionEnabled = false;
    fallDetectionLock = false;
    selfDetectionTime = null;
    document.getElementById("fallDetectionButton").style.border = "";
    document.getElementById("fallDetectionButton").disabled = false;
    document.getElementById("fallDetectionButton").style.border = "";
    document.getElementById("fallDetectionModal").style.display = "flex";

    // count down before alert plays and emergy contact is called (we are gonna do 9 seconds)
    let countdown = 9;

    fallAlertCancel = false;

    const intervalId = setInterval(() => {
      if (fallAlertCancel) {
        fallAlertCancel = false;
        clearInterval(intervalId);
        return;
      }

      document.getElementById(
        "fallDetectedContact"
      ).innerHTML = `Emergency Contacts Alerted in ${countdown}...`;

      // Play the audio each second of the countdown
      fallAlertAudio.currentTime = 0; // Reset the audio to the beginning
      fallAlertAudio.play();

      countdown--;

      // When the countdown reaches 0, display the final message and alarm siren
      if (countdown < 0) {
        document.getElementById("fallDetectedContact").innerHTML =
          "Emergency Contacts Alerted!";
        fallAlarmAudio.currentTime = 0;
        fallAlarmAudio.loop = true;
        fallAlarmAudio.play();
        clearInterval(intervalId);
      }
    }, 1000);

    // if no user was detected upon the first time launching fall detection
  } else if (
    !selfDetected1 &&
    !selfDetected2 &&
    selfDetectionTime !== null &&
    Date.now() - selfDetectionTime > selfDetectionTimeOut &&
    !fallDetectionLock
  ) {
    fallDetectionEnabled = false;
    fallDetectionLock = false;
    selfDetectionTime = null;
    document.getElementById("fallDetectionButton").style.border = "";
    document.getElementById("fallDetectionLockModal").style.display = "flex";
    document.getElementById("fallDetectionButton").disabled = false;
    fallAlertAudio.currentTime = 0; // Reset the audio to the beginning
    fallAlertAudio.play();
  }
}

// function to close fall detection alert
function closeFallDetectionAlert() {
  buttonPressSoundOff.play();
  buttonPressSoundOff.currentTime = 0;
  fallAlertCancel = true;
  fallAlertAudio.pause();
  fallAlertAudio.currentTime = 0;
  fallAlarmAudio.pause();
  fallAlarmAudio.currentTime = 0;
  document.getElementById("fallDetectionModal").style.display = "none";
  document.getElementById("fallDetectedContact").innerHTML =
    "Emergency Contacts Alerted in 10...";
}

// function to close fall detection lock alert
function closeFallDetectionLockAlert() {
  buttonPressSoundOff.play();
  buttonPressSoundOff.currentTime = 0;
  document.getElementById("fallDetectionLockModal").style.display = "none";
}

// ANTI-THEFT LOGIC

// function to start and stop anti-theft detection
function triggerAntiTheftDetection() {
  if (ATFDetectionEnabled) {
    buttonPressSoundOff.play();
    buttonPressSoundOff.currentTime = 0;
    document.getElementById("antiTheftDetectionButton").style.border = "";
    ATFDetectionEnabled = !ATFDetectionEnabled;
    propertyDetectionTime = null;
    propertyDetectionLock = false;
    propertyAlertCancel = true;
  } else {
    buttonPressSound.play();
    buttonPressSound.currentTime = 0;
    document.getElementById("antiTheftDetectionButton").disabled = true;
    document.getElementById("ATDPropertyConfirmModal").style.display = "flex";
    document.getElementById("antiTheftDetectionButton").style.border =
      "0.5rem solid orange";
  }
}

// function to get anti-theft data
function gatherPropertyData() {
  buttonPressSound.play();
  buttonPressSound.currentTime = 0;

  selectedProperties = [];

  const propertyForm = document.getElementById("propertyForm");
  // get our selected properties
  const checkboxes = propertyForm.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  // Push the value of each checked checkbox into the selectedProperties array
  checkboxes.forEach((checkbox) => {
    selectedProperties.push(checkbox.value);
  });

  propertyForm.reset();
  document.getElementById("ATDPropertyConfirmModal").style.display = "none";

  if (selectedProperties.length > 0) {
    ATFDetectionEnabled = true;
  } else {
    ATFDetectionEnabled = false;
    document.getElementById("antiTheftDetectionButton").disabled = false;
    document.getElementById("antiTheftDetectionButton").style.border = "";
  }
}

// function for anti-theft detection
function antiTheftDetection(markers, canvasNum) {
  // determine if we are going to track one or two markers
  let checkPhone = false;
  let checkKey = false;

  if (selectedProperties.length === 2) {
    checkPhone = true;
    checkKey = true;
  } else if (selectedProperties[0] === phoneMarker.toString()) {
    checkPhone = true;
  } else {
    checkKey = true;
  }

  let marker88 = false;
  let marker89 = false;

  if (checkPhone) {
    // Check if marker with ID 88 (our phone marker) is in the array of detected markers
    marker88 = markers.some((marker) => marker.id === phoneMarker);

    if (marker88) {
      if (canvasNum === 1) {
        phoneDetected1 = true;
      } else {
        phoneDetected2 = true;
      }
    } else {
      if (canvasNum === 1) {
        phoneDetected1 = false;
      } else {
        phoneDetected2 = false;
      }
    }
  }

  if (checkKey) {
    // Check if marker with ID 89 (our key marker) is in the array of detected markers
    marker89 = markers.some((marker) => marker.id === keyMarker);

    if (marker89) {
      if (canvasNum === 1) {
        keyDetected1 = true;
      } else {
        keyDetected2 = true;
      }
    } else {
      if (canvasNum === 1) {
        keyDetected1 = false;
      } else {
        keyDetected2 = false;
      }
    }
  }

  // check if either marker is present

  // this one is when we are only checking for a phone or a key
  if (
    (marker88 || marker89) &&
    (checkPhone || checkKey) &&
    !(checkPhone && checkKey)
  ) {
    propertyDetectionTime = null;
    propertyDetectionLock = true;
    document.getElementById("antiTheftDetectionButton").disabled = false;
    // color button green
    document.getElementById("antiTheftDetectionButton").style.border =
      "0.5rem solid green";

    // this one is if we are checking for both a phone and key
  } else if (checkPhone && checkKey && marker88 && marker89) {
    propertyDetectionTime = null;
    propertyDetectionLock = true;
    phoneDetectionTime = null;
    keyDetectionTime = null;

    document.getElementById("antiTheftDetectionButton").disabled = false;
    // color button green
    document.getElementById("antiTheftDetectionButton").style.border =
      "0.5rem solid green";
  } else {
    if (propertyDetectionTime === null) {
      propertyDetectionTime = Date.now();
    }
    if (marker88) {
      phoneDetectionTime = Date.now();
    } else if (marker89) {
      keyDetectionTime = Date.now();
    }
  }

  // react depending on if marker 88 or 89 is in the fame or not and if we even locked it for the first time
  if (
    propertyDetectionTime !== null &&
    Date.now() - propertyDetectionTime > propertyDetectionTimeOut &&
    propertyDetectionLock
  ) {
    // reset everything
    ATFDetectionEnabled = false;
    propertyDetectionLock = false;
    propertyDetectionTime = null;
      
    
    document.getElementById("antiTheftDetectionButton").style.border = "";
    document.getElementById("antiTheftDetectionButton").style.border = "";
    document.getElementById("antiTheftDetectionButton").disabled = false;

    if (checkPhone && checkKey) {
      if (
        Date.now() - phoneDetectionTime > itemDetectionTimeOut &&
        Date.now() - keyDetectionTime > itemDetectionTimeOut
      ) {
        document.getElementById("theftDetectedMSG").innerHTML =
          "Phone and Keys Missing";
      } else if (Date.now() - phoneDetectionTime > itemDetectionTimeOut) {
        document.getElementById("theftDetectedMSG").innerHTML = "Phone Missing";
      } else {
        document.getElementById("theftDetectedMSG").innerHTML = "Keys Missing";
      }
    } else if (checkPhone) {
      document.getElementById("theftDetectedMSG").innerHTML = "Phone Missing";
    } else if (checkKey) {
      document.getElementById("theftDetectedMSG").innerHTML = "Keys Missing";
    }

    document.getElementById("theftDetectionModal").style.display = "flex";

    ATFAlarmAudio.currentTime = 0;
    ATFAlarmAudio.loop = true;
    ATFAlarmAudio.play();

     // reset everything
    phoneDetected1 = false;
    phoneDetected2 = false;
    keyDetected1 = false;
    keyDetected2 = false;
    
    // if no object was detected upon the first time launching fall detection
  } else if (
    (checkPhone || checkKey) &&
    !(checkPhone && checkKey) &&
    !phoneDetected1 &&
    !phoneDetected2 &&
    !keyDetected1 &&
    !keyDetected2 &&
    propertyDetectionTime !== null &&
    Date.now() - propertyDetectionTime > propertyDetectionTimeOut &&
    !propertyDetectionLock
  ) {
    ATFDetectionEnabled = false;
    propertyDetectionLock = false;
    propertyDetectionTime = null;

    if (checkPhone) {
      document.getElementById("ATFDetectionLockFailed").innerHTML =
        "Error: Phone was not detected. Please try again.";
    } else if (checkKey) {
      document.getElementById("ATFDetectionLockFailed").innerHTML =
        "Error: Keys were not detected. Please try again.";
    }

    document.getElementById("AFTDetectionLockModal").style.display = "flex";
    document.getElementById("antiTheftDetectionButton").style.border = "";
    document.getElementById("antiTheftDetectionButton").disabled = false;

    ATFAlertAudio.currentTime = 0; // Reset the audio to the beginning
    ATFAlertAudio.play();
    // reset everything
    phoneDetected1 = false;
    phoneDetected2 = false;
    keyDetected1 = false;
    keyDetected2 = false;
  } else if (
    checkPhone &&
    checkKey &&
    (!(phoneDetected1 || phoneDetected2) || !(keyDetected1 || keyDetected2)) &&
    propertyDetectionTime !== null &&
    Date.now() - propertyDetectionTime > propertyDetectionTimeOut &&
    !propertyDetectionLock
  ) {
    ATFDetectionEnabled = false;
    propertyDetectionLock = false;
    propertyDetectionTime = null;

    if (!phoneDetected1 && !phoneDetected2 && !keyDetected1 && !keyDetected2) {
      document.getElementById("ATFDetectionLockFailed").innerHTML =
        "Error: Phone and Keys were not detected. Please try again.";
    } else if (!phoneDetected1 && !phoneDetected2) {
      document.getElementById("ATFDetectionLockFailed").innerHTML =
        "Error: Phone was not detected. Please try again.";
    } else {
      document.getElementById("ATFDetectionLockFailed").innerHTML =
        "Error: Keys were not detected. Please try again.";
    }

    document.getElementById("AFTDetectionLockModal").style.display = "flex";
    document.getElementById("antiTheftDetectionButton").style.border = "";
    document.getElementById("antiTheftDetectionButton").disabled = false;

    ATFAlertAudio.currentTime = 0; // Reset the audio to the beginning
    ATFAlertAudio.play();
          
    // reset everything
    phoneDetected1 = false;
    phoneDetected2 = false;
    keyDetected1 = false;
    keyDetected2 = false;
  }
}

// function to the anti-theft alert
function closeFallATFAlarm() {
  buttonPressSoundOff.play();
  buttonPressSoundOff.currentTime = 0;
  propertyAlertCancel = true;
  ATFAlarmAudio.pause();
  ATFAlarmAudio.currentTime = 0;
  ATFAlarmAudio.pause();

  fallAlarmAudio.currentTime = 0;
  document.getElementById("theftDetectionModal").style.display = "none";
}

// function to close fall detection lock alert
function closeATFDetectionLockAlert() {
  buttonPressSoundOff.play();
  buttonPressSoundOff.currentTime = 0;
  document.getElementById("AFTDetectionLockModal").style.display = "none";
}

// object detection logic

// function to start object detection mode
function startObjectDetectionMode() {
  if (!objectModeEnabled) {
    buttonPressSound.play();
    buttonPressSound.currentTime = 0;
    document.getElementById("objectDetectionButton").style.border =
      "0.5rem solid green";
  } else {
    buttonPressSoundOff.play();
    buttonPressSoundOff.currentTime = 0;
    document.getElementById("objectDetectionButton").style.border = "";
  }

  objectModeEnabled = !objectModeEnabled;
}

// object detection mode function
function objectDetection(markers, context, canvas) {
  // get our object markers if they are even available
  const marker84 = markers.find((marker) => marker.id === objMarker1);
  const marker85 = markers.find((marker) => marker.id === objMarker2);
  const marker86 = markers.find((marker) => marker.id === objMarker3);

  if (marker84) {
    drawCorners([marker84], context, marker84Color);
  }
  if (marker85) {
    drawCorners([marker85], context, marker85Color);
  }
  if (marker86) {
    drawCorners([marker86], context, marker86Color);
  }

  // this nested function will process all the object markers we find
  function processObject(marker) {
    let color = "blue";

    // get the distance
    const objDistance = showDistance(marker);
    // get the x coordinate position of the marker
    const objXcoordinate = getCornerPosition(marker, context, canvas);
    
    console.log(objDistance);
    console.log(objXcoordinate);

    if (objDistance < 265) {
      if (Date.now() - objDetectionAlertTime > 2000) {
        objDetectionAlert.currentTime = 0;
        objDetectionAlert.play();
        objDetectionAlertTime = Date.now();
      }

      color = "red";
      if (objXcoordinate > 15) {
        objRight = true;
      } else if (objXcoordinate < -15) {
        objLeft = true;
      } else {
        objMid = true;
      }
    } else if (objDistance < 385) {
      color = "orange";
    } else {
      color = "blue";
    }
    return color;
  }

  // call the function
  if (Date.now() - objDetectionTime > objTime) {
    objRight = false;
    objLeft = false;
    objMid = false;

    if (marker84) {
      marker84Color = processObject(marker84);
    }

    if (marker85) {
      marker85Color = processObject(marker85);
    }

    if (marker86) {
      marker86Color = processObject(marker86);
    }
    objDetectionTime = Date.now();

    // determine where the markers are on screen

    // all across the screen
    if (objRight && objLeft && objMid) {
      document.getElementById("objectDetect").innerHTML =
        "Objects detected in front!";
      // just left and right
    } else if (objRight && objLeft && !objMid) {
      document.getElementById("objectDetect").innerHTML =
        "Objects detected to the left and right!";

      // just right and mid
    } else if (objRight && !objLeft && objMid) {
      document.getElementById("objectDetect").innerHTML =
        "Objects detected to the front and right!";

      // just left and mid
    } else if (!objRight && objLeft && objMid) {
      document.getElementById("objectDetect").innerHTML =
        "Objects detected to the front and left!";

      // just right
    } else if (objRight) {
      document.getElementById("objectDetect").innerHTML =
        "Object detected to the right!";

      // just left
    } else if (objLeft) {
      document.getElementById("objectDetect").innerHTML =
        "Object detected to the left!";

      // just mid
    } else if (objMid) {
      document.getElementById("objectDetect").innerHTML =
        "Object detected to the front!";

      // none
    } else {
      document.getElementById("objectDetect").innerHTML = "";
    }
  }
}

window.onload = onLoad;
