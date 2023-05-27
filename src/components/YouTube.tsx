import { useEffect, useState } from "react";

const YOUTUBE_API_URL = "https://www.youtube.com/iframe_api";
const YOUTUBE_PLAYER_ID = "__youtube-player__";
const VIDEO_WIDTH = 288;
const VIDEO_HEIGHT = 208;
export const DEFAULT_YOUTUBE_VIDEO_ID = "hx3UIED9cQw";

type YouTubePlayer = {
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  seekTo: (timeSeconds: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getVideoData: () => { title: string; video_id: string };
};

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
      setPlayer(await getYouTubePlayer(DEFAULT_YOUTUBE_VIDEO_ID));
    })();
  }, [globalPlayer]);
  return player;
};

export const YouTubePlayer = () => {
  useYouTubePlayer();
  return <div className="h-52 w-72" id={YOUTUBE_PLAYER_ID}></div>;
};
