// Clerk <SignUp /> page. After sign-up Clerk goes to "/" (-> /dashboard) for now;
// redirecting to /onboarding comes when the app connects to Supabase.
// Imports: @clerk/nextjs

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <SignUp />
    </main>
  );
}
