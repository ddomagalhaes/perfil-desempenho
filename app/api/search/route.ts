import { NextRequest, NextResponse } from "next/server";
import { searchPeople } from "@/lib/data/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchPeople(q);
  return NextResponse.json({ results });
}
