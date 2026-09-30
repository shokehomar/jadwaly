// Clerk <SignUp /> page. After sign-up Clerk goes to "/" (-> /dashboard), and the signed-in
// layout sends students without a profile to /onboarding.
// Imports: @clerk/nextjs

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <SignUp />
    </main>
  );
}
