import { type NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import {
  YouTubePlayer,
  YouTubeSearch,
  setYouTubeVideoId,
  waitUntilPlayerIsPlaying,
} from "~/components/YouTube";
import { Clips, useClips } from "~/components/Clips";
import { ClipEditor } from "~/components/ClipEditor";
import { AudioRecorder } from "~/components/AudioRecorder";

const Home: NextPage = () => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const { clips, saveClips } = useClips();
  const lastPauseVideoTimeoutId = useRef<NodeJS.Timeout>();

  return (
    <>
      <Head>
        <title>Speaking Practice</title>
        <meta
          name="description"
          content="Save YouTube clips and record yourself trying to sound like the speaker."
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000" />
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-black text-white">
        <div className="container flex flex-col items-center justify-center gap-3 p-4">
          <YouTubeSearch />
          <YouTubePlayer />
          <ClipEditor
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            saveClips={saveClips}
            lastPauseVideoTimeoutId={lastPauseVideoTimeoutId}
          />
          <AudioRecorder />
          <Clips
            clips={clips}
            onPlayClip={(clip) => {
              void (async () => {
                setStartTime(clip.startTime);
                setEndTime(clip.endTime);
                const player = window.player;
                if (!player) return;
                const { video_id: videoId } = player.getVideoData();
                if (clip.videoId !== videoId) {
                  setYouTubeVideoId(clip.videoId);
                  await waitUntilPlayerIsPlaying();
                }
                player.seekTo(clip.startTime);
                player.playVideo();
                clearTimeout(lastPauseVideoTimeoutId.current);
                lastPauseVideoTimeoutId.current = setTimeout(() => {
                  player.pauseVideo();
                }, (clip.endTime - clip.startTime) * 1000);
              })();
            }}
            onDeleteClip={(deletedClip) => {
              saveClips((clips) =>
                clips.filter((clip) => clip.id !== deletedClip.id)
              );
            }}
          />
        </div>
      </main>
    </>
  );
};

export default Home;
