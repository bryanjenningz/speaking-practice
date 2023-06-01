import { useEffect, useRef, useState } from "react";
import { PlaySvg } from "~/components/Icons";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: {
        new (
          youtubePlayerId: string,
          options: {
            height: number;
            width: number;
            videoId: string;
            playerVars: { playsinline: 1 };
          }
        ): YouTubePlayer;
      };
    };
    player?: YouTubePlayer;
  }
}

type YouTubePlayer = {
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  seekTo: (timeSeconds: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getVideoData: () => { title: string; video_id: string };
  getPlayerState: () => PlayerState;
};

type PlayerState = (typeof PLAYER_STATE)[keyof typeof PLAYER_STATE];

const YOUTUBE_API_URL = "https://www.youtube.com/iframe_api";
const YOUTUBE_PLAYER_ID = "__youtube-player__";
const VIDEO_WIDTH = 288;
const VIDEO_HEIGHT = 208;
const DEFAULT_YOUTUBE_VIDEO_ID = "o365GIr9Kvk";
const LOCALSTORAGE_YOUTUBE_VIDEO_ID_KEY = "__YOUTUBE_VIDEO_ID__";

const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  VIDEO_CUED: 5,
} as const;

const waitUntil = (condition: () => boolean): Promise<void> => {
  return new Promise((resolve) => {
    const waitTime = 10;
    const intervalId = setInterval(() => {
      if (!condition()) return;
      clearInterval(intervalId);
      resolve();
    }, waitTime);
  });
};

export const waitUntilPlayerIsPlaying = () =>
  waitUntil(() => window.player?.getPlayerState() === PLAYER_STATE.PLAYING);

const getYouTubePlayer = (
  videoId: string
): undefined | Promise<YouTubePlayer> => {
  if (typeof window === "undefined") return;
  if (window.player) return Promise.resolve(window.player);
  const youtubeApiScriptTag = document.createElement("script");
  youtubeApiScriptTag.src = YOUTUBE_API_URL;
  document.body.append(youtubeApiScriptTag);
  return new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => {
      const player = new window.YT.Player(YOUTUBE_PLAYER_ID, {
        height: VIDEO_HEIGHT,
        width: VIDEO_WIDTH,
        videoId,
        playerVars: { playsinline: 1 },
      });
      window.player = player;
      resolve(player);
    };
  });
};

const useYouTubePlayer = () => {
  const globalPlayer =
    typeof window === "undefined" ? undefined : window.player;
  const [player, setPlayer] = useState<undefined | YouTubePlayer>(globalPlayer);
  useEffect(() => {
    void (async () => {
      setPlayer(
        await getYouTubePlayer(
          localStorage.getItem(LOCALSTORAGE_YOUTUBE_VIDEO_ID_KEY) ||
            DEFAULT_YOUTUBE_VIDEO_ID
        )
      );
    })();
  }, [globalPlayer]);
  return player;
};

export const setYouTubeVideoId = (videoId: string) => {
  const player = window.player;
  if (!player || !videoId) return;
  player.loadVideoById(videoId);
  localStorage.setItem(LOCALSTORAGE_YOUTUBE_VIDEO_ID_KEY, videoId);
};

export const YouTubeSearch = () => {
  const videoIdTextbox = useRef<null | HTMLInputElement>(null);

  return (
    <form
      className="relative flex w-full max-w-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        setYouTubeVideoId(videoIdTextbox.current?.value ?? "");
      }}
    >
      <input
        className="grow rounded-full bg-slate-700 py-2 pl-4 pr-10 text-white"
        ref={videoIdTextbox}
        placeholder={`Video ID (e.g. ${DEFAULT_YOUTUBE_VIDEO_ID})`}
      />
      <button className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-2 transition duration-300 hover:text-slate-300">
        <PlaySvg />
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
};

export const YouTubePlayer = () => {
  useYouTubePlayer();
  return <div className="h-52 w-72" id={YOUTUBE_PLAYER_ID}></div>;
};
