// src\components\answerBank\AnswerBankTable\answerBankTable.element.tsx
import styled from '@emotion/styled';
import { Stack } from '@mui/material';

export const ToolbarRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const TagStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  paddingBlock: theme.spacing(1),
}));

export const CellText = styled(Stack)(({ theme }) => ({
  paddingBlock: theme.spacing(1),
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));
