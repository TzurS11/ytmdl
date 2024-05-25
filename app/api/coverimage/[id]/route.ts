import axios from "axios";
import { NextResponse } from "next/server";
import { ReasonPhrases, StatusCodes, getStatusCode } from "http-status-codes";

const urlPattern =
  /https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_-]+=w\d+-h\d+(-s)?-l\d+-rj/;

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

  const readableStream = await axios.get(id.split("?")[0], {
    responseType: "stream",
  });
  // if()
  const response = new Response(readableStream.data);
  response.headers.set("Content-Type", "image/jpeg");
  return response;
}

//https://lh3.googleusercontent.com/KQKyi_MhZ191ZZ9Y_Li3wLqOKcHqMJEf06YWZrCWaDWAYd4Gj7KNdIiRaDhbgxFXQWw1UVrT2QpYz_QP=w120-h120-l90-rj
//https://lh3.googleusercontent.com/09-I-j3TSneTzndBCwae9irrQPxWKeaShWhd9-ezjvvtru1J86z3zbeTeyXRR9nAC55cSb8WshumE213-A=w120-h120-l90-rj
//https://lh3.googleusercontent.com/CwYPC54qjwF3UiwcG7hqne7zWwa28tXHkI9ozUbeYubljCNYdMTV7C8l9ZlRXf3MXMqHUEcQbml2YbP_sQ=w120-h120-l90-rj
//https://lh3.googleusercontent.com/XHVUPIt94rLupjDvstMZ2bRTIk1Of7Ugmn1ZMJ4ivurktyCCbkiCJtWAM-Cj1asT5EhkeY2wbW9t2Zx5=w120-h120-l90-rj
//https://lh3.googleusercontent.com/-kb2G0v5A95Exch1a4YJTopQoX7mnqkEOrD1PI81gCzsqgidXe-gim5dNDLVcfacX59fNcB8ruK5GUZdgA=w120-h120-s-l90-rj
/https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_-]+=(w\d+)?(-)?(h\d+)(-)?(s)?(-)?(l\d+)?-rj/;
