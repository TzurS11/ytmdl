"use client";
import { Mp3Encoder } from "@breezystack/lamejs";
import { ID3Writer } from "browser-id3-writer";
import { useEffect, useState } from "react";
import { iso6392 } from "iso-639-2";
import { BrowserView, MobileView } from "react-device-detect";
import YTMusic, { SongDetailed } from "ytmusic-api";
interface Props {
  song: SongDetailed;
  handleAlbum?: () => void;
  handleArtist?: () => void;
}

export default function SearchSongCard({
  song,
  handleAlbum,
  handleArtist,
}: Props) {
  let fromAlbum = song.duration == null;
  const album = song.album;
  const [permSong, setPermSong] = useState<SongDetailed>(song);
  const [duration, setDuration] = useState<undefined | string>(undefined);
  const toHHMMSS = (secs: string) => {
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

      const downloadProgress = document.getElementById(
        "downloadProgress"
      ) as HTMLDivElement;

      const downloadProgressPercentage = document.getElementById(
        "downloadProgressPercentage"
      ) as HTMLDivElement;
      const progressValue = document.getElementById(
        "progressValue"
      ) as HTMLParagraphElement;

      downloadMenuTitle.innerText = "Fetching";
      downloadMenuDesc.innerText = "Fetching the audio file from the API";

      const response = await fetch(`/api/download/${permSong.videoId}`);
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

      downloadMenuTitle.innerText = "Encoding";
      downloadMenuDesc.innerText = "Encoding the audio samples in blocks";

      const worker = new Worker(new URL("./worker.ts", import.meta.url));
      worker.postMessage([
        leftSamples,
        rightSamples,
        decodedData.sampleRate,
        256,
      ]);

      worker.addEventListener("message", async (mes) => {
        if (mes.data[1] != undefined) {
          const update = (Math.random() * 200).toFixed(0) == "1";
          if (update) {
            downloadProgress.style.display = "flex";
            progressValue.innerText = (mes.data[1] * 100).toFixed(0) + "%";
            downloadProgressPercentage.style.width = mes.data[1] * 100 + "%";
            return;
          }
        }
        if (mes.data[0] == undefined) return;
        const mp3Data = mes.data[0] as Uint8Array[];

        downloadProgress.style.display = "none";

        downloadMenuTitle.innerText = "Finishing";
        downloadMenuDesc.innerText = "Finishing the MP3 encoding";

        downloadMenuTitle.innerText = "Blobing";
        downloadMenuDesc.innerText =
          "Creating a Blob from the encoded MP3 data";
        const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
        const arrayBuffer = await mp3Blob.arrayBuffer();

        downloadMenuTitle.innerText = "Poster";
        downloadMenuDesc.innerText = "Fetching cover image of the song";
        const imageResponse = await fetch(
          `/api/coverimage/${encodeURIComponent(
            permSong.thumbnails[permSong.thumbnails.length - 1].url
          )}`
        );
        const imageBlob = await imageResponse.blob();
        const albumArtData = await imageBlob.arrayBuffer();

        downloadMenuTitle.innerText = "Tagging";
        downloadMenuDesc.innerText = "Adding tags to the file";
        const writer = new ID3Writer(arrayBuffer);
        writer
          .setFrame("TIT2", permSong.name)
          .setFrame("TPE1", [permSong.artist.name])
          .setFrame("TALB", album?.name || "");
        writer.setFrame("APIC", {
          type: 3,
          data: albumArtData,
          description: "Cover",
          useUnicodeEncoding: false,
        });
        type lyricsFetch = {
          lyrics: string[];
          id: string;
          language: string;
        };
        const lyrics = await fetch(`/api/lyrics/${permSong.videoId}`)
          .then((res) => res.json())
          .then((lyrics: lyricsFetch) => {
            return lyrics;
          });
        if (lyrics.lyrics.length > 0) {
          console.log(lyrics.language);
          writer.setFrame("USLT", {
            description: "",
            lyrics: lyrics.lyrics.toString(),
            language: lyrics.language,
          });
        }

        writer.addTag();

        const taggedMp3Blob = writer.getBlob();

        downloadMenuTitle.innerText = "Downloading";
        downloadMenuDesc.innerText =
          "Creating a download link for the MP3 file";
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(taggedMp3Blob);
        downloadLink.download = `${permSong.artist.name} - ${permSong.name}.mp3`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        downloadPopup.style.display = "none";
      });
    } catch (error) {
      downloadPopup.style.display = "none";
      console.error("Error converting to MP3:", error);
    }
  };

  useEffect(() => {
    fetch(`/api/search/song/${permSong.videoId}`)
      .then((res) => res.json())
      .then((data: SongDetailed) => {
        if (data.duration != null) {
          setDuration(toHHMMSS(data.duration.toString()));
        }
        if (fromAlbum) {
          data.thumbnails = [
            {
              height: 0,
              width: 0,
              url: song.thumbnails[song.thumbnails.length - 1].url,
            },
          ];
        }
        setPermSong(data);
      });
  }, []);

  return (
    <>
      {/* <BrowserView> */}
      <div className="items-center flex-wrap sm:flex-nowrap min-h-[100px] gap-x-1 flex flex-row bg bg-[#ffffff10] rounded-lg hover:border-white border-[#ffffff00] transition-colors duration-300 border-2 ">
        <div className="shrink-0 relative w-full sm:w-[100px] h-full">
          <img
            className="relative shrink-0 w-fit sm:w-fit h-full rounded-md"
            src={`/api/coverimage/${encodeURIComponent(
              permSong.thumbnails[permSong.thumbnails.length - 1].url
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
              youtubePlayer.src = `https://www.youtube.com/embed/${permSong.videoId}?autoplay=1&enablejsapi=1`;
              const popup = document.getElementById(
                "popupyoutubeiframe"
              ) as HTMLElement;
              popup.style.display = "flex";
            }}
            className="cursor-pointer rounded-md overflow-hidden flex flex-row justify-center items-center top-0 absolute w-full h-full opacity-0 hover:opacity-100 transition-opacity bg-[#00000075]"
          >
            <img
              id={`playIMG_${permSong.videoId}`}
              src="/play.svg"
              className="w-[55%] h-[55%] playButton"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row  min-h-[100px] w-full justify-between flex-wrap sm:flex-nowrap">
          <div className="flex flex-col justify-between gap-y-1">
            <div>
              <p className="font-bold text-xl">{permSong.name}</p>
              <p
                onClick={handleArtist}
                className="cursor-pointer"
                title="Show top songs by artist"
              >
                {permSong.artist.name}
              </p>
            </div>
            <div>
              <div className="flex flex-row gap-x-3 flex-wrap sm:flex-nowrap">
                {duration && (
                  <div className="flex flex-row gap-x-1 items-center">
                    <img src="/time.svg" className="w-5" alt="" />
                    <p className="h-fit">{duration}</p>
                  </div>
                )}
                {album && (
                  <div
                    onClick={handleAlbum}
                    title="Show all songs in album"
                    className="flex flex-row gap-x-1 items-center cursor-pointer"
                  >
                    <img src="/album.svg" className="w-5" alt="" />
                    <p className="h-fit">{album.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col justify-between items-end gap-y-1">
            <img
              onClick={handleConvertToMP3}
              src="/download.svg"
              className="w-[50px] shrink-0 cursor-pointer bg-[#ffffff10] rounded-md"
              alt=""
            />
            <a
              // href={`https://www.youtube.com/watch?v=${permSong.videoId}`}
              // target="_blank"
              title="Share song"
              onClick={() => {
                navigator.share({
                  url: `https://www.youtube.com/watch?v=${permSong.videoId}`,
                });
                // navigator.clipboard.writeText(
                //   `https://www.youtube.com/watch?v=${permSong.videoId}`
                // );
              }}
              className="cursor-pointer h-fit flex flex-row gap-1 bg-[#ffffff10] p-[2px] rounded-md"
            >
              <img src="/share.svg" className="w-5" alt="" />
              <p className="h-fit">{permSong.videoId}</p>
            </a>
          </div>
        </div>
      </div>
      {/* </BrowserView> */}
      {/* <MobileView>
        <div className=" items-center p-1 min-h-[100px] gap-x-1 flex flex-col bg bg-[#ffffff10] rounded-lg hover:border-white border-[#ffffff00] transition-colors duration-300 border-2 ">
          <div className="shrink-0 relative w-full h-fit">
            <img
              className="relative shrink-0 max-w-full w-full h-full rounded-md"
              src={`/api/coverimage/${encodeURIComponent(
                permSong.thumbnails[permSong.thumbnails.length - 1].url
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
                youtubePlayer.src = `https://www.youtube.com/embed/${permSong.videoId}?autoplay=1&enablejsapi=1`;
                const popup = document.getElementById(
                  "popupyoutubeiframe"
                ) as HTMLElement;
                popup.style.display = "flex";
              }}
              className="cursor-pointer rounded-md overflow-hidden flex flex-row justify-center items-center top-0 absolute w-full h-full opacity-0 hover:opacity-100 transition-opacity bg-[#00000075]"
            >
              <img
                id={`playIMG_${permSong.videoId}`}
                src="/play.svg"
                className="w-[55%] h-[55%] playButton"
              />
            </div>
          </div>
          <div className="flex flex-col min-h-[100px] w-full justify-between flex-wrap sm:flex-nowrap">
            <div className="flex flex-col justify-between gap-y-1">
              <div>
                <p className="font-bold text-xl">{permSong.name}</p>
                <p>{permSong.artist.name}</p>
              </div>
              <div>
                <div className="flex flex-row gap-x-3 flex-wrap sm:flex-nowrap">
                  <div className="flex flex-row gap-x-1 items-center">
                    <img src="/time.svg" className="w-5" alt="" />
                    <p className="h-fit">{duration}</p>
                  </div>
                  {album && (
                    <div className="flex flex-row gap-x-1 items-center">
                      <img src="/album.svg" className="w-5" alt="" />
                      <p className="h-fit">{album.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col justify-between items-end gap-y-1">
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
                    `https://www.youtube.com/watch?v=${permSong.videoId}`
                  );
                }}
                className="cursor-pointer h-fit flex flex-row gap-1 bg-[#ffffff10] p-[2px] rounded-md"
              >
                <img src="/share.svg" className="w-5" alt="" />
                <p className="h-fit">{permSong.videoId}</p>
              </div>
            </div>
          </div>
        </div>
      </MobileView> */}
    </>
  );
}
