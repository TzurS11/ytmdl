import ytdl from "@distube/ytdl-core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: any) {
  try {
    const id = context.params.id;
    const url = `https://www.youtube.com/watch?v=${id}`;

    // Fetch video information
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    const durationInSeconds = parseInt(videoDetails.lengthSeconds, 10);

    // Limit the duration to 15 minutes (900 seconds)
    if (durationInSeconds > 900) {
      return new Response("Video exceeds the maximum duration of 15 minutes", {
        status: 400,
      });
    }

    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });
    const totalSize = parseInt(audioFormat.contentLength, 10);

    // Parse the Range header
    const range = request.headers.get("Range");
    let start = 0;
    let end = totalSize - 1;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : end;
    }

    // Ensure range is valid
    if (start >= totalSize || end >= totalSize) {
      return new Response(
        "Requested range not satisfiable\n" +
          start +
          " - " +
          end +
          " / " +
          totalSize,
        {
          status: 416,
          headers: {
            "Content-Range": `bytes */${totalSize}`,
          },
        }
      );
    }
    // Fetch the audio stream for the specified range
    const stream = ytdl.downloadFromInfo(info, {
      filter: "audioonly",
      quality: "highestaudio",
      range: { start, end },
    });

    // Convert the Readable stream to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Set response headers
    const headers = new Headers();
    headers.set("Content-Range", `bytes ${start}-${end}/${totalSize}`);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", (end - start + 1).toString());
    headers.set("Content-Type", "audio/mpeg");

    return new Response(buffer, {
      status: 206, // Partial Content
      headers,
    });
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    return new Response("Failed to fetch audio stream", { status: 500 });
  }
}
