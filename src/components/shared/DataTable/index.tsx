// src\components\shared\DataTable\index.tsx
'use client';

import { DataGrid, type DataGridProps, type GridValidRowModel } from '@mui/x-data-grid';
import { TablePaper } from './dataTable.element';

export type DataTableProps<R extends GridValidRowModel> = DataGridProps<R> & {
  emptyLabel?: string;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/** DataGrid wrapper with app defaults (pagination, no row-click selection, auto height). */
export const DataTable = <R extends GridValidRowModel>({ emptyLabel = 'No rows yet', ...props }: DataTableProps<R>) => (
  <TablePaper>
    <DataGrid<R>
      autoHeight
      disableRowSelectionOnClick
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      localeText={{ noRowsLabel: emptyLabel }}
      getRowHeight={() => 'auto'}
      {...props}
    />
  </TablePaper>
);
