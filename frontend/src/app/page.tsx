import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "SUPER_ADMIN") {
    // Nếu là Vua hệ thống, đuổi sang cổng 3001
    redirect("/login?error=access-denied");
  } else if (role === "CENTER_ADMIN") {
    redirect("/ops/dashboard");
  } else {
    redirect("/me/checkin");
  }
}
