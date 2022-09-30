'use strict';
// socket.emit('candidate', "hello");
let localStream;
let caller_name;
let peerConn;
const mediaStreamConstraints = {
  video: false,
  audio: true
};
const configuration = {
  sdpSemantics: 'unified-plan',
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
};



const localaudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const testButton = document.getElementById('testButton');
const stopTestButton = document.getElementById('stopTestButton');
const initButton = document.getElementById('initButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangUpButton');

localaudio.disabled = true;
testButton.disabled = false;
stopTestButton.disabled = true;


// TEST AUDIO
function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream;
  localaudio.srcObject = mediaStream;
}


function handleLocalMediaStreamError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function testAction() {
  testButton.disabled = true;
  stopTestButton.disabled = false;
  localaudio.disabled = false;
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream)
    .catch(handleLocalMediaStreamError)
  // localaudio.play();

}


function stoptestAction() {
  testButton.disabled = false;
  stopTestButton.disabled = true;
  localStream.getTracks().forEach((track) => {
    track.stop();
  });
  // localaudio.pause();
  localaudio.disabled = true;
}

testButton.addEventListener('click', testAction);
stopTestButton.addEventListener('click', stoptestAction);
initButton.addEventListener('click', initializeCall);
callButton.addEventListener('click', makeOffer);
hangupButton.addEventListener('click', {});


// RTC PEER CONNECTION


function initializeCall() {
  console.log("Initialize Call");
  peerConn = new RTCPeerConnection(configuration);
  // Setup ice handling 
  peerConn.onicecandidate = function (event) {
    // console.log(event.candidate);
    if (event.candidate) {
      if (peerConn.localDescription.type == 'offer') {
        let callee = $('input[name="radio_user"]:checked').val();
        socket.emit("offer", rawPayload, callee, {
          sdp: peerConn.localDescription,
          ice: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
          }
        });
      }
      else {
        socket.emit("accept_offer", rawPayload, caller_name, {
          sdp: peerConn.localDescription,
          ice: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
          }
        });
        console.log(peerConn);
      }

      // socket.emit("candidate", {
      //   label: event.candidate.sdpMLineIndex,
      //   id: event.candidate.sdpMid,
      //   candidate: event.candidate.candidate
      // });
    }
  };

  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(stream => {
      stream.getTracks().forEach(track => peerConn.addTrack(track, stream));
    })
    .catch(handleLocalMediaStreamError)
  // peerConn.addStream(localStream);
  //when a remote user adds stream to the peer connection, we display it 
  peerConn.onaddstream = function (e) {
    // remoteAudio.src = window.URL.createObjectURL(e.stream);
    remoteAudio.srcObject = e.stream;
  };

}

initializeCall();


function makeOffer() {
  peerConn.createOffer().then(function (offer) {
    return peerConn.setLocalDescription(offer);
  });
  console.log(peerConn);
}