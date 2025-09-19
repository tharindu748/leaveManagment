export const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
export const formatSeconds = (total: number) => {
  const sign = total < 0 ? "-" : "";
  total = Math.abs(total);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${sign}${pad(h)}:${pad(m)}`;
};
export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
