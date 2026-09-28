import { redirect } from "next/navigation";

// No landing page yet: send everyone to the dashboard.
export default function Home() {
  redirect("/dashboard");
}
