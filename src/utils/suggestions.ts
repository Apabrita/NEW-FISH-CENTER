export const getSmartFishSuggestions = (
  transactions: any[],
  sourceId: string | number | null,
  buyerId: string | number | null,
  appDate: string,
) => {
  const counts: { [key: string]: number } = {};
  transactions.forEach((t) => {
    if (t.fish_type && t.date === appDate) {
      const matchSource = sourceId && String(t.source_id) === String(sourceId);
      const matchBuyer = buyerId && String(t.buyer_id) === String(buyerId);
      const weightBonus = (matchSource ? 5 : 0) + (matchBuyer ? 5 : 0) + 1;
      counts[t.fish_type] = (counts[t.fish_type] || 0) + weightBonus;
    }
  });

  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 8);
};

export const getSmartBuyerSuggestions = (
  transactions: any[],
  buyers: any[],
  sourceId: string | number | null,
  fishType: string,
) => {
  const counts: { [key: string]: number } = {};
  transactions.forEach((t) => {
    if (t.buyer_id) {
      const matchSource = sourceId && String(t.source_id) === String(sourceId);
      const matchFish =
        fishType && t.fish_type?.toLowerCase() === fishType.toLowerCase();
      const weightBonus = (matchSource ? 5 : 0) + (matchFish ? 5 : 0) + 1;
      counts[t.buyer_id] = (counts[t.buyer_id] || 0) + weightBonus;
    }
  });

  return buyers
    .map((b) => ({ ...b, score: counts[b.id] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
};
