export const metalCaseTypes = ['КСО-А12-10', 'КМ1-АФ', 'КСО-А212', 'ЯКНО'];

export const rusnDisplayRules = {
  showRza: ({ selectedCells, breaker }: { selectedCells: string[]; breaker: string }) =>
    metalCaseTypes.some((type) => selectedCells.includes(type)) && breaker !== 'ВНА-10/630',

  showDisconnector: () => true,

  showMeter: ({ breaker }: { breaker: string }) => breaker !== 'ВНА-10/630',

  showCT: ({ breaker }: { breaker: string }) => breaker !== 'ВНА-10/630',

  showTn: () => true,
  showTsn: () => true,
  showBusBridge: () => true,
};
