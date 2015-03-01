var signalInitialization = {
  signal: [],
  actualSignal: [],
  signalSpectrum: [],
  reconstructedSignal: [],
  signalWithNoise: [],
  actualSignalWithNoise: [],
  signalWithNoiseSpectrum: [],
  reconstructedsignalWithNoise: [],
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
  period: 128,
  frequency: 128
};

//signalInitialization.setSignal(signalUtils.meandrSignal(startParams.period, startParams.xspacing));
