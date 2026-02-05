export const safeName = (obj?: { name?: string }, fallback = '—') => {
  return obj?.name ?? fallback;
};
