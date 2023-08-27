package com.webrtcdemo.webrtcdemo.controller;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListSet;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import com.webrtcdemo.webrtcdemo.pojo.AnswerSignal;
import com.webrtcdemo.webrtcdemo.pojo.CandidateSignal;
import com.webrtcdemo.webrtcdemo.pojo.JoinSignal;
import com.webrtcdemo.webrtcdemo.pojo.LeaveSignal;
import com.webrtcdemo.webrtcdemo.pojo.NewPeerSignal;
import com.webrtcdemo.webrtcdemo.pojo.OfferSignal;
import com.webrtcdemo.webrtcdemo.pojo.PeerLeaveSignal;
import com.webrtcdemo.webrtcdemo.pojo.RespJoinSignal;
import com.webrtcdemo.webrtcdemo.util.Constant;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class MsgController {

    private SimpMessagingTemplate template;

    public MsgController(SimpMessagingTemplate template) {
        this.template = template;
    }

    private static final Map<String, Set<String>> USER_ROOM_TABLE_MAP = new ConcurrentHashMap<>();

    private static final Map<String, String> USER_ROOM_MAP = new ConcurrentHashMap<>();

    public static Map<String, String> getUserRoomMap() {
        return USER_ROOM_MAP;
    }

    public static Map<String, Set<String>> getUserRoomTableMap() {
        return USER_ROOM_TABLE_MAP;
    }

    @MessageMapping("/" + Constant.signal.SIGNAL_TYPE_JOIN + "/{roomid}")
    public void join(JoinSignal msgJoin, @DestinationVariable String roomid) {
        log.info("join " + roomid + " 操作，消息：{}", msgJoin);
        // 查询房间，若没有就建立
        Set<String> RoomSet = USER_ROOM_TABLE_MAP.get(roomid);
        if (RoomSet == null) {
            RoomSet = new ConcurrentSkipListSet<String>();
            USER_ROOM_TABLE_MAP.put(roomid, RoomSet);
        }

        RoomSet.add(msgJoin.getUid());
        USER_ROOM_MAP.put(msgJoin.getUid(), roomid);
        if (RoomSet.size() > 0) {
            RoomSet.forEach((uid) -> {
                NewPeerSignal nps = new NewPeerSignal();
                nps.setRemoteUid(msgJoin.getUid());
                this.template.convertAndSend("/socket-resp/" + Constant.signal.SIGNAL_TYPE_NEW_PEER + "/" + uid,
                        nps);

                RespJoinSignal rjs = new RespJoinSignal();
                rjs.setRemoteUid(uid);
                this.template.convertAndSend(
                        "/socket-resp/" + Constant.signal.SIGNAL_TYPE_RESP_JOIN + "/" + msgJoin.getUid(), rjs);
            });

        }

        log.info("{}\n{}", USER_ROOM_TABLE_MAP,USER_ROOM_MAP);

    }

    @MessageMapping("/" + Constant.signal.SIGNAL_TYPE_LEAVE + "/{roomid}")
    public void leave(LeaveSignal msgLeave, @DestinationVariable String roomid) {
        log.info("leave " + roomid + " 操作，消息：{}", msgLeave);

        Set<String> roomSet = USER_ROOM_TABLE_MAP.get(roomid);
        Map<String, String> roomMap = USER_ROOM_MAP;
       
        if (roomSet == null) {
            log.error("无法找到房间{}", roomid);
            return;
        }

        roomSet.remove(msgLeave.getUid());
        roomMap.remove(msgLeave.getUid());
        log.info("当前房间{}人数:{}", roomid, roomSet.size());
        if (roomSet.size() > 0) {
            roomSet.forEach((uid) -> {
                PeerLeaveSignal pls = new PeerLeaveSignal();
                pls.setRemoteUid(msgLeave.getUid());
                this.template.convertAndSend("/socket-resp/" + Constant.signal.SIGNAL_TYPE_PEER_LEAVE + "/" + uid,
                        pls);

                

            });
        }

    }

    @MessageMapping("/" + Constant.signal.SIGNAL_TYPE_OFFER + "/{roomid}")
    public void offer(OfferSignal msgOffer, @DestinationVariable String roomid) {
        log.info("join " + roomid + " 操作，消息：{}", msgOffer);
        Set<String> roomSet = USER_ROOM_TABLE_MAP.get(roomid);
        if (roomSet == null) {
            log.error("无法找到房间{}", roomid);
            return;
        }

        if (!roomSet.contains(msgOffer.getRemoteUid())) {
            log.error("无法找到远程用户{}", msgOffer.getRemoteUid());
            return;
        }

        this.template.convertAndSend(
                "/socket-resp/" + Constant.signal.SIGNAL_TYPE_OFFER + "/" + msgOffer.getRemoteUid(), msgOffer);

    }

    @MessageMapping("/" + Constant.signal.SIGNAL_TYPE_ANSWER + "/{roomid}")
    public void answer(AnswerSignal msgAnswer, @DestinationVariable String roomid) {
        log.info("join " + roomid + " 操作，消息：{}", msgAnswer);
        Set<String> roomSet = USER_ROOM_TABLE_MAP.get(roomid);
        if (roomSet == null) {
            log.error("无法找到房间{}", roomid);
            return;
        }

        if (!roomSet.contains(msgAnswer.getRemoteUid())) {
            log.error("无法找到远程用户{}", msgAnswer.getRemoteUid());
            return;
        }

        this.template.convertAndSend(
                "/socket-resp/" + Constant.signal.SIGNAL_TYPE_ANSWER + "/" + msgAnswer.getRemoteUid(), msgAnswer);
    }

    @MessageMapping("/" + Constant.signal.SIGNAL_TYPE_CANDIDATE + "/{roomid}")
    public void answer(CandidateSignal msgCandidate, @DestinationVariable String roomid) {
        log.info("join " + roomid + " 操作，消息：{}", msgCandidate);
        Set<String> roomSet = USER_ROOM_TABLE_MAP.get(roomid);
        if (roomSet == null) {
            log.error("无法找到房间{}", roomid);
            return;
        }

        if (!roomSet.contains(msgCandidate.getRemoteUid())) {
            log.error("无法找到远程用户{}", msgCandidate.getRemoteUid());
            return;
        }

        this.template.convertAndSend(
                "/socket-resp/" + Constant.signal.SIGNAL_TYPE_CANDIDATE + "/" + msgCandidate.getRemoteUid(),
                msgCandidate);
    }

}
