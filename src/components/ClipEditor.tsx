import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { formatVideoTime } from "~/utils/formatVideoTime";
import {
  FastForwardSvg,
  FastRewindSvg,
  PlaySvg,
  SaveSvg,
} from "~/components/Icons";
import { type Clip } from "~/components/Clips";

export const ClipEditor = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  saveClips,
  lastPauseVideoTimeoutId,
}: {
  startTime: number;
  setStartTime: Dispatch<SetStateAction<number>>;
  endTime: number;
  setEndTime: Dispatch<SetStateAction<number>>;
  saveClips: (updateClips: (clips: Clip[]) => Clip[]) => void;
  lastPauseVideoTimeoutId: MutableRefObject<NodeJS.Timeout | undefined>;
}) => {
  return (
    <article className="flex flex-col items-center gap-3">
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
          onClick={() => setEndTime((endTime) => Math.max(0, endTime - 0.2))}
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
    </article>
  );
};
