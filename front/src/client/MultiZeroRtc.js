import SockJS from "sockjs-client";
import Stomp from "stompjs";
import constants from "./constant";
const { signal } = constants;

const respPrefix = "/ws-resp/";
const sendPrefix = "/signal/";

export default class MultiZeroRtc {
  constructor(url, joinCallBack, exitCallBack) {
    // 与WebSocket服务器建立连接的url地址
    this.url = url;
    this.stompClient = null;
    // 用户id，这里使用的是随机生成的id，使用时对应数据库中的用户id
    this.localUserId = Math.random().toString(36).substring(2);
    // 多人音视频通信，远端用户有多个
    this.remoteUserIdList = [];
    this.roomId = -1;
    this.localStream = null;
    this.remoteStreamMap = new Map();
    this.localVideo = document.querySelector("#localVideo");
    this.remoteVideoMap = new Map();
    this.peerConnectionMap = null;
    // 有人加入房间或退出时，前端执行的回调
    this.joinCallBack = joinCallBack;
    this.exitCallBack = exitCallBack;
  }

  getRemoteUserIdList() {
    return this.remoteUserIdList;
  }

  // 连接WebSocket服务器，并监听各信令接口
  createWebsocket() {
    const socket = new SockJS(this.url, null, {
      sessionId: () => this.localUserId,
    });
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, (frame) => {
      this.stompClient.subscribe(
        respPrefix + signal.SIGNAL_TYPE_NEW_PEER + `/${this.localUserId}`,
        (resp) => {
          const msg = JSON.parse(resp.body);
          this.remoteUserIdList.push(msg.remoteUid);
          this.joinCallBack();
          const remoteVideo = document.querySelector(
            "#remoteVideo" + msg.remoteUid
          );
          this.remoteVideoMap.set(msg.remoteUid, remoteVideo);
          // console.log(signal.SIGNAL_TYPE_NEW_PEER, msg);
          // 有新成员加入时，发送offer给他
          this.doOffer(msg.remoteUid);
        }
      );
      this.stompClient.subscribe(
        respPrefix + signal.SIGNAL_TYPE_RESP_JOIN + `/${this.localUserId}`,
        (resp) => {
          const msg = JSON.parse(resp.body);
          this.remoteUserIdList.push(msg.remoteUid);
          this.joinCallBack();
          const remoteVideo = document.querySelector(
            "#remoteVideo" + msg.remoteUid
          );
          this.remoteVideoMap.set(msg.remoteUid, remoteVideo);
          // console.log(signal.SIGNAL_TYPE_RESP_JOIN, msg);
        }
      );
      this.stompClient.subscribe(
        respPrefix + signal.SIGNAL_TYPE_PEER_LEAVE + `/${this.localUserId}`,
        (resp) => {
          const msg = JSON.parse(resp.body);
          this.remoteUserIdList = this.remoteUserIdList.filter((value) => {
            return value != msg.remoteUid;
          });
          this.exitCallBack();
          this.remoteStreamMap.delete(msg.remoteUid);
          const video = this.remoteVideoMap.get(msg.remoteUid);
          video.srcObject = null;
          this.remoteVideoMap.delete(msg.remoteUid);
          const peerConnection = this.peerConnectionMap.get(msg.remoteUid);
          if (peerConnection !== null) {
            peerConnection.close();
          }
          this.peerConnectionMap.delete(msg.remoteUid);
        }
      );
      this.stompClient.subscribe(
        respPrefix + signal.SIGNAL_TYPE_OFFER + `/${this.localUserId}`,
        async (resp) => {
          const msg = JSON.parse(resp.body);
          const remoteUid = msg.uid;
          const desc = JSON.parse(msg.msg);
          // 收到offer时候，将msg的内容设置为远端连接的接口标准，并回复Answer
          if (!this.peerConnectionMap.has(remoteUid)) {
            console.log("订阅到了offer，id是" + remoteUid);
            await this.createPeerConnection(remoteUid);
          }
          const peerConnection = this.peerConnectionMap.get(remoteUid);
          if (peerConnection.remoteDescription === null) {
            await peerConnection.setRemoteDescription(desc);
          }
          await this.doAnswer(remoteUid);
        }
      );
      this.stompClient.subscribe(
        respPrefix + signal.SIGNAL_TYPE_ANSWER + `/${this.localUserId}`,
        async (resp) => {
          const msg = JSON.parse(resp.body);
          const desc = JSON.parse(msg.msg);
          const remoteUid = msg.uid;
          const peerConnection = this.peerConnectionMap.get(remoteUid);
          // 收到Answer
          if (peerConnection.remoteDescription === null) {
            await peerConnection.setRemoteDescription(desc);
          }
        }
      );
      this.stompClient.subscribe(
        respPrefix + signal.SIGNAL_TYPE_CANDIDATE + `/${this.localUserId}`,
        async (resp) => {
          const msg = JSON.parse(resp.body);
          const candidate = JSON.parse(msg.msg);
          const remoteUid = msg.uid;
          // 收到Candidate
          const peerConnection = this.peerConnectionMap.get(remoteUid);
          console.log(this);
          await peerConnection.addIceCandidate(candidate);
        }
      );
    });
  }

  sendMessage(url, message) {
    this.stompClient.send(url, {}, message);
  }

  async initLocalStream(roomid) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // audio: true,
        video: true,
      });
      this.roomId = roomid;
      this.openLocalStream(stream);
    } catch (error) {
      console.error(error);
    }
  }

  openLocalStream(stream) {
    console.log("开启本地流");
    this.dojoin(this.roomId);
    this.localStream = stream;
    this.localVideo.srcObject = stream;
    // 一个端对端连接就对应一个peerConnection，所以创建一个Map来存放多个该对象，使用用户id进行索引
    this.peerConnectionMap = new Map();
  }

  closeLocalStream() {
    if (this.localStream !== null) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  dojoin(roomId) {
    const jsonMsg = {
      uid: this.localUserId,
    };

    const message = JSON.stringify(jsonMsg);
    this.sendMessage(
      sendPrefix + signal.SIGNAL_TYPE_JOIN + "/" + roomId,
      message
    );
    console.log(`dojoin msg: ${message}`);
  }

  async createPeerConnection(remoteUid) {
    // 创建peerConnection对象
    // const peerConnection = new RTCPeerConnection({
    //   bundlePolicy: "max-bundle",
    //   rtcpMuxPolicy: "require",
    //   // relay是强制使用转发服务器，all是能打洞则打洞
    //   iceTransportPolicy: "relay",
    //   iceServers: [
    //     {
    //       urls: [
    //         "turn:114.55.40.109:3478?transport=udp",
    //         "turn:114.55.40.109:3478?transport=tcp",
    //       ],
    //       username: "tyy",
    //       credential: "123456",
    //     },
    //     {
    //       urls: ["stun:114.55.40.109:3478"],
    //     },
    //   ],
    // });
    const peerConnection = new RTCPeerConnection(null);
    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        const jsonMsg = {
          uid: this.localUserId,
          remoteUid: remoteUid,
          msg: JSON.stringify(e.candidate),
        };
        const message = JSON.stringify(jsonMsg);
        this.sendMessage(
          sendPrefix + signal.SIGNAL_TYPE_CANDIDATE + "/" + this.roomId,
          message
        );
      } else {
        console.log("candidate处理终止");
        console.log(this);
      }
    };
    // 获取远程视频码流
    peerConnection.ontrack = (e) => {
      this.remoteStreamMap.set(remoteUid, e.streams[0]);
      const remoteVideo = this.remoteVideoMap.get(remoteUid);
      console.log("流来啦！！！！！！是" + remoteUid + "的");
      remoteVideo.srcObject = e.streams[0];
    };

    this.localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream);
    });

    this.peerConnectionMap.set(remoteUid, peerConnection);
  }

  async doOffer(remoteUid) {
    console.log("现在的remoteUid是", remoteUid);
    if (!this.peerConnectionMap.has(remoteUid)) {
      console.log("主动创建的offer，id是" + remoteUid);
      await this.createPeerConnection(remoteUid);
    }
    const peerConnection = this.peerConnectionMap.get(remoteUid);
    const session = await peerConnection.createOffer();
    const jsonMsg = {
      uid: this.localUserId,
      remoteUid: remoteUid,
      msg: JSON.stringify(session),
    };
    const message = JSON.stringify(jsonMsg);
    this.sendMessage(
      sendPrefix + signal.SIGNAL_TYPE_OFFER + "/" + this.roomId,
      message
    );
    await peerConnection.setLocalDescription(session);
    console.log("do offer msg:" + message);
  }

  async doAnswer(remoteUid) {
    console.log("做了answer!!!");
    const peerConnection = this.peerConnectionMap.get(remoteUid);
    const session = await peerConnection.createAnswer();
    const jsonMsg = {
      uid: this.localUserId,
      remoteUid: remoteUid,
      msg: JSON.stringify(session),
    };
    const message = JSON.stringify(jsonMsg);
    this.sendMessage(
      sendPrefix + signal.SIGNAL_TYPE_ANSWER + "/" + this.roomId,
      message
    );
    await peerConnection.setLocalDescription(session);
    console.log("do answer msg:" + message);
  }

  doLeave() {
    const jsonMsg = {
      uid: this.localUserId,
    };
    this.localStream = null;
    this.localVideo.srcObject = null;
    const message = JSON.stringify(jsonMsg);
    this.sendMessage(
      sendPrefix + signal.SIGNAL_TYPE_LEAVE + "/" + this.roomId,
      message
    );
    console.log(`doleave msg: ${message}`);
  }

  hangup() {
    this.localVideo.srcObject = null;
    this.remoteVideoMap.forEach((remoteVideo) => {
      remoteVideo.srcObject = null;
    });
    this.closeLocalStream();
    this.peerConnectionMap.forEach((peerConnection) => {
      if (peerConnection !== null) {
        peerConnection.close();
      }
    });
    this.peerConnectionMap.clear();
    this.exitCallBack();
  }
}
