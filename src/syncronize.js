var syncronize = function () {
  var firstSequence, secondSequence, firstFrequency, secondFrequency, step;
  var init = function (options) {
    firstSequence = options.firstSequence;
    secondSequence = options.secondSequence;
    firstFrequency = options.firstFrequency;
    secondFrequency = options.secondFrequency;

    resetStep();

  };

  var resetStep = function () {
    step = 0;
  };

  var setStep = function (stepNum) {
    step = stepNum;
  };

  var nextStep = function () {
    step += 1;
  };

  var getSyncResults = function () {
    var firstIndex = Math.floor(step * firstFrequency / secondFrequency);
    var secondIndex = step;

    return [firstSequence[firstIndex], secondSequence[secondIndex]];
  };

  return {
    init: init,
    setStep: setStep,
    resetStep: resetStep,
    nextStep: nextStep,
    getSyncResults: getSyncResults
  };
};