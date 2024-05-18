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
//     console.log(stream.url);
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

//! VAR 2

import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";
import { StatusCodes } from "http-status-codes";
import { userReuqestedSong } from "../../search/globals";
import { FFmpeg } from "@ffmpeg/ffmpeg";

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
    // headers.set("Content-Type", "application/json");
    return new Response(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    return new Response("Failed to fetch audio stream", { status: 500 });
  }
}

//! VAR 3

// import { NextRequest, NextResponse } from "next/server";
// import ytdl from "ytdl-core";
// import { spawn } from "child_process";
// import { StatusCodes } from "http-status-codes";

// export async function GET(request: NextRequest, context: any) {
//   try {
//     const id = context.params.id;
//     const videoURL = `https://www.youtube.com/watch?v=${id}`;

//     // Fetch the stream URL for the YouTube audio using ytdl-core
//     const audioStream = ytdl(videoURL, {
//       filter: "audioonly",
//       quality: "highestaudio",
//       highWaterMark: 1 << 25,
//     });

//     // Use child_process to call ffmpeg for converting the audio stream to MP3
//     const ffmpegProcess = spawn("ffmpeg", [
//       "-i",
//       "pipe:0", // Input from stdin
//       "-f",
//       "mp3", // Output format
//       "-ab",
//       "192k", // Audio bitrate
//       "-ac",
//       "2", // Number of audio channels
//       "-ar",
//       "44100", // Sampling frequency
//       "-vn", // No video
//       "pipe:1", // Output to stdout
//     ]);

//     // Pipe the audio stream from ytdl-core to ffmpeg
//     audioStream.pipe(ffmpegProcess.stdin);

//     // Collect the converted chunks
//     const chunks: Uint8Array[] = [];
//     for await (const chunk of ffmpegProcess.stdout) {
//       chunks.push(chunk);
//     }
//     const buffer = Buffer.concat(chunks);

//     // Create a new response with the MP3 buffer
//     const headers = new Headers({
//       "Content-Type": "audio/mpeg",
//       // "Content-Disposition": `attachment; filename="${id}.mp3"`,
//     });

//     return new Response(buffer, {
//       status: StatusCodes.OK,
//       headers,
//     });
//   } catch (error) {
//     console.error("Error fetching or converting audio stream:", error);
//     return new Response("Failed to fetch or convert audio stream", {
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//     });
//   }
// }
