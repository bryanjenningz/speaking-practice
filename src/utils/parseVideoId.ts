const parseVideoIdFromQueryParam = (s: string): string | null => {
  return s.match(/v\=(?<videoId>[a-zA-Z0-9-_]+)/)?.groups?.videoId ?? null;
};

const parseVideoIdFromShortenedUrl = (s: string): string | null => {
  return (
    s.match(/youtu\.be\/(?<videoId>[a-zA-Z0-9-_]+)/)?.groups?.videoId ?? null
  );
};

export const parseVideoId = (s: string): string => {
  const videoIdFromQueryParam = parseVideoIdFromQueryParam(s);
  if (videoIdFromQueryParam) return videoIdFromQueryParam;
  const videoIdFromShortenedUrl = parseVideoIdFromShortenedUrl(s);
  if (videoIdFromShortenedUrl) return videoIdFromShortenedUrl;
  return s;
};
