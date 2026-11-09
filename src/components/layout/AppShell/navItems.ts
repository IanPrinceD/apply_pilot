// src\components\layout\AppShell\navItems.ts
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavItem {
  label: string;
  href: string;
  icon: SvgIconComponent;
  /** Not built yet — shown greyed out with the phase it lands in. */
  comingIn?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: DashboardOutlinedIcon },
  { label: 'Jobs', href: '/jobs', icon: WorkOutlineOutlinedIcon, comingIn: 'Phase 2' },
  { label: 'Review queue', href: '/review', icon: FactCheckOutlinedIcon, comingIn: 'Phase 3' },
  { label: 'History', href: '/history', icon: HistoryOutlinedIcon, comingIn: 'Phase 4' },
  { label: 'Resume', href: '/resume', icon: DescriptionOutlinedIcon },
  { label: 'Settings', href: '/settings', icon: TuneOutlinedIcon },
  { label: 'Answer bank', href: '/answer-bank', icon: QuestionAnswerOutlinedIcon },
];
