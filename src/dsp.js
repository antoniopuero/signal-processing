signalProcessing = (function () {

  var code = function (inputSignal) {
    var symbols = inputSignal.split('');
    var codeSignal = [];
    _.each(symbols, function (symbol, index) {
      codeSignal[index] = parseInt(symbol, 10) ^ (parseInt(codeSignal[index - 1]) || 0);
    });
    return codeSignal.join('');
  };

  var decode = function (codedSignal) {
    var symbols = codedSignal.split('');
    var decodeSignal = [];
    _.each(symbols, function (symbol, index) {
      decodeSignal[index] = parseInt(symbol, 10) ^ (parseInt(symbols[index - 1]) || 0);
    });
    return decodeSignal.join('');
  };

  var generateSignal = function () {

  };

  var modulateSignal = function () {

  };

  var demodulateSignal = function () {

  };

  return {
    code: code,
    decode: decode,
    generateSignal: generateSignal,
    modulateSignal: modulateSignal,
    demodulateSignal: demodulateSignal
  };
})();