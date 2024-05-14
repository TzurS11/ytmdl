import axios from "axios";
import { NextResponse } from "next/server";
import { ReasonPhrases, StatusCodes, getStatusCode } from "http-status-codes";

const urlPattern =
  /^https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_-]+=w120-h120-l90-rj$/;

function isValidUrl(url: string): boolean {
  return urlPattern.test(url);
}

export async function GET(request: Request, context: any) {
  const id = decodeURIComponent(context.params.id);
  if (!isValidUrl(id)) {
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
