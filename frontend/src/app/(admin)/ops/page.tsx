import { redirect } from "next/navigation";

export default function CenterAdminRoot() {
  redirect("/ops/dashboard");
}
