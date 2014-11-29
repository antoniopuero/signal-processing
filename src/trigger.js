var triggerEntity = function (options) {

  var previousValue;
  var newValue;

  var setValue = function (value) {
    newValue = value;
  };

  var getValue = function () {
    var value = previousValue;
    previousValue = newValue;
    return value;
  };

  var getWithoutReassign = function () {
    return previousValue;
  };

  var set = function () {
    previousValue = 1;
  };

  var reset = function () {
    previousValue = 0;
  };

  return {
    setValue: setValue,
    getValue: getValue,
    getWithoutReassign: getWithoutReassign,
    set: set,
    reset: reset
  }
};

var feedbackFunction = function (values) {
  return _.reduce(values, function (result, value) {
    return result ^ value;
  });
};

var triggersChain = function () {
  var triggers = [];
  var feedback;

  var initChain = function (triggersNumber, triggerIndexes) {
    for (var i =0; i < triggersNumber; i+= 1) {
      addTriggers(triggerEntity());
    }
    feedback = feedBackInit(triggerIndexes, feedbackFunction);
  };

  var addTriggers = function (newTriggers) {
    if (_.isObject(newTriggers)) {
      triggers.push(newTriggers);
    } else if (_.isArray(newTriggers)) {
      triggers = triggers.concat(newTriggers);
    } else {
      throw new Error('unsupported type of trigger');
    }
  };

  var feedBackInit = function (triggerIndexes, feedbackFunction) {
    return function () {

      var values = _.map(triggerIndexes, function (index) {
        return getTriggerValue(index - 1);
      });

      return feedbackFunction.call(this, values);
    }
  };

  var moveValueThroughChain = function () {
    _.each(triggers, function (trigger, index) {
      if (index == 0) {
//        console.log(feedback(), 'feedback');
        trigger.setValue(feedback());
      } else {
//        console.log(triggers[index - 1].getWithoutReassign(), 'regular');
        trigger.setValue(triggers[index - 1].getValue());
      }
    });

    return _.last(triggers).getValue();
  };

  var getTriggerValue = function (index) {
    if (!triggers[index]) {
      throw new Error('out of range');
    } else {
      return triggers[index].getWithoutReassign();
    }
  };

  var getSequence = function () {
    var resultSequence = [];

    for (var i = 0, max = Math.pow(2, triggers.length) - 1; i < max; i += 1) {
      resultSequence.unshift(moveValueThroughChain());
    }
    return resultSequence;
  };

  var set = function () {
    _.each(triggers, function (trigger) {
      trigger.set();
    });
  };

  var reset = function () {
    _.each(triggers, function (trigger) {
      trigger.reset();
    });
  };

  var isMSequence = function (sequence) {
    var zerosCount = 1, onesCount = 0;
    _.each(sequence, function (value) {
      value ? onesCount ++ : zerosCount ++;
    });
    console.log(zerosCount, onesCount)
    return zerosCount === onesCount;
  };

  return {
    initChain: initChain,
    addTriggers: addTriggers,
    moveValueThroughChain: moveValueThroughChain,
    getTriggerValue: getTriggerValue,
    set: set,
    reset: reset,
    getSequence: getSequence,
    isMSequence: isMSequence
  }
};