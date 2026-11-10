import { withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser((user) => Response.json({ user }));
}
