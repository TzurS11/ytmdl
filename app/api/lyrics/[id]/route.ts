import YTMusic from "ytmusic-api";

import { NextResponse } from "next/server";
import LanguageDetect from "languagedetect";
import { iso6392 } from "iso-639-2";

const ytmusic = new YTMusic();
let isInitialized = false;

export async function GET(request: Request, context: any) {
  const id = context.params.id;
  if (isInitialized === false)
    await ytmusic.initialize().then(() => {
      isInitialized = true;
    });

  const lyrics = (await ytmusic.getLyrics(id)) || [];
  const language = new LanguageDetect().detect(lyrics.toString())[0][0];
  const langCode = iso6392.filter(
    (lang) => lang.name.toLowerCase() == language.toLowerCase()
  )[0].iso6392B;
  return NextResponse.json({ lyrics, id, language: langCode });
}
