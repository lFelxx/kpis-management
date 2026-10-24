package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.app.AppInfoResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class AppInfoControllerTest {

    @Test
    void getInfo_devuelveLaVersionConfigurada() {
        AppInfoController controller = new AppInfoController("2.0.1");

        ResponseEntity<AppInfoResponse> response = controller.getInfo();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(new AppInfoResponse("2.0.1"));
    }
}
