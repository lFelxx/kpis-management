package com.fcastro.backend_kpis_management.model.dto.schedule;

import java.util.List;

/** Ids de los integrantes del horario, en el orden en que deben mostrarse. */
public record TeamOrderRequest(List<Long> adviserIds) {}
