"use client";
import { Mp3Encoder } from "@breezystack/lamejs";
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
    try {
      const response = await fetch(`/api/download/${song.videoId}`);
      const webAData = await response.arrayBuffer();

      const audioContext = new window.AudioContext();
      const decodedData = await audioContext.decodeAudioData(webAData);

      const encoder = new Mp3Encoder(1, decodedData.sampleRate, 128);
      const samples = new Int16Array(
        decodedData.getChannelData(0).map((x) => x * 0x7fff)
      );
      const mp3Buffer = encoder.encodeBuffer(samples);
      const mp3Data = new Uint8Array(mp3Buffer);
      const mp3Blob = new Blob([mp3Data], { type: "audio/mp3" });

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(mp3Blob);
      downloadLink.download = `${song.artist.name} - ${song.name}.mp3`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error converting to MP3:", error);
      // You can handle the error here, such as showing an error message to the user
    }
  };

  let duration: undefined | string = undefined;
  if (song.duration) duration = toHHMMSS(song.duration.toString());
  return (
    <div className="items-center flex-wrap min-h-[100px] gap-x-1 flex flex-row bg bg-[#ffffff10] rounded-lg hover:border-white border-[#ffffff00] transition-colors duration-300 border-2 ">
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
      <div className="flex flex-row  min-h-[100px] w-full justify-between flex-wrap">
        <div className="flex flex-col justify-between gap-y-1">
          <div>
            <p className="font-bold text-xl">{song.name}</p>
            <p>{song.artist.name}</p>
          </div>
          <div>
            <div className="flex flex-row gap-x-3 flex-wrap">
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
