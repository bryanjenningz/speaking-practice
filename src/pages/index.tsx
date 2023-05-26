import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { YouTubePlayer, DEFAULT_YOUTUBE_VIDEO_ID } from "~/components/YouTube";
import { formatVideoTime } from "~/utils/formatVideoTime";
import { type Recorder, recordAudio } from "~/utils/recordAudio";
import {
  PlaySvg,
  FastRewindSvg,
  FastForwardSvg,
  SaveSvg,
  MicrophoneSvg,
  StopSvg,
  AudioSvg,
  CloseSvg,
} from "../components/Icons";

const LOCALSTORAGE_CLIPS_KEY = "__CLIPS__";

type Clip = {
  id: number;
  videoId: string;
  startTime: number;
  endTime: number;
};

type SavedAudio =
  | { type: "NO_AUDIO_SAVED" }
  | { type: "RECORDING_AUDIO" }
  | { type: "RECORDED_AUDIO"; play: () => void };

const useClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);

  const saveClips = (updateClips: (clips: Clip[]) => Clip[]) => {
    setClips((clips) => {
      const newClips = updateClips(clips);
      localStorage.setItem(LOCALSTORAGE_CLIPS_KEY, JSON.stringify(newClips));
      return newClips;
    });
  };

  useEffect(() => {
    try {
      const clipsValue = localStorage.getItem(LOCALSTORAGE_CLIPS_KEY);
      if (clipsValue === null) return;
      const parsedValue: unknown = JSON.parse(clipsValue);
      if (!Array.isArray(parsedValue)) return;
      const parsedArray: unknown[] = parsedValue;
      if (
        !parsedArray.every(
          (x): x is Clip =>
            !!x &&
            typeof x === "object" &&
            "id" in x &&
            typeof x.id === "number" &&
            "videoId" in x &&
            typeof x.videoId === "string" &&
            "startTime" in x &&
            typeof x.startTime === "number" &&
            "endTime" in x &&
            typeof x.endTime === "number"
        )
      ) {
        return;
      }
      setClips(parsedArray);
    } catch {}
  }, []);

  return { clips, saveClips };
};

const Home: NextPage = () => {
  const [videoId, setVideoId] = useState(DEFAULT_YOUTUBE_VIDEO_ID);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const { clips, saveClips } = useClips();

  const recorder = useRef<null | Recorder>();
  const [savedAudio, setSavedAudio] = useState<SavedAudio>({
    type: "NO_AUDIO_SAVED",
  });

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
          <form
            className="relative flex w-full max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const player = window.player;
              if (!player) return;
              player.loadVideoById(videoId);
            }}
          >
            <input
              className="grow rounded-full bg-slate-700 py-2 pl-4 pr-10 text-white"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder={`Video ID (e.g. ${DEFAULT_YOUTUBE_VIDEO_ID})`}
            />
            <button className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-2 transition duration-300 hover:text-slate-300">
              <PlaySvg />
              <span className="sr-only">Search</span>
            </button>
          </form>
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
                setTimeout(() => {
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
                saveClips((clips) => [
                  ...clips,
                  { id: Math.random(), videoId, startTime, endTime },
                ]);
              }}
            >
              <SaveSvg />
              <span className="text-[8px]">Save clip</span>
            </button>
          </section>

          <section className="flex items-center gap-5">
            <button
              className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
              onClick={() => {
                const audioRecorder = recorder.current;
                if (!audioRecorder) {
                  return void (async () => {
                    recorder.current = await recordAudio();
                  })();
                }

                const record = () => {
                  audioRecorder.start();
                  setSavedAudio({ type: "RECORDING_AUDIO" });
                };

                const stop = async () => {
                  const { play } = await audioRecorder.stop();
                  setSavedAudio({ type: "RECORDED_AUDIO", play });
                };

                switch (savedAudio.type) {
                  case "NO_AUDIO_SAVED":
                    return record();
                  case "RECORDING_AUDIO":
                    return void stop();
                  case "RECORDED_AUDIO":
                    return record();
                }
              }}
            >
              {((): JSX.Element => {
                switch (savedAudio.type) {
                  case "NO_AUDIO_SAVED":
                    return (
                      <>
                        <MicrophoneSvg />
                        <span className="text-[8px]">Record</span>
                      </>
                    );
                  case "RECORDING_AUDIO":
                    return (
                      <>
                        <StopSvg />
                        <span className="text-[8px]">Stop</span>
                      </>
                    );
                  case "RECORDED_AUDIO":
                    return (
                      <>
                        <MicrophoneSvg />
                        <span className="text-[8px]">Record</span>
                      </>
                    );
                }
              })()}
            </button>

            <button
              className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600 disabled:bg-slate-500"
              onClick={() => {
                if (savedAudio.type !== "RECORDED_AUDIO") return;
                savedAudio.play();
              }}
              disabled={((): boolean => {
                switch (savedAudio.type) {
                  case "NO_AUDIO_SAVED":
                    return true;
                  case "RECORDING_AUDIO":
                    return true;
                  case "RECORDED_AUDIO":
                    return false;
                }
              })()}
            >
              <AudioSvg />
              <span className="text-[8px]">Listen</span>
            </button>
          </section>

          <ul className="flex w-full max-w-2xl flex-col gap-1">
            {clips.map((clip) => {
              const clipText = [clip.startTime, clip.endTime]
                .map(formatVideoTime)
                .join(" - ");
              return (
                <li
                  key={clip.id}
                  className="flex items-center justify-between gap-3 rounded-full bg-slate-700 px-3 text-sm transition duration-300 hover:bg-slate-600"
                >
                  <button
                    className="grow py-2 text-left"
                    onClick={() => {
                      setStartTime(clip.startTime);
                      setEndTime(clip.endTime);
                      const player = window.player;
                      if (!player) return;
                      player.seekTo(clip.startTime);
                      player.playVideo();
                      setTimeout(() => {
                        player.pauseVideo();
                      }, (clip.endTime - clip.startTime) * 1000);
                    }}
                  >
                    {clipText}
                  </button>
                  <button
                    className="flex items-center justify-center"
                    onClick={() =>
                      saveClips((clips) =>
                        clips.filter((c) => c.id !== clip.id)
                      )
                    }
                  >
                    <CloseSvg />
                    <span className="sr-only">Delete</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </>
  );
};

export default Home;
