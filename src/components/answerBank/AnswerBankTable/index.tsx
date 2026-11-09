// src\components\answerBank\AnswerBankTable\index.tsx
'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Alert, Chip, Typography } from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { AnswerBankModal } from '@/components/answerBank/AnswerBankModal';
import { Button } from '@/components/shared/Button';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { DataTable } from '@/components/shared/DataTable';
import { useAnswerBank, useDeleteAnswer } from '@/hooks/useAnswerBank';
import type { AnswerBankEntryDto } from '@/types/answerBank';
import { CellText, TagStack, ToolbarRow } from './answerBankTable.element';

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; entry: AnswerBankEntryDto };

/** Answer bank list with add / edit / delete. */
export const AnswerBankTable = () => {
  const { data = [], isPending, isError, error } = useAnswerBank();
  const deleteAnswer = useDeleteAnswer();
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [toDelete, setToDelete] = useState<AnswerBankEntryDto | null>(null);

  const columns = useMemo<GridColDef<AnswerBankEntryDto>[]>(
    () => [
      {
        field: 'question',
        headerName: 'Question',
        flex: 1.2,
        minWidth: 220,
        renderCell: ({ value }) => <CellText>{value}</CellText>,
      },
      {
        field: 'answer',
        headerName: 'Answer',
        flex: 1.5,
        minWidth: 240,
        renderCell: ({ value }) => (
          <CellText>
            <Typography variant="body2" color="text.secondary">
              {value}
            </Typography>
          </CellText>
        ),
      },
      {
        field: 'tags',
        headerName: 'Tags',
        flex: 0.8,
        minWidth: 160,
        sortable: false,
        renderCell: ({ row }) => (
          <TagStack>
            {row.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </TagStack>
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: '',
        width: 96,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditOutlinedIcon />}
            label="Edit"
            onClick={() => setModal({ mode: 'edit', entry: row })}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteOutlineIcon />}
            label="Delete"
            onClick={() => setToDelete(row)}
          />,
        ],
      },
    ],
    [],
  );

  if (isError) return <Alert severity="error">{error.message}</Alert>;

  return (
    <>
      <ToolbarRow>
        <Typography variant="body2" color="text.secondary">
          {data.length} saved {data.length === 1 ? 'answer' : 'answers'}
        </Typography>
        <Button startIcon={<AddIcon />} onClick={() => setModal({ mode: 'create' })}>
          Add answer
        </Button>
      </ToolbarRow>

      <DataTable<AnswerBankEntryDto>
        rows={data}
        columns={columns}
        loading={isPending}
        emptyLabel="No answers yet — add your years per skill, salary, notice period, work authorization…"
      />

      {modal.mode !== 'closed' && (
        <AnswerBankModal
          key={modal.mode === 'edit' ? modal.entry.id : 'new'}
          open
          entry={modal.mode === 'edit' ? modal.entry : null}
          onClose={() => setModal({ mode: 'closed' })}
        />
      )}

      <ConfirmModal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteAnswer.mutate(toDelete.id);
          setToDelete(null);
        }}
        title="Delete this answer?"
        description={toDelete?.question ?? ''}
        icon={<DeleteOutlineIcon />}
        severity="error"
        confirmButtonType="destructive"
        confirmLabel="Delete"
      />
    </>
  );
};
