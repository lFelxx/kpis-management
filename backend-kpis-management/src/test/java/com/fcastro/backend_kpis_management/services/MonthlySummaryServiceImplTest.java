package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.services.impl.MonthlySummaryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MonthlySummaryServiceImplTest {

    @Mock  private MonthlySummaryRepository summaryRepository;
    @Mock  private AdviserRepository         adviserRepository;
    @InjectMocks private MonthlySummaryServiceImpl service;

    private Adviser adviser;

    @BeforeEach
    void setUp() {
        adviser = new Adviser();
        adviser.setId(1L);
        adviser.setName("Test Adviser");
    }

    // ── addSaleToMonthlySummary ───────────────────────────────────────────────

    @Test
    void addSale_existingSummary_incrementsTotalSales() {
        MonthlySummary existing = summaryWithSales(1_000_000.0);
        when(summaryRepository.findByAdviserIdAndYearAndMonth(1L, 2026, 6))
                .thenReturn(Optional.of(existing));

        service.addSaleToMonthlySummary(adviser, LocalDate.of(2026, 6, 15), 250_000.0);

        ArgumentCaptor<MonthlySummary> saved = ArgumentCaptor.forClass(MonthlySummary.class);
        verify(summaryRepository).save(saved.capture());
        assertThat(saved.getValue().getTotalSales()).isEqualTo(1_250_000.0);
    }

    @Test
    void addSale_noExistingSummary_createsSummaryWithSaleAmount() {
        when(summaryRepository.findByAdviserIdAndYearAndMonth(1L, 2026, 6))
                .thenReturn(Optional.empty());

        service.addSaleToMonthlySummary(adviser, LocalDate.of(2026, 6, 1), 500_000.0);

        ArgumentCaptor<MonthlySummary> saved = ArgumentCaptor.forClass(MonthlySummary.class);
        verify(summaryRepository).save(saved.capture());
        assertThat(saved.getValue().getTotalSales()).isEqualTo(500_000.0);
        assertThat(saved.getValue().getYear()).isEqualTo(2026);
        assertThat(saved.getValue().getMonth()).isEqualTo(6);
    }

    // ── updateTotalSalesByAdviser ─────────────────────────────────────────────

    @Test
    void updateTotalSales_replacesPreviousTotal() {
        MonthlySummary existing = summaryWithSales(3_000_000.0);
        when(adviserRepository.findById(1L)).thenReturn(Optional.of(adviser));
        when(summaryRepository.findByAdviserIdAndYearAndMonth(1L, 2026, 6))
                .thenReturn(Optional.of(existing));

        service.updateTotalSalesByAdviser(1L, 2026, 6, 4_500_000.0);

        ArgumentCaptor<MonthlySummary> saved = ArgumentCaptor.forClass(MonthlySummary.class);
        verify(summaryRepository).save(saved.capture());
        assertThat(saved.getValue().getTotalSales()).isEqualTo(4_500_000.0);
    }

    @Test
    void updateTotalSales_nullAmount_setsZero() {
        when(adviserRepository.findById(1L)).thenReturn(Optional.of(adviser));
        when(summaryRepository.findByAdviserIdAndYearAndMonth(anyLong(), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        service.updateTotalSalesByAdviser(1L, 2026, 6, null);

        ArgumentCaptor<MonthlySummary> saved = ArgumentCaptor.forClass(MonthlySummary.class);
        verify(summaryRepository).save(saved.capture());
        assertThat(saved.getValue().getTotalSales()).isEqualTo(0.0);
    }

    @Test
    void updateTotalSales_adviserNotFound_throwsRuntimeException() {
        when(adviserRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateTotalSalesByAdviser(99L, 2026, 6, 1_000.0))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    // ── syncGoal ──────────────────────────────────────────────────────────────

    @Test
    void syncGoal_setsGoalOnExistingSummary() {
        MonthlySummary existing = summaryWithSales(0.0);
        existing.setGoal(5_000_000.0);
        when(adviserRepository.findById(1L)).thenReturn(Optional.of(adviser));
        when(summaryRepository.findByAdviserIdAndYearAndMonth(1L, 2026, 7))
                .thenReturn(Optional.of(existing));

        service.syncGoal(1L, 2026, 7, 8_000_000.0);

        ArgumentCaptor<MonthlySummary> saved = ArgumentCaptor.forClass(MonthlySummary.class);
        verify(summaryRepository).save(saved.capture());
        assertThat(saved.getValue().getGoal()).isEqualTo(8_000_000.0);
    }

    @Test
    void syncGoal_nullGoal_setsZero() {
        when(adviserRepository.findById(1L)).thenReturn(Optional.of(adviser));
        when(summaryRepository.findByAdviserIdAndYearAndMonth(anyLong(), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        service.syncGoal(1L, 2026, 7, null);

        ArgumentCaptor<MonthlySummary> saved = ArgumentCaptor.forClass(MonthlySummary.class);
        verify(summaryRepository).save(saved.capture());
        assertThat(saved.getValue().getGoal()).isEqualTo(0.0);
    }

    @Test
    void syncGoal_adviserNotFound_throwsRuntimeException() {
        when(adviserRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.syncGoal(42L, 2026, 7, 1_000.0))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("42");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private MonthlySummary summaryWithSales(double total) {
        MonthlySummary s = new MonthlySummary();
        s.setAdviser(adviser);
        s.setYear(2026);
        s.setMonth(6);
        s.setTotalSales(total);
        s.setGoal(0.0);
        return s;
    }
}
