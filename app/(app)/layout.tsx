// Shared shell for all signed-in pages: Sidebar + Header around {children}.
// Imports: @/components/layout/Sidebar, @/components/layout/Header, @/components/tasks/AddTaskButton

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddTaskButton } from "@/components/tasks/AddTaskButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        {/* Bottom padding leaves room for the phone tab bar and floating button */}
        <main className="flex-1 px-4 py-6 pb-40 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
        {/* Phones only; the header button covers wider screens */}
        <AddTaskButton variant="floating" />
      </div>
    </div>
  );
}
