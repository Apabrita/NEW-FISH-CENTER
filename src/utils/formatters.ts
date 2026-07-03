export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "₹0";
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export const formatWeight = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0.00 kg";
  return value.toFixed(2) + " kg";
};
