

var mainInit = function (signal, period, mSequence, sequence_2) {

  signalInitialization.setSignal(signalUtils.setCustomSignal(signal, period));

  var signalPlot = _.map(signalInitialization.signal, function (val, index) {
    return [index, val];
  });

  $.plot($('#signalPlot'), [signalPlot],{});
  var spectrumCustom = new DFT(mathUtils.findTheCloserBinary(signalInitialization.signal.length), 2 * mathUtils.findTheCloserBinary(signalInitialization.signal.length));
  spectrumCustom.forward(signalInitialization.signal);

  var spectrumPlot = _.map(spectrumCustom.spectrum, function (val, index) {
    return [index, val];
  });

  $.plot($('#spectrumPlot'), [spectrumPlot],{series: {bars: {show: true}}});

  var noizedSignal = signalUtils.mixSignalWithMSequence(signalInitialization.signal, startParams.period, mSequence).noizedSignal;

  noizedSignal = signalUtils.addRandomNoize(noizedSignal);

  var signalWithNoisePlot = _.map(noizedSignal, function (val, index) {
    return [index, val];
  });

  $.plot($('#signalWithNoisePlot'), [signalWithNoisePlot], {});

  var noizedSignalSpectrum = new DFT(mathUtils.findTheCloserBinary(noizedSignal.length), 2 * mathUtils.findTheCloserBinary(noizedSignal.length));
  noizedSignalSpectrum.forward(noizedSignal);


  var signalWithNoiseSpectrumPlot = _.map(noizedSignalSpectrum.spectrum, function (val, index) {
    return [index, val];
  });

  var dataset = [{
    "label": "Signal",
    data: spectrumPlot,
    color: 0
  }, {
    label: "Signal with noize",
    data: signalWithNoiseSpectrumPlot,
    color: 1
  }];

  $.plot($('#signalWithNoiseSpectrumPlot'), dataset, {series: {bars: {show: true}}});


  var signalAutoCorrelationPlot = _.map(signalUtils.autoCorrelation(signalInitialization.signal), function (val, index) {
    return [index, val];
  });

  $.plot($('#signalAutoCorrelation'), [signalAutoCorrelationPlot], {});

  var signalWithNoiseAutoCorrelation = _.map(signalUtils.autoCorrelation(noizedSignal), function (val, index) {
    return [index, val];
  });

  $.plot($('#signalWithNoiseAutoCorrelation'), [signalWithNoiseAutoCorrelation], {});
};