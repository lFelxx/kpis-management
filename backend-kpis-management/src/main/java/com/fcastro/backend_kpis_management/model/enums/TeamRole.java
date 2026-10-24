package com.fcastro.backend_kpis_management.model.enums;

import java.util.List;

public enum TeamRole {
    ADMIN,
    CO_ADMIN,
    ADVISER,
    AUXILIARY;

    /** Roles que NO generan ventas ni aplican a metas. */
    public static final List<TeamRole> NON_SELLING = List.of(ADMIN, AUXILIARY);
}
