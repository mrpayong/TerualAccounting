import { UserSessionLogging } from "@/actions/admin";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await UserSessionLogging(body);
    if (!result.success) {
      return new Response(result.error || "Failed", { status: 500 });
    }
    return Response.json({ success: true });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}