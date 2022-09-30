pc = new RTCPeerConnection({
    sdpSemantics: 'unified-plan',
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
});

// pc.createOffer().then(function (offer) {
//     console.log(offer)
//     return pc.setLocalDescription(new RTCSessionDescription(offer));
// });
let message = { 'type': 'offer', 'sdp': 'v=0\r\no=- 256273275898838157 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\n' };
pc.setRemoteDescription(new RTCSessionDescription(message));
// pc.signalingState = "have-remote-offer";
console.log(pc);
pc.createAnswer().then(function (answer) {
    console.log(answer);
    return pc.setLocalDescription(answer);
});


