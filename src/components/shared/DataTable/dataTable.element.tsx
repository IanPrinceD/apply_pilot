// src\components\shared\DataTable\dataTable.element.tsx
import styled from '@emotion/styled';
import { Paper } from '@mui/material';

export const TablePaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  '& .MuiDataGrid-root': { border: 'none' },
  '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
}));
