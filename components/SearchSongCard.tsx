"use client";
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

  let duration: undefined | string = undefined;
  if (song.duration) duration = toHHMMSS(song.duration.toString());
  return (
    <div className="items-center min-h-[100px] gap-x-1 flex flex-row bg bg-[#ffffff10] rounded-lg hover:border-white border-[#ffffff00] transition-colors duration-300 border-2 ">
      <div className="shrink-0 relative w-fit h-fit">
        <img
          className="relative shrink-0 max-w-[100px]  w-full h-full rounded-md"
          src={`/api/coverimage/${encodeURIComponent(
            song.thumbnails[song.thumbnails.length - 1].url
          )}`}
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
      <div className="flex flex-row  min-h-[100px] w-full justify-between">
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
          <a
            href={`/api/download/${song.videoId}`}
            download={song.artist.name + " - " + song.name + ".webm"}
          >
            <img
              // onClick={download}
              src="/download.svg"
              className="w-[50px] shrink-0 cursor-pointer bg-[#ffffff10] rounded-md"
              alt=""
            />
          </a>
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

    // <div className="items-center min-h-[100px] gap-x-1 flex flex-row bg-[#ffffff10] rounded-lg hover:border-white border-transparent border-2">
    //   <img
    //     className="relative w-[100px] rounded-md"
    //     onError={(event) => {
    //       // const element = event.target as HTMLImageElement;
    //       // element.src = `/api/coverimage/${encodeURIComponent(
    //       //   song.thumbnails[song.thumbnails.length - 1].url
    //       // )}`;
    //     }}
    //     src={`/api/coverimage/${encodeURIComponent(
    //       song.thumbnails[song.thumbnails.length - 1].url
    //     )}`}
    //     alt=""
    //     crossOrigin="anonymous"
    //   />
    //   <div
    //     onClick={() => {
    //       const youtubePlayer = document.getElementById(
    //         "youtube-player"
    //       ) as any;

    //       youtubePlayer.src = `https://www.youtube.com/embed/${song.videoId}?autoplay=1&enablejsapi=1`;
    //       const popup = document.getElementById(
    //         "popupyoutubeiframe"
    //       ) as HTMLElement;
    //       popup.style.display = "flex";
    //       song.album?.name;
    //     }}
    //     className="cursor-pointer rounded-md overflow-hidden flex flex-row justify-center items-center absolute w-[100px] h-[100px] opacity-0 hover:opacity-100 bg-[#00000075]"
    //   >
    //     <img
    //       id={`playIMG_${song.videoId}`}
    //       src="/play.svg"
    //       className="w-[55%] h-[55%] playButton"
    //     />
    //   </div>

    //   <div className="p-1 flex flex-col h-full justify-between w-full">
    //     <div className="flex flex-row justify-between items-center">
    //       <div className="flex flex-col">
    //         <p className="font-bold text-xl cap-text max-w-[20ch] text-wrap">
    //           {song.name}
    //         </p>
    //         <p>{song.artist.name}</p>
    //       </div>
    //       <div>
    // <a
    //   href={`/api/download/${song.videoId}`}
    //   download={song.artist.name + " - " + song.name + ".mp3"}
    // >
    //   <img
    //     // onClick={download}
    //     src="/download.svg"
    //     className="w-[50px] cursor-pointer bg-[#ffffff10] rounded-md"
    //     alt=""
    //   />
    // </a>
    //       </div>
    //     </div>
    //     <div className="flex flex-row items-center gap-3 w-full justify-between">
    //       <div className="flex flex-row gap-3">
    //         <div className="flex flex-row gap-1 items-center">
    //           <img src="/time.svg" className="w-5" alt="" />
    //           <p className="h-fit">{duration}</p>
    //         </div>
    //         {song.album && (
    //           <div className="flex flex-row gap-1 items-center">
    //             <img src="/album.svg" className="w-5" alt="" />
    //             <p className="h-fit">{song.album.name}</p>
    //           </div>
    //         )}
    //       </div>

    //       <div
    //         title="Copy to clipboard"
    //         onClick={() => {
    //           navigator.clipboard.writeText(
    //             `https://www.youtube.com/watch?v=${song.videoId}`
    //           );
    //         }}
    //         className="cursor-pointer h-fit flex flex-row gap-1 bg-[#ffffff10] p-[2px] rounded-md"
    //       >
    //         <img src="/share.svg" className="w-5" alt="" />
    //         <p className="h-fit">{song.videoId}</p>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
