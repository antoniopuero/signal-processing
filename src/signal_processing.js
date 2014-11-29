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

var mixSignalWithMSequence = function (yvalues, mSequence) {
  var sync = syncronize();


  sync.init({
    firstFrequency: 1,
    firstSequence: yvalues,
    secondFrequency: mSequence.length,
    secondSequence: mSequence
  });

  var result = [];
  _.each(_.range(mSequence.length * 4), function () {

      sync.nextStep();
      var syncRes = sync.getSyncResults();

      result.push(mathUtils.xor.call(this, syncRes));
  });


  return {
    noizedSignal: result,
    xspace: sync.getFrequencyRate()
  };
};

var addRandomNoize = function (signal) {
  return _.map(signal, function (value) {
    return mathUtils.add(value, Math.random().toPrecision(1));
  });
};