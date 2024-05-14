"use client";
import SearchSongCard from "@/components/SearchSongCard";
import { KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { SongDetailed } from "ytmusic-api";

import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { search } from "yt-stream";

// export let player: YouTubeEvent<any> | undefined = undefined;

export default function Home() {
  let [searchResults, setSearchResults] = useState<SongDetailed[]>([]);
  let [resultsEmpty, setResultsEmpty] = useState<boolean>(false);
  function handleEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key != "Enter") return;
    const textField = event.target as HTMLInputElement;
    if (textField.value.trim() == "") {
      setResultsEmpty(false);
      return;
    }
    fetch(`/api/search/${textField.value}`)
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data);
        if (data.length > 0) {
          setResultsEmpty(false);
        } else {
          setResultsEmpty(true);
        }
      });
  }
  let opts: YouTubeProps["opts"] = {
    playerVars: {
      autoplay: 1,
    },
  };
  useEffect(() => {
    opts = {
      height: (screen.availHeight / 2).toString(),
      width: (screen.availWidth / 2).toString(),
      playerVars: {
        autoplay: 1,
      },
    };
  }, []);

  function handlePopupClick(event: MouseEvent) {
    const element = event.target as HTMLElement;
    if (element.tagName == "DIV") {
      const youtubePlayer = document.getElementById("youtube-player") as any;

      youtubePlayer.src = "";

      const popup = document.getElementById(
        "popupyoutubeiframe"
      ) as HTMLElement;
      popup.style.display = "none";
    }
  }

  return (
    <main className="py-10 flex flex-col min-h-screen items-center justify-center w-screen">
      <div className="flex flex-col w-full h-full items-center justify-center gap-y-3 bg-black text-white">
        <div className=" flex flex-col items-center">
          <p
            className={
              (searchResults.length > 0 ? "text-7xl" : "text-9xl") +
              " font-bold transition-all"
            }
          >
            <span className="text-red-600 title-red-glow">YT</span>MDL
          </p>
          <p>Download music from youtube</p>
        </div>
        <div className="flex items-center flex-col w-[50%] min-w-[300px] gap-y-2">
          <input
            enterKeyHint="search"
            onKeyDown={(event) => {
              handleEnter(event);
            }}
            type="text"
            name="query-ytmdl"
            placeholder="Search for a song"
            className="bg-transparent border-white border-2 rounded-lg p-2 focus:outline-none w-full"
            spellCheck="false"
          />

          {searchResults.length > 0 && (
            <div className="p-3 gap-y-3 flex flex-col overflow-hidden bg-transparent border-white border-2 rounded-lg w-full">
              {searchResults.map((item, index) => (
                <SearchSongCard key={index} song={item}></SearchSongCard>
              ))}
            </div>
          )}
          {resultsEmpty && (
            <div className="p-3 gap-y-3 flex flex-col items-center overflow-hidden bg-transparent rounded-lg w-full">
              <p>Couldn't find any songs</p>
            </div>
          )}
          <div className="flex flex-row gap-4 w-full justify-center">
            <a
              title="Star on github"
              href="https://github.com/TzurS11/ytmdl"
              target="_blank"
            >
              <div className="flex flex-row gap-1 items-center border-white border-[2px] bg-stone-900 p-1 rounded-md hover:bg-stone-800">
                <img src="/star.svg" alt="" />
                <p>Star</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div
        id="popupyoutubeiframe"
        onClick={(event) => {
          handlePopupClick(event);
        }}
        style={{ display: "none" }}
        className="top-0 left-0 gap-y-4 fixed h-screen w-screen bg-[#00000094] flex-col justify-center items-center"
      >
        <p className="text-white">Press anywhere to exit</p>
        <YouTube
          id="youtube-player"
          videoId=""
          className="border-white bg-black border-2 rounded-lg overflow-hidden w-fit h-fit"
          opts={opts}
        ></YouTube>
      </div>
    </main>
  );
}
