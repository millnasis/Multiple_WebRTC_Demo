package com.webrtcdemo.webrtcdemo.util;

import lombok.Data;

@Data
public class Result {
    private Object data;
    private int code;
    private String msg;

    public Result() {
        this.data = null;
        this.code = Constant.code.error;
        this.msg = null;
    }

    public Result(Object data) {
        this.data = data;
        this.code = Constant.code.success;
        this.msg = null;
    }

    public Result(Object data, String msg) {
        this.data = data;
        this.code = Constant.code.success;
        this.msg = msg;
    }
    
    public Result(Object data, String msg,int code){
        this.data = data;
        this.code = code;
        this.msg = msg;
    }
}
