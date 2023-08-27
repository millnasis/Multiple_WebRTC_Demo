package com.webrtcdemo.webrtcdemo.controller;

import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;

import com.webrtcdemo.webrtcdemo.pojo.PeerLeaveSignal;
import com.webrtcdemo.webrtcdemo.util.Constant;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class WebSocketEventListener {

    @Autowired
    private SimpMessagingTemplate template;

    @EventListener
    public void handleWebsocketConnect(SessionConnectedEvent event) {
        log.info("WebSocket 客户端已连接: {}",
                event);
    }

    @EventListener
    public void handleWebsocketDisconnect(SessionDisconnectEvent event) {
        String uuid = event.getSessionId();
        log.info("WebSocket 客户端断开链接: {},sessionId是：{}",
                event, uuid);
        
        Map<String, String> roomMap = MsgController.getUserRoomMap();
        Map<String, Set<String>> tableMap = MsgController.getUserRoomTableMap();

        String roomid = roomMap.get(uuid);

        if (roomid == null) {
            log.error("无法找到对应房间id:{}", roomMap.entrySet());
            return;
        }
        Set<String> roomSet = tableMap.get(roomid);
        if (roomSet == null) {
            log.error("无法找到房间{}", roomid);
            return;
        }
        roomSet.remove(uuid);

        // 执行强制离开操作
        log.info("force leave " + roomid + " 操作，消息：{}", uuid);
        log.info("当前房间{}人数:{}", roomid, roomSet.size());
        if (roomSet.size() > 0) {
            roomSet.forEach((uid) -> {
                log.info("当前uid:{}", uid);
                PeerLeaveSignal pls = new PeerLeaveSignal();
                pls.setRemoteUid(uuid);
                this.template.convertAndSend("/socket-resp/" + Constant.signal.SIGNAL_TYPE_PEER_LEAVE + "/" + uid,
                        pls);

            });
        }

    }
}
