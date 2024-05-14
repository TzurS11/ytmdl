// import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";
// import ytstream from "yt-stream";

// const cacheLink = new Map<string, string>();

// export async function GET(request: Request, context: any) {
//   const id = context.params.id;

//   try {
//     // Get the stream URL for the YouTube audio
//     const stream = await ytstream.stream(
//       `https://www.youtube.com/watch?v=${id}`,
//       {
//         quality: "high",
//         type: "audio",
//         highWaterMark: 1048576 * 32,
//         download: false,
//       }
//     );
//     // Fetch the stream data
//     const response = await fetch(stream.url, {
//       cache: "no-cache",
//     });

//     // Check if the response is successful
//     if (!response.ok) {
//       throw new Error(`Failed to fetch audio stream: ${response.statusText}`);
//     }

//     // Create a new response with the stream data
//     const headers = new Headers(response.headers);
//     headers.set("Content-Type", "audio/mpeg");

//     return new Response(response.body, {
//       status: response.status,
//       statusText: response.statusText,
//       headers,
//     });
//   } catch (error) {
//     console.error("Error fetching audio stream:", error);
//     return new Response("Failed to fetch audio stream", { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";
import { StatusCodes } from "http-status-codes";
import { userReuqestedSong } from "../../search/globals";

export async function GET(request: NextRequest, context: any) {
  try {
    const id = context.params.id;

    // Fetch the stream URL for the YouTube audio using ytdl-core
    const streamURL = ytdl(`https://www.youtube.com/watch?v=${id}`, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });

    // Convert the Readable stream to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of streamURL) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create a new response with the buffer
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    return new Response(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    return new Response("Failed to fetch audio stream", { status: 500 });
  }
}
