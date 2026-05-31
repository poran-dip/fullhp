import { navigateByRole } from "@/lib/auth-redirect";

export default async function Dashboard() {
  await navigateByRole();
}
