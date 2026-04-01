package com.fcastro.backend_kpis_management.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fcastro.backend_kpis_management.model.dto.adviser.AdviserRequest;
import com.fcastro.backend_kpis_management.model.dto.adviser.AdviserResponse;
import com.fcastro.backend_kpis_management.services.AdviserService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/advisers")
public class AdviserController {

    private final AdviserService adviserService;

    @GetMapping
    public List<AdviserResponse> getAllAdvisers () {
        return adviserService.getAdvisers();
    }

    @GetMapping("{id}/commissions/monthly")
    public List<Double> getMonthlyCommissions(@PathVariable Long id, @RequestParam int year) {
        return adviserService.getMonthlyCommissions(id, year);
    }

    @GetMapping("{id}")
    public AdviserResponse getAdviserById(@PathVariable Long id) {
        return adviserService.getAdviserById(id);
    }  
    
    @PostMapping
    public AdviserResponse CreateAdviser(@RequestBody AdviserRequest adviser) {   
        return adviserService.create(adviser);
    }

    @PutMapping("{id}")
    public AdviserResponse updateAdviser(@PathVariable Long id, @RequestBody AdviserRequest adviser) {
        return adviserService.update(id, adviser);
    }

    @DeleteMapping("{id}")
    public void deleteAdviser(@PathVariable Long id){
        adviserService.delete(id);
    }
}
