'use client';

import RusnGlobalConfig from './RusnGlobalConfig';
import RusnCellTable from './RusnCellTable';

export default function RusnFormFields({ availableCells }: { availableCells: string[] }) {
  return (
    <>
      <RusnGlobalConfig availableCells={availableCells} />
    </>
  );
}
