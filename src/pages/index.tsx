import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { YouTubePlayer, DEFAULT_YOUTUBE_VIDEO_ID } from "~/components/YouTube";
import { formatVideoTime } from "~/utils/formatVideoTime";
import { type Recorder, recordAudio } from "~/utils/recordAudio";

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

const Home: NextPage = () => {
  const [videoId, setVideoId] = useState(DEFAULT_YOUTUBE_VIDEO_ID);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [clips, setClips] = useState<Clip[]>([]);

  const recorder = useRef<null | Recorder>();
  useEffect(() => {
    void (async () => {
      recorder.current = await recordAudio();
    })();
  }, []);
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
        <div className="container flex flex-col items-center justify-center gap-12 p-5">
          <form
            className="flex w-full max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const player = window.player;
              if (!player) return;
              player.loadVideoById(videoId);
            }}
          >
            <input
              className="grow bg-slate-700 px-4 py-2 text-white"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder={`Video ID (e.g. ${DEFAULT_YOUTUBE_VIDEO_ID})`}
            />
            <button className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600">
              Done
            </button>
          </form>
          <YouTubePlayer />
          <section className="flex flex-col gap-3">
            <section className="flex items-center gap-5">
              <button
                className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
                onClick={() =>
                  setStartTime((startTime) => Math.max(0, startTime - 0.2))
                }
              >{`<`}</button>
              <button
                className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
                onClick={() => {
                  const player = window.player;
                  if (!player) return;
                  setStartTime(player.getCurrentTime());
                }}
                title="Start time"
              >
                {formatVideoTime(startTime)}
              </button>
              <button
                className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
                onClick={() => setStartTime((startTime) => startTime + 0.2)}
              >{`>`}</button>
            </section>

            <section className="flex items-center gap-5">
              <button
                className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
                onClick={() =>
                  setEndTime((endTime) => Math.max(0, endTime - 0.2))
                }
              >{`<`}</button>
              <button
                className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
                onClick={() => {
                  const player = window.player;
                  if (!player) return;
                  setEndTime(player.getCurrentTime());
                }}
                title="End time"
              >
                {formatVideoTime(endTime)}
              </button>
              <button
                className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
                onClick={() => setEndTime((endTime) => endTime + 0.2)}
              >{`>`}</button>
            </section>
          </section>

          <section className="flex items-center gap-5">
            <button
              className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
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
              Play clip
            </button>
            <button
              className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
              onClick={() => {
                setClips((clips) => [
                  ...clips,
                  { id: Math.random(), videoId, startTime, endTime },
                ]);
              }}
            >
              Save clip
            </button>
          </section>

          <section className="flex items-center gap-5">
            <button
              className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600"
              onClick={() => {
                const audioRecorder = recorder.current;
                if (!audioRecorder) return;

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
                    return <MicrophoneSvg />;
                  case "RECORDING_AUDIO":
                    return <StopSvg />;
                  case "RECORDED_AUDIO":
                    return <MicrophoneSvg />;
                }
              })()}
            </button>

            <button
              className="bg-blue-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-blue-600 disabled:bg-slate-500"
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
              <PlaySvg />
            </button>
          </section>

          <ul>
            {clips.map((clip) => {
              const clipText = [clip.startTime, clip.endTime]
                .map(formatVideoTime)
                .join(" - ");
              return (
                <li key={clip.id}>
                  <button
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
