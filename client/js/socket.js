// Socketio
let name = prompt("Input your name: ", "Guest");

// let socket = io.connect("http://0.0.0.0:5000/rtc");
let socket = io.connect("https://7114-2a09-bac0-23-00-815-bc3.ngrok.io/rtc");
let rawPayload = { name };
$("#user_name").html(name);
const $users_online = $("#userOnline > ul");

socket.emit("join", rawPayload);

socket.on("connect_error", () => {
    socket.io.opts.transports = ["polling", "websocket"];
});

socket.on("connect", () => {
    console.log("Connected");
})

socket.on("users", (data) => {
    // console.log({ data });

    if (!data) return;
    $users_online.empty();

    // data.
    data.forEach(el => {
        // console.log(el);
        pushUser(el.name);
    });
})

socket.on("receive_offer", (data) => {
    // console.log(`${data.caller} want to call you!!!`);
    // console.log(data);
    let confirm = prompt(`${data.caller} want to call you!!!`, "OK");
    console.log(confirm);
    if (confirm == "OK") {
        peerConn.setRemoteDescription(new RTCSessionDescription(data.caller_sdp.sdp));
        peerConn.createAnswer().then(function (offer) {
            return peerConn.setLocalDescription(offer);
        });
        peerConn.addIceCandidate(new RTCIceCandidate({
            candidate: data.caller_sdp.ice.candidate,
            sdpMLineIndex: data.caller_sdp.ice.label,
            sdpMid: data.caller_sdp.ice.id
        }));
        caller_name = data.caller;
        console.log(peerConn);
    }
    // peerConn.setRemoteDescription(new RTCSessionDescription(data.caller_sdp.sdp));
    // peerConn.createAnswer().then(function (offer) {
    //     return peerConn.setLocalDescription(offer);
    // });
    // peerConn.addIceCandidate(new RTCIceCandidate({
    //     candidate: data.caller_sdp.ice.candidate,
    //     sdpMLineIndex: data.caller_sdp.ice.label,
    //     sdpMid: data.caller_sdp.ice.id
    // }));
    // caller_name = data.caller;
    // console.log(peerConn);
})


socket.on("offer_accepted", (data) => {
    console.log(data);
    // alert(`${data.callee} accepted your call!!!`);
    peerConn.setRemoteDescription(new RTCSessionDescription(data.callee_sdp.sdp));
    peerConn.addIceCandidate(new RTCIceCandidate({
        candidate: data.callee_sdp.ice.candidate,
        sdpMLineIndex: data.callee_sdp.ice.label,
        sdpMid: data.callee_sdp.ice.id
    }));
    console.log(peerConn);
})


// HANDLE ONLINE USER
function pushUser(user) {
    $users_online.append(`<li><input type="radio" name="radio_user" value=${user} ><span>${user}</span></li>`);
}