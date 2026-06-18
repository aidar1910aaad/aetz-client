# RUNN Behavior Map

This document describes current RUNN behavior that refactors must preserve.

## Main Flow

1. `RunnFormFields` loads RUNN materials from settings and renders global config, cells, busbar, bus bridge, DGU and summary.
2. `RunnCellTable` owns the active cells for `Ввод`, `Секционный выключатель`, `Торцевая панель` and delegates outgoing cells to `OutgoingCellSection`.
3. Calculation hooks resolve catalog calculations from the `panel-sho-70` group.
4. `calculateCost` is used for all cost rollups. Rates and percentages should come from the API-backed calculation payload; hardcoded rates are fallback only.
5. Cell summaries are persisted in `useRunnStore.cellSummaries` and consumed by Final Review, PDF/KP and backend bid payloads.
6. Busbar and bus bridge summaries are persisted in `useRunnStore.busbarSummary` / `busBridgeSummaries`.

## Must-Preserve Rules

- `Ввод` uses input calculations with `withdrawable_breaker` and optionally `counter`.
- `Секционный выключатель` uses `section_switch` calculations and matches molded-case breaker by exact name or current.
- `Отходящая` supports switching device modes: `Воздушный`, `Литой корпус`, `Литой корпус + Рубильник`, `РПС`.
- `Торцевая панель` uses a dedicated torcevaia calculation when present.
- Current transformer selection for outgoing/input cells is based on breaker current parsing.
- `selectedCalculationName` and `calculationName` are both legacy fields and must keep working.

## Current Source Of Truth

- Cell configuration: `useRunnStore.cellConfigs`.
- Cell rows for totals: `useRunnStore.cellSummaries`.
- Bus rows: `useRunnStore.busbarSummary`, `useRunnStore.busBridgeSummaries`.
- Backend bid repricing currently trusts persisted RUNN summary/config totals.

## Safe Refactor Principle

Prefer extraction over rewrite: first move existing matching and summary behavior into named functions, then update callers. Avoid changing Russian purpose strings or calculation group slug `panel-sho-70`.
