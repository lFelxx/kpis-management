package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.WeeklySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeeklyScheduleRepository extends JpaRepository<WeeklySchedule, Long> {

    boolean existsByWeekStart(LocalDate weekStart);

    Optional<WeeklySchedule> findByWeekStart(LocalDate weekStart);

    @Query("SELECT s FROM WeeklySchedule s ORDER BY s.weekStart DESC")
    List<WeeklySchedule> findAllOrderByWeekStartDesc();
}
