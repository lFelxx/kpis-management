package com.fcastro.backend_kpis_management.mapper;

import java.time.LocalDate;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcastro.backend_kpis_management.model.dto.MonthlySummaryDTO;
import com.fcastro.backend_kpis_management.model.dto.adviser.AdviserResponse;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Goal;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;

@Mapper(componentModel = "spring")
public interface AdviserMapper {
    
    @Mapping(source = "lastname", target = "lastName")
    @Mapping(target = "sales", expression ="java(calculateTotalSales(adviser))")
    @Mapping(target = "goalValue", expression = "java(getCurrentGoal(adviser))")
    @Mapping(target = "currentMonthSales", expression = "java(getCurrentMonthSales(adviser))")
    
    AdviserResponse tResponse(Adviser adviser);

    @Mapping(source = "lastName", target = "lastname")
    @Mapping(target = "sales", ignore = true)
    @Mapping(target = "goals", ignore = true)
    @Mapping(target = "monthlySummaries", ignore = true)
    @Mapping(target = "weeklySalesComparisons", ignore = true)
    @Mapping(target = "id", ignore = true)
    Adviser toEntity(com.fcastro.backend_kpis_management.model.dto.adviser.AdviserRequest request);

    List<AdviserResponse> toResponseList(List<Adviser> advisers);

    MonthlySummaryDTO tMonthlySummaryDTO(MonthlySummary summary);

    List<MonthlySummaryDTO> toMonthlySummaryDTOList(List<MonthlySummary> summary);

    // metodos para logica personalizada
    default Double calculateTotalSales(Adviser adviser) {
        if (adviser.getSales() == null)  return 0.0;
        return adviser.getSales().stream()
            .mapToDouble(sale -> sale.getAmount())
            .sum();
    }

    default Double getCurrentGoal(Adviser adviser){
        if(adviser.getGoals() == null) return 0.0;
        return adviser.getGoals().stream()
            .filter(goal -> goal.getMonth() == LocalDate.now().getMonthValue()
                    && goal.getYear() == LocalDate.now().getYear())
            .map(Goal::getGoalValue)
            .findFirst()
            .orElse(0.0);
    }

    // obtener el total de ventas del mes actual
    default Double getCurrentMonthSales(Adviser adviser){
        if(adviser.getMonthlySummaries() == null) return 0.0;
        LocalDate now = LocalDate.now();
        return adviser.getMonthlySummaries().stream()
            .filter(s -> s.getYear() == now.getYear() && s.getMonth() == now.getMonthValue())
            .map(MonthlySummary::getTotalSales)
            .findFirst()
            .orElse(0.0);
    }



    /* 
    @AfterMapping
    default void setMonthlySummaries(@MappingTarget AdviserResponse response, Adviser adviser){
        if(adviser.getMonthlySummaries() != null){
            response.setMonthlySummaries(
                toMonthlySummaryDTOList(adviser.getMonthlySummaries())
            );
        }else{
            response.setMonthlySummaries(new ArrayList<>());
        }
    }
    */

}
