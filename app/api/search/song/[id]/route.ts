import YTMusic from "ytmusic-api";

import { NextResponse } from "next/server";

const ytmusic = new YTMusic();
let isInitialized = false;

export async function GET(request: Request, context: any) {
  const id = context.params.id;
  if (isInitialized === false)
    await ytmusic.initialize().then(() => {
      isInitialized = true;
    });

  const song = await ytmusic.getSong(id);
  return NextResponse.json(song);
}
