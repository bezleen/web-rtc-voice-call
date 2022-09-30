from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
import pydash as py_

ROOM = "hlo"
USERS =[]
def push_user(name,sid):
    data = {
        "name": name,
        "sid": sid
    }
    USERS.append(data)
def pull_user(sid):
    index = py_.find_index(USERS, lambda x: x['sid'] == sid)
    py_.unset(USERS, index)


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on('connect', namespace='/rtc')
def connect(*args, **kwargs):
    sid = request.sid
    print(sid)

@socketio.on('disconnect', namespace='/rtc')
def disconnect(*args, **kwargs):
    sid = request.sid
    pull_user(sid)
    emit("users", USERS, to=ROOM)

@socketio.on('join', namespace='/rtc')
def join(*args, **kwargs):
    sid = request.sid
    name = py_.get(args[0],"name")
    join_room(ROOM)
    push_user(name,sid)
    print(USERS)
    emit("users", USERS, to=ROOM)
    
@socketio.on('candidate', namespace='/rtc')
def candidate(*args, **kwargs):
    print("candidate")
    print(args,kwargs)

@socketio.on('offer', namespace='/rtc')
def offer(*args, **kwargs):
    print(args)
    caller_name = py_.get(args[0],"name")
    callee = args[1]
    caller_sdp = args[2]
    callee_info = py_.find(USERS, lambda x: x["name"]==callee)
    callee_sid = py_.get(callee_info, "sid")
    join_room(callee_sid,callee_sid)
    emit("receive_offer",{"caller":caller_name,"caller_sdp":caller_sdp},to=callee_sid)

@socketio.on('accept_offer', namespace='/rtc')
def candidate(*args, **kwargs):
    callee_name = py_.get(args[0],"name")
    caller = args[1]
    callee_sdp = args[2]
    caller_info = py_.find(USERS, lambda x: x["name"]==caller)
    caller_sid = py_.get(caller_info, "sid")
    join_room(caller_sid,caller_sid)
    emit("offer_accepted",{"callee":callee_name,"callee_sdp":callee_sdp},to=caller_sid)


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000)
