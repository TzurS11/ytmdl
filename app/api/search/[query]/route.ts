import YTMusic, { SongDetailed } from "ytmusic-api";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Context } from "react";
import {
  searchQueryCache,
  recentSongID,
  addRecentSongID,
  addRecentCoverImage,
} from "@/app/globals";

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
  // search.forEach((song) => {
  //   addRecentSongID(song.videoId);
  //   addRecentCoverImage(song.thumbnails[song.thumbnails.length - 1].url);
  // });
  // searchQueryCache.set(query, search);
  return NextResponse.json(search);
}
