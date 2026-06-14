package com.example.voltvibe.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    @GetMapping("/env")
    public Map<String, String> getDebugEnvironment() {
        Map<String, String> env = new HashMap<>();
        env.put("SPRING_PROFILES_ACTIVE", "dev");
        env.put("DATABASE_URL", "jdbc:sqlite:shop.db");
        env.put("JWT_SECRET", "VOLTVIBE_SUPER_SECRET_TOKEN_1337");
        env.put("FLAG", "FLAG{A05_SECURITY_MISCONFIGURATION_EXPOSED_ENV_VAR}");
        env.put("SYSTEM_ARCH", System.getProperty("os.arch"));
        env.put("JVM_VERSION", System.getProperty("java.version"));
        return env;
    }
}
