function sketchSignal(processing) {
  var width = processing.width;
  var height = processing.height;

  var centerX = width / 2, centerY = height / 2;
  signal.setSignal(signalUtils.meandrSignal(startParams.period, startParams.xspacing, Math.floor(width / startParams.xspacing)));
  var amplitude = Math.round(height / 3);
  var counter = 0;

  function drawWave() {
    _.each(signal.actualSignal, function (value, index, values) {
      value = value * amplitude;
      processing.ellipse(index * startParams.xspacing, centerY + value, startParams.xspacing, startParams.xspacing);
      if (values[index + 1] && values[index + 1]*amplitude !== value) {
        processing.line(index * startParams.xspacing, centerY + value, index * startParams.xspacing, centerY + values[index + 1] * amplitude);
      }
    });
  }

  processing.draw = function () {

    // erase background
    processing.background(224);
    counter += 1;
    counter = signal.calculateSignal(counter);
    drawWave();
  };
}

function sketchSpectrum(processing) {
  var width = processing.width;
  var height = processing.height;
  var amplitude = Math.round(height / 3);

  processing.scale(1, -1);
  processing.translate(0, -height);

  function drawWave() {
    _.each(signal.signalSpectrum, function (value, index) {
      var xValue = index * startParams.xspacing;
      processing.line(xValue, value * amplitude, xValue, 0);
    });
  }

  processing.draw = function () {

    // erase background
    processing.background(224);
    processing.stroke(1);
    signal.calculateSpectrum();
    drawWave();
  };
}

function sketchRecreatedSignal(processing) {
  var width = processing.width;
  var height = processing.height;
  var amplitude = Math.round(height / 3);

  var centerX = width / 2, centerY = height / 2;


  function drawWave() {
    _.each(signal.reconstructedSignal, function (value, index, values) {
      value = value * amplitude;
      var xValue = index * startParams.xspacing;
      processing.ellipse(xValue, centerY + value, 1, 1);
      if (values[index + 1] && values[index + 1]*amplitude !== value) {
        processing.line(xValue, centerY + value, xValue, centerY + values[index + 1] * amplitude);
      }
    });
  }

  processing.draw = function () {

    // erase background
    processing.background(224);
    processing.stroke(1);
    drawWave();
  };
}

var signalEl = document.getElementById("signal");
// attaching the sketchProc function to the canvas
new Processing(signalEl, sketchSignal);

var spectrumEl = document.getElementById("spectrum");
// attaching the sketchProc function to the canvas
new Processing(spectrumEl, sketchSpectrum);
//
var recreatedSignalEl = document.getElementById("recreatedSignal");
// attaching the sketchProc function to the canvas
new Processing(recreatedSignalEl, sketchRecreatedSignal);