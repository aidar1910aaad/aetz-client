# RUSN Behavior Map

This document describes the current RUSN behavior that refactors must preserve.

## Main Flow

1. `RusnGlobalConfig` stores selected camera type and global material categories in `useRusnStore.global`.
2. `useRusnMaterials` loads visible material categories from settings and resolves material lists for breaker, RZA, meter, SR, TSN, TN and TT.
3. `RusnCellTable` creates or opens cell rows. `useCellManager` auto-creates cells for special cameras such as `Камера 8DJH` and `Камера КСО 366`.
4. `RusnCell` renders the editable cell form, calls `useCellCalculation`, then writes:
   - `cell.totalPrice` through `updateCell`.
   - `cellSummaries` rows through `setCellSummary`.
5. Busbar and bus bridge hooks write `busbarSummary`, `busBridgeSummary` or `busBridgeSummaries`.
6. `RusnMaterialsSummary`, Final Review, PDF and KP documents read store snapshots and aggregate totals.

## Current Sources Of Truth

| Context | Current source |
| --- | --- |
| Active RUSN form | `useRusnStore.cellConfigs`, `busbarSummary`, `busBridgeSummaries`, `cellSummaries` |
| Per-cell calculated total | `RusnCell.totalPrice`, produced from `useCellCalculation` |
| Summary rows | `cellSummaries`, rebuilt by mounted `RusnCell` components |
| Final Review RUSN total | Mostly `cellConfigs.totalPrice` plus bus summaries; tables may prefer `cellSummaries` |
| Backend bid reprice RUSN total | Sums persisted `rusn.cellConfigs[].totalPrice`, bus summaries and custom rows |

Because `cellSummaries` are UI snapshots, refactors should avoid relying on them as the only persisted source until the summary pipeline is centralized.

## Must-Preserve Rules

- Standard cells sum separate calculated component prices for selected breaker, RZA, SR, PU, TSN and TN, then add TT as catalog price multiplied by 3.
- Standard cell total is multiplied by `cell.count`.
- `Камера КСО 366` uses static calculation selection by existing names and IDs:
  - `Ввод` and `Отходящая`: preferred ID `38`.
  - `Трансформаторная`: preferred ID `41`.
  - `Камера КСО 366-13`: preferred ID `39`.
  - `Камера КСО 366 ШМР 14, 15`: main ID `42`, additional ID `44`.
- `Камера 8DJH` calculates `R` and `L` parts by calculation names `8DJH (R) `, `8DJH (L)` and `8DJH (L) РЗиА`.
- `Кабельная перемычка` and `Изоляционный адаптер` select `10кВ` or `20кВ` variants from the selected transformer voltage.
- `Камера КСО А12-10` uses material-based calculation by default. When `cell.bhaMode === true` on `Ввод`, `Трансформаторная`, or `Отходящая`, the cell uses a fixed BHA calculation selected primarily by `cellConfig.type`:
  - `bha_input` → `Ввод`
  - `bha_transformer` → `Трансформаторная`
  - `bha_outgoing` → `Отходящая`
- Fallback slug map: `bha-input`, `bha-transformer`, `bha-outgoing`.
- BHA calculations must have `cellConfig.type` starting with `bha_` and must not contain linked equipment materials.
- Auto material fill for KSO A12-10 is unchanged; BHA only switches the pricing path after the user toggles it per cell.
- In BHA mode, eligible cells show a fixed description and quantity only:
  - `Ввод`: `Камера КСО А12-10 10ВН1 (вводная) Выключатель нагрузки ВНА 10/630`
  - `Трансформаторная`: `Камера КСО А12-10 10ВН (трансформаторная) Выключатель нагрузки ВНА 10/630 с предохранителем`
  - `Отходящая`: `Камера КСО А12-10 10ВН1 (отходящая линия) Выключатель нагрузки ВНА 10/630`
- Existing Russian purpose strings are part of the contract and must not be renamed without migrations.

## Safe Refactor Principle

Each refactor step should first extract existing logic into named pure functions, then switch callers to those functions without changing inputs or outputs.
