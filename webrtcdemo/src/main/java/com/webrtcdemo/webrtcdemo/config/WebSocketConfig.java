package com.webrtcdemo.webrtcdemo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 响应客户端接口
        registry.enableSimpleBroker("/socket-resp");
        // 客户端主动发送数据接口
        registry.setApplicationDestinationPrefixes("/signal");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 建立socket连接的接口
        registry.addEndpoint("/socket-join").withSockJS();
    }
}
