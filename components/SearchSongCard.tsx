"use client";
import { Mp3Encoder } from "@breezystack/lamejs";
import { ID3Writer } from "browser-id3-writer";
import { useState } from "react";
import { SongDetailed } from "ytmusic-api";

interface Props {
  song: SongDetailed;
}

export default function SearchSongCard({ song }: Props) {
  var toHHMMSS = (secs: string) => {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  const handleConvertToMP3 = async () => {
    const downloadPopup = document.getElementById(
      "downloadPopup"
    ) as HTMLDivElement;
    try {
      const downloadMenuTitle = document.getElementById(
        "downloadPhaseTitle"
      ) as HTMLParagraphElement;
      const downloadMenuDesc = document.getElementById(
        "downloadPhaseDesc"
      ) as HTMLParagraphElement;
      downloadPopup.style.display = "flex";

      const downloadProgressPercentage = document.getElementById(
        "downloadProgressPercentage"
      ) as HTMLProgressElement;

      downloadMenuTitle.innerText = "Fetching";
      downloadMenuDesc.innerText = "Fetching the audio file from the API";

      const response = await fetch(`/api/download/${song.videoId}`);
      const webAData = await response.arrayBuffer();

      downloadMenuTitle.innerText = "Decoding";
      downloadMenuDesc.innerText = "Decoding the WebA audio data";
      const audioContext = new window.AudioContext();
      const decodedData = await audioContext.decodeAudioData(webAData);
      downloadMenuTitle.innerText = "Extracting";
      downloadMenuDesc.innerText =
        "Extracting the left and right audio channels";
      const leftChannel = decodedData.getChannelData(0);
      const rightChannel =
        decodedData.numberOfChannels > 1
          ? decodedData.getChannelData(1)
          : leftChannel;

      downloadMenuTitle.innerText = "Initializing";
      downloadMenuDesc.innerText = "Initializing the MP3 encoder";
      const mp3Encoder = new Mp3Encoder(2, decodedData.sampleRate, 256);

      downloadMenuTitle.innerText = "Converting";
      downloadMenuDesc.innerText = "Converting the audio samples to 16-bit PCM";
      const leftSamples = new Int16Array(
        leftChannel.map((sample) => sample * 32767)
      );
      const rightSamples = new Int16Array(
        rightChannel.map((sample) => sample * 32767)
      );

      const mp3Data: Uint8Array[] = [];
      const blockSize = 1152;

      downloadMenuTitle.innerText = "Encoding";
      downloadMenuDesc.innerText = "Encoding the audio samples in blocks";
      downloadProgressPercentage.style.display = "initial";
      for (let i = 0; i < leftSamples.length; i += blockSize) {
        const leftChunk = leftSamples.subarray(i, i + blockSize);
        const rightChunk = rightSamples.subarray(i, i + blockSize);
        const mp3Buffer = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3Buffer.length > 0) {
          mp3Data.push(mp3Buffer);
        }
        console.log((i / leftSamples.length) * 100);
        downloadProgressPercentage.value = (i / leftSamples.length) * 100;
      }
      downloadProgressPercentage.style.display = "none";

      downloadMenuTitle.innerText = "Finishing";
      downloadMenuDesc.innerText = "Finishing the MP3 encoding";
      const mp3End = mp3Encoder.flush();
      if (mp3End.length > 0) {
        mp3Data.push(mp3End);
      }

      downloadMenuTitle.innerText = "Blobing";
      downloadMenuDesc.innerText = "Creating a Blob from the encoded MP3 data";
      const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
      const arrayBuffer = await mp3Blob.arrayBuffer();

      downloadMenuTitle.innerText = "Poster";
      downloadMenuDesc.innerText = "Fetching cover image of the song";
      let albumArtData: ArrayBuffer;
      const imageResponse = await fetch(
        `/api/coverimage/${encodeURIComponent(
          song.thumbnails[song.thumbnails.length - 1].url
        )}`
      );
      const imageBlob = await imageResponse.blob();
      albumArtData = await imageBlob.arrayBuffer();

      downloadMenuTitle.innerText = "Tagging";
      downloadMenuDesc.innerText = "Adding tags to the file";
      const writer = new ID3Writer(arrayBuffer);
      writer
        .setFrame("TIT2", song.name)
        .setFrame("TPE1", [song.artist.name])
        .setFrame("TALB", song.album?.name || "");
      writer.setFrame("APIC", {
        type: 3,
        data: albumArtData,
        description: "Cover",
        useUnicodeEncoding: false,
      });

      writer.addTag();

      const taggedMp3Blob = writer.getBlob();

      downloadMenuTitle.innerText = "Downloading";
      downloadMenuDesc.innerText = "Creating a download link for the MP3 file";
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(taggedMp3Blob);
      downloadLink.download = `${song.artist.name} - ${song.name}.mp3`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      downloadPopup.style.display = "none";
    } catch (error) {
      downloadPopup.style.display = "none";
      console.error("Error converting to MP3:", error);
    }
  };

  let duration: undefined | string = undefined;
  if (song.duration) duration = toHHMMSS(song.duration.toString());
  return (
    <div className="items-center flex-wrap sm:flex-nowrap min-h-[100px] gap-x-1 flex flex-row bg bg-[#ffffff10] rounded-lg hover:border-white border-[#ffffff00] transition-colors duration-300 border-2 ">
      <div className="shrink-0 relative w-fit h-fit">
        <img
          className="relative shrink-0 max-w-[100px]  w-full h-full rounded-md"
          src={`/api/coverimage/${encodeURIComponent(
            song.thumbnails[song.thumbnails.length - 1].url
          )}`}
          onError={(event) => {
            event.currentTarget.src = "/favicon.ico";
          }}
          alt=""
          crossOrigin="anonymous"
        />
        <div
          onClick={() => {
            const youtubePlayer = document.getElementById(
              "youtube-player"
            ) as any;

            youtubePlayer.src = `https://www.youtube.com/embed/${song.videoId}?autoplay=1&enablejsapi=1`;
            const popup = document.getElementById(
              "popupyoutubeiframe"
            ) as HTMLElement;
            popup.style.display = "flex";
            song.album?.name;
          }}
          className="cursor-pointer rounded-md overflow-hidden flex flex-row justify-center items-center top-0 absolute w-full h-full opacity-0 hover:opacity-100 transition-opacity bg-[#00000075]"
        >
          <img
            id={`playIMG_${song.videoId}`}
            src="/play.svg"
            className="w-[55%] h-[55%] playButton"
          />
        </div>
      </div>
      <div className="flex flex-row  min-h-[100px] w-full justify-between flex-wrap sm:flex-nowrap">
        <div className="flex flex-col justify-between gap-y-1">
          <div>
            <p className="font-bold text-xl">{song.name}</p>
            <p>{song.artist.name}</p>
          </div>
          <div>
            <div className="flex flex-row gap-x-3 flex-wrap sm:flex-nowrap">
              <div className="flex flex-row gap-x-1 items-center">
                <img src="/time.svg" className="w-5" alt="" />
                <p className="h-fit">{duration}</p>
              </div>
              {song.album && (
                <div className="flex flex-row gap-x-1 items-center">
                  <img src="/album.svg" className="w-5" alt="" />
                  <p className="h-fit">{song.album.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex flex-col justify-between items-end gap-y-1">
          {/* <a
            href={`/api/download/${song.videoId}`}
            download={song.artist.name + " - " + song.name + ".mp3"}
          >
            <img
              // onClick={download}
              src="/download.svg"
              className="w-[50px] shrink-0 cursor-pointer bg-[#ffffff10] rounded-md"
              alt=""
            />
          </a> */}
          <img
            onClick={handleConvertToMP3}
            src="/download.svg"
            className="w-[50px] shrink-0 cursor-pointer bg-[#ffffff10] rounded-md"
            alt=""
          />
          <div
            title="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://www.youtube.com/watch?v=${song.videoId}`
              );
            }}
            className="cursor-pointer h-fit flex flex-row gap-1 bg-[#ffffff10] p-[2px] rounded-md"
          >
            <img src="/share.svg" className="w-5" alt="" />
            <p className="h-fit">{song.videoId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
