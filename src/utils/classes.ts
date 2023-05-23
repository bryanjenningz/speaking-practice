export const classes = (...args: (false | null | string)[]): string => {
  return args.filter(Boolean).join(" ");
};
