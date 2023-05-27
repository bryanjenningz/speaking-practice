import { useRef, useState } from "react";
import { recordAudio, type Recorder } from "~/utils/recordAudio";
import { MicrophoneSvg, StopSvg, AudioSvg } from "~/components/Icons";

type SavedAudio =
  | { type: "NO_AUDIO_SAVED" }
  | { type: "RECORDING_AUDIO" }
  | { type: "RECORDED_AUDIO"; play: () => void };

export const AudioRecorder = () => {
  const recorder = useRef<null | Recorder>(null);
  const [savedAudio, setSavedAudio] = useState<SavedAudio>({
    type: "NO_AUDIO_SAVED",
  });

  return (
    <section className="flex items-center gap-5">
      <button
        className="flex flex-col items-center rounded-2xl bg-slate-700 px-4 py-2 uppercase text-white transition duration-300 hover:bg-slate-600"
        onClick={() =>
          void (async () => {
            const audioRecorder = recorder.current ?? (await recordAudio());
            recorder.current = audioRecorder;

            const record = () => {
              audioRecorder.start();
              setSavedAudio({ type: "RECORDING_AUDIO" });
            };

            const stop = async () => {
              const { play } = await audioRecorder.stop();
              setSavedAudio({ type: "RECORDED_AUDIO", play });
              recorder.current = null;
              return;
            };

            switch (savedAudio.type) {
              case "NO_AUDIO_SAVED":
                return record();
              case "RECORDING_AUDIO":
                return void stop();
              case "RECORDED_AUDIO":
                return record();
            }
          })()
        }
      >
        {((): JSX.Element => {
          switch (savedAudio.type) {
            case "NO_AUDIO_SAVED":
              return (
                <>
                  <MicrophoneSvg />
                  <span className="text-[8px]">Speak</span>
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
                  <span className="text-[8px]">Speak</span>
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
  );
};
