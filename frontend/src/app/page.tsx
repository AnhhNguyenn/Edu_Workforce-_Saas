import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to super admin by default for now
  redirect("/super-admin/dashboard");
}
