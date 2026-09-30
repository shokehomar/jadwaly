// Shared shell for all signed-in pages: Sidebar + Header around {children}.
// Loads the user's data from Supabase for the data provider; with no profile row the
// user hasn't onboarded yet, so they go to /onboarding.
// Imports: @/lib/user-data, @/components/providers/DataProvider, @/components/layout/*,
// @/components/tasks/AddTaskButton, @/components/ui/sonner (Toaster)

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DataProvider } from "@/components/providers/DataProvider";
import { AddTaskButton } from "@/components/tasks/AddTaskButton";
import { Toaster } from "@/components/ui/sonner";
import { loadUserData } from "@/lib/user-data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Reading auth first also marks these pages as dynamic (per user), so Next.js
  // doesn't try to pre-render them at build time.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await loadUserData();
  if (!data || !data.profile.onboarding_complete) redirect("/onboarding");

  return (
    <DataProvider initialData={data}>
      <div className="flex min-h-screen flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          {/* Bottom padding leaves room for the phone tab bar and floating button */}
          <main className="flex-1 px-4 py-6 pb-40 md:px-8 md:py-8 md:pb-8">{children}</main>
          {/* Phones only; the header button covers wider screens */}
          <AddTaskButton variant="floating" />
        </div>
      </div>
      {/* Shows "couldn't save" messages from the data provider */}
      <Toaster theme="light" position="top-center" />
    </DataProvider>
  );
}
