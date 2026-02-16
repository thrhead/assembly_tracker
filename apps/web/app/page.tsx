import { redirect } from "next/navigation";

// Root page redirects to default locale (handled by middleware usually, but good as fallback)
export default function RootPage() {
  redirect("/tr");
}