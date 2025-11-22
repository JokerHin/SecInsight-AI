import { NextResponse } from "next/server";
import { getHistory, deleteFromHistory } from "@/app/lib/history";

export async function GET() {
  try {
    const history = getHistory();
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

    deleteFromHistory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting history item:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 }
    );
  }
}
