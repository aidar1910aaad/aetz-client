'use client';

import RunnGlobalConfig from './RunnGlobalConfig';
import RunnCellTable from './RunnCellTable';

export default function RunnFormFields({ availableCells }: { availableCells: string[] }) {
  return (
    <>
      <RunnGlobalConfig availableCells={availableCells} />
      
    </>
  );
}
