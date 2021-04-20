const root = '../../';
const utils = require('../testing-utils.js');

// ideally, use fake timers for this test, but 'modern' timers that work
// with performance.now() break something in the first test. wait for fix?
//jest.useFakeTimers('modern');
//jest.useFakeTimers();

beforeEach(function(){
  require(root + 'jspsych.js');
  require(root + 'plugins/jspsych-html-keyboard-response.js');
});

describe('minimum_valid_rt parameter', function(){
  test('has a default value of 0', function(){
    var t = {
      type: 'html-keyboard-response',
      stimulus: 'foo'
    }

    var t2 = {
      type: 'html-keyboard-response',
      stimulus: 'bar'
    }

    jsPsych.init({timeline: [t,t2]});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
    utils.pressKey('a');
  });

  test('correctly prevents fast responses when set', function(done){
    var t = {
      type: 'html-keyboard-response',
      stimulus: 'foo'
    }

    var t2 = {
      type: 'html-keyboard-response',
      stimulus: 'bar'
    }

    jsPsych.init({timeline: [t,t2], minimum_valid_rt: 100});

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    utils.pressKey('a');
    expect(jsPsych.getDisplayElement().innerHTML).toMatch('foo');
    setTimeout(function(){
      utils.pressKey('a');
      expect(jsPsych.getDisplayElement().innerHTML).toMatch('bar');
      utils.pressKey('a');
      done();
    }, 100)
    
  });

  test('correctly prevents fast responses when set and the WebAudio clock is used', function(done) {

    // not calling jsPsych.init so need to mock jsPsych.initSettings, which is used internally by getKeyboardResponse
    // mock once for each call to getKeyboardResponse / utils.pressKey 
    jsPsych.initSettings = jest.fn(function() { return {minimum_valid_rt: 500, case_sensitive_responses: false}; });
    var audio_context_start_time = 0;
    var audio_context = {
      currentTime: audio_context_start_time + 0.1
    };
    var callback_fn = jest.fn();

    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: callback_fn,
      valid_responses: ['a'],
      rt_method: 'audio',
      persist: false,
      audio_context: audio_context,
      audio_context_start_time: audio_context_start_time,
      allow_held_key: false
    });
    utils.pressKey('a');
    expect(callback_fn).not.toHaveBeenCalled();

    audio_context.currentTime = audio_context_start_time + 2;
    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: callback_fn,
      valid_responses: ['a'],
      rt_method: 'audio',
      persist: false,
      audio_context: audio_context,
      audio_context_start_time: audio_context_start_time,
      allow_held_key: false
    });
    utils.pressKey('a');
    setTimeout(function() {
      expect(callback_fn).toHaveBeenCalledWith({key:'a', rt:2000});
      done();
    }, 200);
    

  });
});