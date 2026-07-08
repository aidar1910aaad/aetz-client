import { Switchgear } from '@/api/switchgear';
import { normalizeBusbarSection, parseBusbarSectionArea } from '@/utils/busbarSectionUtils';

export interface RunnBusbarOption {
  group: string;
  section: string;
}

export function getPossibleGroupsFromTransformer(busbarsType?: string | null): string[] {
  if (busbarsType === 'Алюминий') return ['АД', 'АД2', 'АД3'];
  if (busbarsType === 'Медь') return ['МТ', 'МТ2', 'МТ3'];
  return [];
}

export function buildRunnBusbarOptions(
  configs: Switchgear[],
  panelType: string,
  possibleGroups: string[]
): RunnBusbarOption[] {
  const unique = new Map<string, RunnBusbarOption>();

  for (const config of configs) {
    if (config.type !== panelType) continue;
    if (!possibleGroups.includes(config.group) || !config.busbar) continue;

    const key = `${config.group}:${normalizeBusbarSection(config.busbar)}`;
    if (!unique.has(key)) {
      unique.set(key, { group: config.group, section: config.busbar });
    }
  }

  return [...unique.values()].sort((a, b) => {
    const sectionDiff = parseBusbarSectionArea(a.section) - parseBusbarSectionArea(b.section);
    if (sectionDiff !== 0) return sectionDiff;
    return a.group.localeCompare(b.group, 'ru');
  });
}

export function pickRecommendedRunnConfig(
  configs: Switchgear[],
  panelType: string,
  transformerPower: number | undefined,
  possibleGroups: string[]
): Switchgear | null {
  if (!transformerPower) return null;

  const matching = configs.filter(
    (config) =>
      config.type === panelType &&
      config.breaker === transformerPower.toString() &&
      possibleGroups.includes(config.group)
  );

  if (matching.length === 0) return null;
  return [...matching].sort((a, b) => a.amperage - b.amperage)[0];
}

export function resolveRunnBusbarConfig(
  configs: Switchgear[],
  panelType: string,
  transformerPower: number | undefined,
  possibleGroups: string[],
  selectedGroup: string | null | undefined,
  selectedSection: string | null | undefined
): {
  matchingConfig: Switchgear | null;
  recommendedConfig: Switchgear | null;
  availableOptions: RunnBusbarOption[];
} {
  const availableOptions = buildRunnBusbarOptions(configs, panelType, possibleGroups);
  const recommendedConfig = pickRecommendedRunnConfig(
    configs,
    panelType,
    transformerPower,
    possibleGroups
  );

  if (selectedGroup && selectedSection) {
    const selectedNorm = normalizeBusbarSection(selectedSection);
    const selectedConfig =
      configs.find(
        (config) =>
          config.type === panelType &&
          config.group === selectedGroup &&
          normalizeBusbarSection(config.busbar) === selectedNorm &&
          (!transformerPower || config.breaker === transformerPower.toString())
      ) ||
      configs.find(
        (config) =>
          config.type === panelType &&
          config.group === selectedGroup &&
          normalizeBusbarSection(config.busbar) === selectedNorm
      );

    if (selectedConfig) {
      return { matchingConfig: selectedConfig, recommendedConfig, availableOptions };
    }
  }

  return {
    matchingConfig: recommendedConfig,
    recommendedConfig,
    availableOptions,
  };
}
