import { NextResponse } from "next/server";
import { getHistory, deleteFromHistory } from "@/app/lib/history";

// Configure route for Node.js runtime (required for fs operations)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const history = await getHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error getting history:", error);
    return NextResponse.json(
      { error: "Failed to get history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    await deleteFromHistory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting history item:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 }
    );
  }
}
