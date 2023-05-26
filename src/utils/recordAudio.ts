export type Recorder = {
  start: StartRecorder;
  stop: StopRecorder;
};

export type StartRecorder = () => void;

export type StopRecorder = () => Promise<{
  audioBlob: Blob;
  audioUrl: string;
  play: () => void;
}>;

export const recordAudio = (): Promise<Recorder> => {
  return new Promise((resolve) => {
    void (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = [
        "audio/wav",
        "audio/mpeg",
        "audio/webm",
        "audio/ogg",
      ].find((audioMimeType) => MediaRecorder.isTypeSupported(audioMimeType));
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      let audioChunks: Blob[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      const start: StartRecorder = () => {
        audioChunks = [];
        mediaRecorder.start();
      };

      const stop: StopRecorder = () =>
        new Promise((resolve) => {
          mediaRecorder.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            const play = () => void audio.play();
            stream.getTracks().forEach((track) => track.stop());
            resolve({ audioBlob, audioUrl, play });
          });

          mediaRecorder.stop();
        });

      resolve({ start, stop });
    })();
  });
};
