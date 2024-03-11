import {CodeRecord, CodePlay} from '../src';

/**
 * Listen on CodeMirror recording
 */

CodeMirror.setOption('lineWrapping:true')

const recordCodeMirror = CodeMirror.fromTextArea(
    document.getElementById('editor-record'), {
      mode: 'javascript',
      autoCloseBrackets: true,
      lineWrapping: true
    },
);

const codeRecorder = new CodeRecord(recordCodeMirror);
let records = '';

codeRecorder.listen();

document.getElementById('submission').onclick = function() {
  records = codeRecorder.getRecords();
  console.log(JSON.parse(records));
  if (records !== '') {
    console.log('operations added');
    codePlayer.addOperations(records);
    records = '';
  } else {
    console.log('no operation to be added');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const box = document.getElementById('box');
  const panel = document.getElementById('panel');

  box.addEventListener('click', function() {
    panel.style.right = '0'; // Show panel by setting right position to 0
  });

  panel.addEventListener('click', function(e) {
    if (e.target === panel) {
      panel.style.right = '-200px'; // Hide panel if clicked outside of content
    }
  });
});

document.getElementById('ask').addEventListener("click", function() {
  chatbox = document.getElementById('chat-area')
  btn = document.getElementById('ask')

  chatbox.classList.remove("side-panel-hidden")   
  chatbox.classList.add("side-panel")
  
  btn.classList.remove('side-panel')
  btn.classList.add("side-panel-hidden")
});

document.getElementById('hide').onclick = function() {
  console.log("hide button clicekd")
  chatbox = document.getElementById('chat-area')
  btn = document.getElementById('ask')

  chatbox.classList.remove("side-panel")
  chatbox.classList.add("side-panel-hidden")
  
  btn.classList.remove('side-panel-hidden')
  btn.classList.add("side-panel")
}

// Original API in case I need it
// document.getElementById('play').onclick = function() {
//   console.log('start playing');
//   codePlayer.play();
// };

// document.getElementById('pause').onclick = function() {
//   console.log('pause playing');
//   codePlayer.pause();
// };

// document.getElementById('speed').onchange = function() {
//   const speed = document.getElementById('speed').value;
//   console.log('change speed to', speed);
//   codePlayer.setSpeed(speed);
// };

// const progressBar = document.getElementById('progress-bar');
// const progressBarSlider = document.getElementById('progress-bar-slider');
// const progressBarWidth = progressBar.offsetWidth;

// setInterval(() => {
//   const currentTime = codePlayer.getCurrentTime();
//   const duration = codePlayer.getDuration();
//   const playedProgress = progressBarWidth * (currentTime / duration);
//   if (currentTime >= 0) {
//     progressBarSlider.style.left = playedProgress + 'px';
//   }
// }, 100);

// progressBar.onclick = function({
//   offsetX: playedProgress,
// }) {
//   const percentage = playedProgress / progressBarWidth;
//   const seekToTime = percentage * codePlayer.getDuration();
//   progressBarSlider.style.left = playedProgress + 'px';
//   console.log('seek to: ', seekToTime);
//   codePlayer.seek(seekToTime);
// };

// const playCodeMirror = CodeMirror.fromTextArea(
//     document.getElementById('editor-play'), {
//       readOnly: true,
//       mode: 'javascript',
//       autoCloseBrackets: true,
//     },
// );

// const codePlayer = new CodePlay(playCodeMirror, {
//   maxPause: 3000,
//   extraActivityHandler: (extraOperation) => {
//     console.log(extraOperation);
//   },
// });

// codePlayer.on('play', () => {
//   console.log('play event triggered');
// });

// codePlayer.on('pause', () => {
//   console.log('pause event triggered');
// });

// codePlayer.on('seek', () => {
//   console.log('seek event triggered');
// });

// codePlayer.on('stop', () => {
//   console.log('stop event triggered');
// });

recordCodeMirror.setValue('Please write your response to the essay question here. When finished, click Recorder: Get records then Player: Add operations.');
