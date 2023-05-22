import { NextPage } from "next";
import { useEffect, useState } from "react";

const YOUTUBE_API_URL = "https://www.youtube.com/iframe_api";
const YOUTUBE_PLAYER_ID = "__youtube-player__";
const DEFAULT_YOUTUBE_VIDEO_ID = "M7lc1UVf-VE";

type YouTubePlayer = {};

const getYouTubePlayer = (
  videoId: string
): undefined | Promise<YouTubePlayer> => {
  if (typeof document === "undefined") return;
  const youtubeApiScriptTag = document.createElement("script");
  youtubeApiScriptTag.src = YOUTUBE_API_URL;
  document.body.append(youtubeApiScriptTag);
  return new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => {
      resolve(
        new window.YT.Player(YOUTUBE_PLAYER_ID, {
          height: 390,
          width: 640,
          videoId,
          playerVars: { playsinline: 1 },
        })
      );
    };
  });
};

const useYouTubePlayer = () => {
  const [player, setPlayer] = useState<undefined | YouTubePlayer>();
  useEffect(() => {
    (async () => {
      setPlayer(await getYouTubePlayer(DEFAULT_YOUTUBE_VIDEO_ID));
    })();
  }, []);
  return player;
};

export const YouTubePlayer: NextPage = () => {
  const player = useYouTubePlayer();
  return <div id={YOUTUBE_PLAYER_ID}></div>;
};
