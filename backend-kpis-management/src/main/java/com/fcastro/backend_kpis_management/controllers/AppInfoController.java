package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.app.AppInfoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expone la versión configurada en application.properties (app.version).
 * El frontend la usa para mostrar el recorrido de novedades una sola vez por versión.
 */
@RestController
@RequestMapping("/api/app")
public class AppInfoController {

    private final String version;

    public AppInfoController(@Value("${app.version}") String version) {
        this.version = version;
    }

    @GetMapping("/info")
    public ResponseEntity<AppInfoResponse> getInfo() {
        return ResponseEntity.ok(new AppInfoResponse(version));
    }
}
