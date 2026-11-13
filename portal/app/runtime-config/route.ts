import { BUILD_TIME_API_URL, trimApiUrl } from "../../lib/apiUrl";

export const dynamic = "force-dynamic";

export function GET() {
  const apiUrl = trimApiUrl(process.env.VOLTIUS_API_URL || BUILD_TIME_API_URL);
  return Response.json({ apiUrl }, { headers: { "Cache-Control": "no-store" } });
}
