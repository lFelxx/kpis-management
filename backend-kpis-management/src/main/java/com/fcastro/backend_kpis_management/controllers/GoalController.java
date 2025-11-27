package com.fcastro.backend_kpis_management.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fcastro.backend_kpis_management.model.dto.goal.GoalRequest;
import com.fcastro.backend_kpis_management.services.GoalService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {
    
    private final GoalService goalService;

    @PutMapping("/{adviserId}")
    public ResponseEntity<?> updateGoal(@PathVariable Long adviserId, @RequestBody GoalRequest request) {
        goalService.updateGoal(adviserId, request.getGoal(), request.getYear(), request.getMonth());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/all")
    public ResponseEntity<?> updateGoalsForAllActiveAdvisers(@RequestBody GoalRequest request) {
        goalService.updateGoalsForAllActiveAdvisers(request.getGoal(), request.getYear(), request.getMonth());
        return ResponseEntity.ok().build();
    }
}
