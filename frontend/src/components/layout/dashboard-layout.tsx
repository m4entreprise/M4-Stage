import type { PropsWithChildren } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export const DashboardLayout = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-screen bg-slate-100">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Topbar />
      <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
    </div>
  </div>
);
