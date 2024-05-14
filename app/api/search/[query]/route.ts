import YTMusic, { SongDetailed } from "ytmusic-api";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Context } from "react";

export const userReuqestedSong = new Set<string>();

const ytmusic = new YTMusic();
let isInitialized = false;

export async function GET(request: Request, context: any) {
  const query = context.params.query;
  // const cache = searchQueryCache.get(query);
  // if (cache != undefined) {
  //   return NextResponse.json(cache);
  // }
  if (isInitialized === false)
    await ytmusic.initialize().then(() => {
      isInitialized = true;
    });

  const search = await ytmusic.searchSongs(query);
  // console.log(recentSongID);
  search.forEach((song) => {
    userReuqestedSong.add(
      (request.headers.get("X-Forwarded-For") || "0") + "_" + song.videoId
    );
    setTimeout(() => {
      userReuqestedSong.delete(
        (request.headers.get("X-Forwarded-For") || "0") + "_" + song.videoId
      );
    }, 30 * 1000 * 60);
  });
  // searchQueryCache.set(query, search);
  return NextResponse.json(search);
}
