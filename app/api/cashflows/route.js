import { getCashflow } from "@/actions/cashflow";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();

    if (!userId) {
      return Response.json({ message: "User ID is required" }, { status: 400 });
    }

    const cashFlows = await getCashflow(userId);

    if (!cashFlows.length) {
      return Response.json({ message: "No cashflow statements found" }, { status: 404 });
    }

    return Response.json(cashFlows, { status: 200 });
  } catch (error) {
    return Response.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
