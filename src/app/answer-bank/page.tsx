// src\app\answer-bank\page.tsx
import { AnswerBankTable } from '@/components/answerBank/AnswerBankTable';
import { PageTitle } from '@/components/shared/PageTitle';

const AnswerBankPage = () => (
  <>
    <PageTitle
      title="Answer Bank"
      subtitle="Stored answers to screening questions. If no answer matches confidently, the application pauses for you."
    />
    <AnswerBankTable />
  </>
);

export default AnswerBankPage;
