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
    redirect("/super-admin/dashboard");
  } else if (role === "CENTER_ADMIN") {
    redirect("/center-admin/dashboard");
  } else {
    redirect("/teacher/checkin");
  }
}
