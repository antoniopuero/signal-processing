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
    var fft = new DFT(mathUtils.findTheCloserBinary(this.actualSignal.length), 2* mathUtils.findTheCloserBinary(this.actualSignal.length));
    fft.forward(this.actualSignal);
    this.signalSpectrum = fft.spectrum;
    this.reconstructedSignal = fft.realSignal;
  }

};

var startParams = {
  theta: 0,
  xspacing: 1,
  period: 50,
  frequency: 50
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

var mainInit = function (mSequence, sequence_2) {

  var signalPlot = _.map(signal.signal, function (val, index) {
    return [index, val];
  });

  $.plot($('#signalPlot'), [signalPlot],{});
  var spectrumCustom = new DFT(mathUtils.findTheCloserBinary(signal.signal.length), 2 * mathUtils.findTheCloserBinary(signal.signal.length));
  spectrumCustom.forward(signal.signal);

  var spectrumPlot = _.map(spectrumCustom.spectrum, function (val, index) {
    return [index, val];
  });

  $.plot($('#spectrumPlot'), [spectrumPlot],{series: {bars: {show: true}}});

  var noizedSignal = mixSignalWithMSequence(signal.signal, startParams.period, mSequence).noizedSignal;

  //noizedSignal = addRandomNoize(noizedSignal);

  var signalWithNoizePlot = _.map(noizedSignal, function (val, index) {
    return [index, val];
  });

  $.plot($('#signalWithNoizePlot'), [signalWithNoizePlot], {});

  var noizedSignalSpectrum = new DFT(mathUtils.findTheCloserBinary(noizedSignal.length), 2 * mathUtils.findTheCloserBinary(noizedSignal.length));
  noizedSignalSpectrum.forward(noizedSignal);


  var signalWithNoizeSpectrumPlot = _.map(noizedSignalSpectrum.spectrum, function (val, index) {
    return [index, val];
  });

  var dataset = [{
    "label": "Signal",
    data: spectrumPlot,
    color: 0
  }, {
    label: "Signal with noize",
    data: signalWithNoizeSpectrumPlot,
    color: 1
  }];

  $.plot($('#signalWithNoizeSpectrumPlot'), dataset, {series: {bars: {show: true}}});

  var correlation = function (base, otherSignal) {

    otherSignal = otherSignal ? otherSignal : base;
    var step = Math.floor(otherSignal.length / 2);
    var maxStep = otherSignal.length;


    var correlationRes = _.map(base, function () {

      var swapedSignal = otherSignal.slice(step).concat(otherSignal.slice(0, step));
      var count = 0;
      _.each(swapedSignal, function (value, index) {
        if (value === base[index]) {
          count += 1;
        }
      });


      step += 1;
      step = step % maxStep;

      return count / maxStep;
    });

    return correlationRes;
  };

  var autoCorrelation = function (signal) {
    var closestBinary = mathUtils.findTheCloserBinary(signal.length);
    var fft = new FFT(closestBinary, 2* closestBinary);
    fft.forward(signal);

    var real = _.map(fft.real, function(value, index) {
      return value * value + fft.imag[index] * fft.imag[index];
    });

    var imag = _.map(real, function () {
      return 0;
    });

    return fft.inverse(real, imag);
  };

  var signalAutoCorrelationPlot = _.map(autoCorrelation(signal.signal), function (val, index) {
    return [index, val];
  });

  $.plot($('#signalAutoCorrelation'), [signalAutoCorrelationPlot], {});

  var signalWithNoizeAutoCorrelation = _.map(autoCorrelation(noizedSignal), function (val, index) {
    return [index, val];
  });

  $.plot($('#signalWithNoizeAutoCorrelation'), [signalWithNoizeAutoCorrelation], {});

  var noizedSignal_2 = mixSignalWithMSequence(signal.signal, startParams.period, sequence_2).noizedSignal;

  noizedSignal_2 = addRandomNoize(noizedSignal_2);

  //var signalWithNoizeCorrelation = _.map(correlation(noizedSignal, noizedSignal_2), function (val, index) {
  //  return [index, val];
  //});
  //
  //$.plot($('#signalWithNoizeCorrelation'), [signalWithNoizeCorrelation], {});
};