import { useEffect, useState } from "react";
import { MonthlySummary } from "../../core/domain/Adviser/Adviser";
import { getMonthlySummaryUseCase } from "../../core/instances/instances";

export function useMonthlySummary(adviserId: string | number, year: number) {
    const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!adviserId || !year) return;
        setLoading(true);
        getMonthlySummaryUseCase.execute(adviserId, year)
            .then(setMonthlySummary)
            .catch(() => setMonthlySummary([]))
            .finally(() => setLoading(false));
    }, [adviserId, year]);

    return { monthlySummary, loading };
}
