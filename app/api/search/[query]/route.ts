import YTMusic from "ytmusic-api";

import { NextResponse } from "next/server";

const ytmusic = new YTMusic();
let isInitialized = false;

export async function GET(request: Request, context: any) {
  const query = context.params.query;
  if (isInitialized === false)
    await ytmusic.initialize().then(() => {
      isInitialized = true;
    });

  const search = await ytmusic.searchSongs(query);
  return NextResponse.json(search);
}
