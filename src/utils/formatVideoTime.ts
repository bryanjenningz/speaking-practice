export const formatVideoTime = (totalSeconds: number): string => {
  const tenthSeconds = String(Math.floor(totalSeconds * 10) % 10)[0] ?? "0";
  totalSeconds = Math.floor(totalSeconds);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  return `${minutes}:${seconds}.${tenthSeconds}`;
};
