package com.webrtcdemo.webrtcdemo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webrtcdemo.webrtcdemo.util.Result;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/1")
    public Result getTest() {
        return new Result();
    }
}
