package com.webrtcdemo.webrtcdemo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ResourceController {
    @RequestMapping("/index")
    public String login() {
        return "client.html";
    }

    

}
