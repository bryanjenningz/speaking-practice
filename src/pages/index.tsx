import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { YouTubePlayer, DEFAULT_YOUTUBE_VIDEO_ID } from "~/components/YouTube";
import { formatVideoTime } from "~/utils/formatVideoTime";

const Home: NextPage = () => {
  const [videoId, setVideoId] = useState("HZtaSGLP1v8");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
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
          <section>
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
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
