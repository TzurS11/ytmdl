import axios from "axios";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { recentCoverImages } from "@/app/globals";

export async function GET(request: Request, context: any) {
  const id = decodeURIComponent(context.params.id);

  if (!recentCoverImages.has(id)) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  const readableStream = (
    await axios.get(id, {
      responseType: "stream",
    })
  ).data;
  const response = new Response(readableStream);
  response.headers.set("Content-Type", "image/jpeg");
  return response;
}
