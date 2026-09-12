import { Icon } from '@phosphor-icons/react';

export interface NavItem {
  title: string;
  href: string;
  icon: Icon;
  badge?: string | number;
  roles?: ('teacher' | 'student')[];
}
