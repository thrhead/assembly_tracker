import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Eğer giriş yapmışsa, rolüne göre yönlendir
  if (session?.user) {
    const role = session.user.role.toLowerCase();
    redirect(`/${role}`);
  }

  return <LandingPage />;
}
