package com.webrtcdemo.webrtcdemo.pojo;

import lombok.Data;

@Data
public class AnswerSignal {
    private String uid;
    private String remoteUid;
    private String msg;
}
