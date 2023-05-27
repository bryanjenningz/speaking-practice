import { type NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import { YouTubePlayer, YouTubeSearch } from "~/components/YouTube";
import { formatVideoTime } from "~/utils/formatVideoTime";
import {
  PlaySvg,
  FastRewindSvg,
  FastForwardSvg,
  SaveSvg,
} from "~/components/Icons";
import { Clips, useClips } from "~/components/Clips";
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
          content="Practice speaking in a foreign language by using YouTube."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-black text-white">
        <div className="container flex flex-col items-center justify-center gap-3 p-4">
          <YouTubeSearch />
          <YouTubePlayer />
          <section className="flex flex-col gap-3">
            <section className="flex items-center gap-5">
              <button
                className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
                onClick={() =>
                  setStartTime((startTime) => Math.max(0, startTime - 0.2))
                }
              >
                <FastRewindSvg />
                <span className="text-[8px]">{`-0.2 sec`}</span>
              </button>
              <button
                className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
                onClick={() => {
                  const player = window.player;
                  if (!player) return;
                  setStartTime(player.getCurrentTime());
                }}
              >
                <time>{formatVideoTime(startTime)}</time>
                <span className="text-[8px]">Start time</span>
              </button>
              <button
                className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
                onClick={() => setStartTime((startTime) => startTime + 0.2)}
              >
                <FastForwardSvg />
                <span className="text-[8px]">{`+0.2 sec`}</span>
              </button>
            </section>

            <section className="flex items-center gap-5">
              <button
                className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
                onClick={() =>
                  setEndTime((endTime) => Math.max(0, endTime - 0.2))
                }
              >
                <FastRewindSvg />
                <span className="text-[8px]">{`-0.2 sec`}</span>
              </button>
              <button
                className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
                onClick={() => {
                  const player = window.player;
                  if (!player) return;
                  setEndTime(player.getCurrentTime());
                }}
              >
                <time>{formatVideoTime(endTime)}</time>
                <span className="text-[8px]">End time</span>
              </button>
              <button
                className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
                onClick={() => setEndTime((endTime) => endTime + 0.2)}
              >
                <FastForwardSvg />
                <span className="text-[8px]">{`+0.2 sec`}</span>
              </button>
            </section>
          </section>

          <section className="flex items-center gap-5">
            <button
              className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
              onClick={() => {
                const player = window.player;
                if (!player) return;
                player.seekTo(startTime);
                player.playVideo();
                clearTimeout(lastPauseVideoTimeoutId.current);
                lastPauseVideoTimeoutId.current = setTimeout(() => {
                  player.pauseVideo();
                }, (endTime - startTime) * 1000);
              }}
            >
              <PlaySvg />
              <span className="text-[8px]">Play clip</span>
            </button>
            <button
              className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
              onClick={() => {
                const player = window.player;
                if (!player) return;
                const { title, video_id: videoId } = player.getVideoData();
                saveClips((clips) => [
                  ...clips,
                  { id: Math.random(), title, videoId, startTime, endTime },
                ]);
              }}
            >
              <SaveSvg />
              <span className="text-[8px]">Save clip</span>
            </button>
          </section>

          <AudioRecorder />

          <Clips
            clips={clips}
            onPlayClip={(clip) => {
              setStartTime(clip.startTime);
              setEndTime(clip.endTime);
              const player = window.player;
              if (!player) return;
              const { video_id: videoId } = player.getVideoData();
              if (clip.videoId !== videoId) {
                player.loadVideoById(clip.videoId);
              }
              player.seekTo(clip.startTime);
              player.playVideo();
              clearTimeout(lastPauseVideoTimeoutId.current);
              lastPauseVideoTimeoutId.current = setTimeout(() => {
                player.pauseVideo();
              }, (clip.endTime - clip.startTime) * 1000);
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
