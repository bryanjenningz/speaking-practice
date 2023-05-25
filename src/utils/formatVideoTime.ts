export const formatVideoTime = (totalSeconds: number): string => {
  // This is the easiest way to fix floating-point addition problems
  // (e.g. 1.4 + 0.2 === 1.5999999999999999, which means it displays 00:01.5
  // instead of 00:01.6). It has downsides but it's simple and only 1 line of code.
  // Another possible solution would be to store time as tenth-seconds so that
  // we would be working with integers and wouldn't have floating-point addition.
  // Another possible solution would be to store time as seconds but always round
  // it to the closest tenth-second whenever time is added or subtracted.
  totalSeconds += 0.000001;

  const tenthSeconds = String(Math.floor(totalSeconds * 10) % 10)[0] ?? "0";
  totalSeconds = Math.floor(totalSeconds);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  return `${minutes}:${seconds}.${tenthSeconds}`;
};
