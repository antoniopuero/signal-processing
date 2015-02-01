var mathUtils = {
  xor: function (values) {
    return _.reduce(values, function (result, val) {
      return result ^ val;
    });
  },
  add: function (val1, val2) {
    return val1 + val2;
  },
  sign: function (x) {
    return x ? x < 0 ? -1 : 1 : 0;
  },

  findTheCloserBinary: function (length) {
    var n = 0;
    while (Math.pow(2, n) <= length - 1) {
      if (length - 1 <= Math.pow(2, n + 1)) {
        break;
      }
      n += 1;
    }
    return Math.pow(2, n+1);
  }
};

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

var mixSignalWithMSequence = function (yvalues, signalPeriod, mSequence) {
  var sync = syncronize();


  sync.init({
    firstFrequency: 1,
    firstSequence: yvalues,
    secondFrequency: mSequence.length,
    secondSequence: mSequence
  });

  var result = [];
  _.each(_.range(mSequence.length), function () {

    _.each(_.range(Math.round(yvalues.length * 2 / signalPeriod)), function () {
      sync.nextStep();
      var syncRes = sync.getSyncResults();

      result.push(mathUtils.xor.call(this, syncRes));
    });
  });


  return {
    noizedSignal: result,
    xspace: sync.getFrequencyRate()
  };
};

var addRandomNoize = function (signal, noizeAmplitude) {
  noizeAmplitude = noizeAmplitude ? noizeAmplitude : 1;
  return _.map(signal, function (value) {
    return mathUtils.add(value, noizeAmplitude * Math.random().toPrecision(1));
  });
};