import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { YouTubePlayer, DEFAULT_YOUTUBE_VIDEO_ID } from "~/components/YouTube";
import { formatVideoTime } from "~/utils/formatVideoTime";
import { type Recorder, recordAudio } from "~/utils/recordAudio";

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

const MicrophoneSvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="M479.972-389q-53.798 0-91.429-37.65-37.63-37.651-37.63-91.437v-238.326q0-53.786 37.658-91.437 37.659-37.65 91.457-37.65 53.798 0 91.429 37.65 37.63 37.651 37.63 91.437v238.326q0 53.786-37.658 91.437Q533.77-389 479.972-389Zm-43.559 283.587v-123.956q-108.065-14.479-178.457-96.855-70.391-82.376-70.391-191.863h87.413q0 85.152 59.983 145.087 59.983 59.935 145.087 59.935 85.104 0 145.039-59.969 59.935-59.969 59.935-145.053h87.413q0 109.544-70.391 191.892-70.392 82.347-178.457 96.826v123.956h-87.174Z"
      />
    </svg>
  );
};

const StopSvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="M231.869-231.869v-496.262h496.262v496.262H231.869Z"
      />
    </svg>
  );
};

const PlaySvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="M311.869-185.413v-589.174L775.066-480 311.869-185.413Z"
      />
    </svg>
  );
};

const SaveSvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Z"
      />
    </svg>
  );
};

const AudioSvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"
      />
    </svg>
  );
};

const FastRewindSvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="M860-240 500-480l360-240v480Zm-400 0L100-480l360-240v480Z"
      />
    </svg>
  );
};

const FastForwardSvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="M100-240v-480l360 240-360 240Zm400 0v-480l360 240-360 240Z"
      />
    </svg>
  );
};

const CloseSvg = () => {
  return (
    <svg height="24" viewBox="0 -960 960 960" width="24">
      <path
        fill="currentColor"
        d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
      />
    </svg>
  );
};

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
