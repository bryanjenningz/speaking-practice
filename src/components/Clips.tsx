import { formatVideoTime } from "~/utils/formatVideoTime";
import { CloseSvg } from "./Icons";
import { useEffect, useState } from "react";

type Clip = {
  id: number;
  videoId: string;
  title: string;
  startTime: number;
  endTime: number;
};

const LOCALSTORAGE_CLIPS_KEY = "__CLIPS__";

const parseClips = (localStorageValue: string | null): Clip[] => {
  if (!localStorageValue) return [];
  const parsedValue: unknown = JSON.parse(localStorageValue);
  if (!Array.isArray(parsedValue)) return [];
  const values: unknown[] = parsedValue;
  const isEveryValueAClip = values.every(
    (x): x is Clip =>
      !!x &&
      typeof x === "object" &&
      "id" in x &&
      typeof x.id === "number" &&
      "videoId" in x &&
      typeof x.videoId === "string" &&
      "title" in x &&
      typeof x.title === "string" &&
      "startTime" in x &&
      typeof x.startTime === "number" &&
      "endTime" in x &&
      typeof x.endTime === "number"
  );
  if (!isEveryValueAClip) return [];
  return values;
};

export const useClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);

  const saveClips = (updateClips: (clips: Clip[]) => Clip[]) => {
    setClips((clips) => {
      const newClips = updateClips(clips);
      localStorage.setItem(LOCALSTORAGE_CLIPS_KEY, JSON.stringify(newClips));
      return newClips;
    });
  };

  // The reason why we have to use useEffect is because we're using server-side
  // rendering (SSR) and the client and server both need to initially render the
  // same values. If we set the clips to the parsed localStorage value, it would
  // be different on the client and server since the server doesn't have
  // localStorage.
  useEffect(() => {
    try {
      setClips(parseClips(localStorage.getItem(LOCALSTORAGE_CLIPS_KEY)));
    } catch {
      // Do nothing if there's an error accessing localStorage or parsing clips
    }
  }, []);

  return { clips, saveClips };
};

export const Clips = ({
  clips,
  onPlayClip,
  onDeleteClip,
}: {
  clips: Clip[];
  onPlayClip: (clip: Clip) => void;
  onDeleteClip: (deletedClip: Clip) => void;
}) => {
  return (
    <ul className="flex w-full max-w-2xl flex-col gap-1">
      {clips.map((clip) => {
        const clipText = `${[...clip.title]
          .slice(0, 8)
          .join("")}... ${formatVideoTime(clip.startTime)} - ${formatVideoTime(
          clip.endTime
        )}`;

        return (
          <li
            key={clip.id}
            className="flex items-center justify-between gap-3 rounded-full bg-slate-700 px-3 text-sm transition duration-300 hover:bg-slate-600"
          >
            <button
              className="grow py-2 text-left"
              onClick={() => onPlayClip(clip)}
            >
              {clipText}
            </button>
            <button
              className="flex items-center justify-center"
              onClick={() => onDeleteClip(clip)}
            >
              <CloseSvg />
              <span className="sr-only">Delete</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
