import { useEffect, useState } from "react";

export function useMonthlySummary(adviserId: string | number, year: number) {
    const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!adviserId || !year ) return;
        setLoading(true);
        fetch(`/api/v1/monthly-summary/adviser/${adviserId}?year=${year}`)
        .then(res => res.json())
        .then(data => setMonthlySummary(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }, [adviserId, year]);

    return { monthlySummary, loading};
}