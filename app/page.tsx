"use client";
import SearchSongCard from "@/components/SearchSongCard";
import { KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { SongDetailed } from "ytmusic-api";

import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";

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
              " font-bold transition-all break-words max-w-100%"
            }
          >
            <span className="text-red-600 title-red-glow break-words max-w-100%">
              YT
            </span>
            MDL
          </p>
          <p>Download music from youtube</p>
        </div>
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
        <div
          className={
            " flex items-center flex-col min-w-[300px] gap-y-2 w-full lg:w-[50%] px-3"
          }
        >
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
        </div>
        <p className="text-gray-500 text-sm text-center">
          No YouTube media or other information is hosted on the website;
          everything is fetched directly.
        </p>
        <p className="text-gray-500 text-sm text-center">
          This website relies on YouTube for sourcing songs, which is not ideal
          for downloading high-quality versions. It's better to use other
          services for that purpose.
        </p>
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
      <div
        id="downloadPopup"
        style={{ display: "none" }}
        className=" flex-row justify-center items-center h-screen w-screen fixed top-0 left-0 bg-[#00000094] text-white"
      >
        <div className="border-white border-2 rounded-lg p-3 w-[75%] h-[75%] bg-black overflow-hidden flex flex-col justify-center items-center">
          <p id="downloadPhaseTitle" className="text-4xl text-center"></p>
          <p id="downloadPhaseDesc" className="text-2xl text-center"></p>
          <div
            id="downloadProgress"
            className=" flex-row gap-x-2 justify-center items-center text-white w-full md:w-[50%]"
            style={{ display: "none" }}
          >
            <div className="h-2 rounded-xl w-full bg-neutral-600">
              <div
                id="downloadProgressPercentage"
                className="h-full bg-red-600 div-red-glow rounded-inherit"
              ></div>
            </div>
            {/* <progress
              id="downloadProgressPercentage"
              value="0"
              max="100"
              className="w-full "
            /> */}
            <p className="min-w-[4ch] text-right" id="progressValue"></p>
          </div>
        </div>
      </div>
    </main>
  );
}
