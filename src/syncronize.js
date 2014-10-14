var syncronize = function () {
  var firstSequence, secondSequence, firstFrequency, secondFrequency, step1, step2, frequenceRate;
  var init = function (options) {
    firstSequence = options.firstSequence;
    secondSequence = options.secondSequence;
    firstFrequency = options.firstFrequency;
    secondFrequency = options.secondFrequency;

    frequenceRate = firstFrequency/secondFrequency;

    resetSteps();

  };

  var resetSteps = function () {
    step1 = 0;
    step2 = 0;
  };

  var setStep1 = function (stepNum) {
    step1 = stepNum;
  };

  var setStep2 = function (stepNum) {
    step2 = stepNum;
  };

  var nextStep = function () {
    step1 += 1;
    step2 += 1;
  };

  var getSyncResults = function () {

    if (firstSequence[Math.floor(step1 * frequenceRate)] === undefined) {
      setStep1(0);
    }

    if (secondSequence[step2] === undefined) {
      setStep2(0);
    }
    return [firstSequence[Math.floor(step1 * frequenceRate)], secondSequence[step2]];
  };

  return {
    init: init,
    setStep1: setStep1,
    setStep2: setStep2,
    resetSteps: resetSteps,
    nextStep: nextStep,
    getSyncResults: getSyncResults,
    getFrequencyRate: function () {
      return frequenceRate;
    }
  };
};