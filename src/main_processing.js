var mathUtils = {
  xor: function (val1, val2) {
    return Math.abs(val1) ^ Math.abs(val2);
  },
  add: function (val1, val2) {
    return val1 + val2;
  },
  sign: function (x) {
  return x ? x < 0 ? -1 : 1 : 0;
  }
};

var goldChain = (function () {
  var tc = triggersChain();
  tc.initChain(10, [3, 10], mathUtils.xor);

  tc.set();

  return tc.getSequence(1023);
})();

var meandrSignal = function (period, xspace, n) {
  var dx = (2 * Math.PI / period) * xspace;
  var x = 0;
  var signal = _.map(_.range(period / xspace), function () {
    x += dx;
    return mathUtils.sign(Math.sin(x));
  });

  if (signal.length === 0) {
    throw new Error('memory leak will be caused!');
  }

  var result = [];
  while (result.length < n) {
    result = result.concat(signal);
  }

  result.length = n;

  return result;
};

var initializeNoizedSignal = function (yvalues) {
  var sync = syncronize();


  sync.init({
    firstFrequency: 50,
    firstSequence: yvalues,
    secondFrequency: 1023,
    secondSequence: goldChain
  });

  var result = [];
  _.each(_.range(yvalues.length * 100), function () {
    sync.nextStep();
    var syncRes = sync.getSyncResults();

    result.push(mathUtils.xor.apply(this, syncRes));
  });


  return {
    noizedSignal: result,
    xspace: sync.getFrequencyRate()
  };
};

var signal = {
  signal: [],
  actualSignal: [],
  signalSpectrum: [],
  reconstructedSignal: [],
  signalwithNoize: [],
  actualSignalwithNoize: [],
  signalWithNoizeSpectrum: [],
  reconstructedSignalWithNoize: [],
  setSignal: function (signal) {
    this.signal = signal;
  },
  calculateSignal: function (shift) {
    shift = shift % this.signal.length;
    this.actualSignal = this.signal.slice(shift).concat(this.signal.slice(0, shift));
    return shift;
  },
  calculateSpectrum: function () {
    var fft = new DFT(128, 2048);
    fft.forward(this.actualSignal);
    this.signalSpectrum = fft.spectrum;
    this.reconstructedSignal = fft.realSignal;
  },

  addNoizeToSignal: function () {
    this.signalwithNoize = initializeNoizedSignal(this.signal).noizedSignal;
  },

  getNoizedSignal: function (shift) {
      shift = shift % this.signal.length;
      this.actualSignalwithNoize = _.filter(this.signalwithNoize.slice(shift).concat(this.signal.slice(0, shift)), function (val) {
        return val != -1;
      });
      return shift;
  },

  getRate: function () {
    return Math.floor(this.signalwithNoize.length / this.signal.length);
  },

  calculateSpectrumOfNoized: function (amp) {
    var fft = new DFT(2048, 8192);
    fft.forward(_.map(this.signalwithNoize, function (val) {return val * amp}));
    this.signalWithNoizeSpectrum = fft.spectrum;
    this.reconstructedSignalWithNoize = fft.realSignal;
  }

};

var startParams = {
  theta: 0,
  xspacing: 1,
  period: 50
};

function sketchSignal(processing) {
  var width = processing.width;
  var height = processing.height;

  var centerX = width / 2, centerY = height / 2;
  signal.setSignal(meandrSignal(startParams.period, startParams.xspacing, Math.floor(width / startParams.xspacing)));
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

function sketchNoizedSignal(processing) {
  var width = processing.width;
  var height = processing.height;
  var amplitude = Math.round(height / 3);
  var counter = 0;
  signal.addNoizeToSignal();
  var counterStep = signal.getRate();

  processing.scale(1, -1);
  processing.translate(0, -height);

  var centerX = width / 2, centerY = height / 2;


  function drawWave() {
    _.each(signal.actualSignalwithNoize, function (value, index, values) {
      value *= amplitude;
      var size = width / values.length;
      var xValue = index * size;
      processing.ellipse(xValue, centerY + value, size, size);
      if (values[index + 1] && values[index + 1]*amplitude !== value) {
        processing.line(xValue, centerY + value, xValue, centerY + values[index + 1] * amplitude);
      }
    });
  }

  processing.draw = function () {

    // erase background
    processing.background(224);
    processing.stroke(0.1);
    counter += counterStep;
    counter = signal.getNoizedSignal(counter);
    drawWave();
  };
}


function sketchNoizedSignalSpectrum(processing) {
  var width = processing.width;
  var height = processing.height;
  var amplitude = Math.floor(height /3);
  signal.calculateSpectrumOfNoized(amplitude);

  processing.scale(1, -1);
  processing.translate(0, -height);

  function drawWave() {
    _.each(signal.signalWithNoizeSpectrum, function (value, index, values) {
      var xValue = index * width * 5/ values.length;
      processing.line(xValue, value, xValue, 0);
    });
  }

  processing.draw = function () {

    // erase background
    processing.background(224);
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

var noizedSignalEl = document.getElementById("noizedSignal");
// attaching the sketchProc function to the canvas
new Processing(noizedSignalEl, sketchNoizedSignal);
//
var spectrumOfNoizedSignalEl = document.getElementById("spectrumOfNoizedSignal");
// attaching the sketchProc function to the canvas
new Processing(spectrumOfNoizedSignalEl, sketchNoizedSignalSpectrum);