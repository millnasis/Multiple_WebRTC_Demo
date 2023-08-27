package com.webrtcdemo.webrtcdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
public class WebrtcdemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebrtcdemoApplication.class, args);
		log.info("\n请访问 https://localhost:8443/index ........");

	}

}
