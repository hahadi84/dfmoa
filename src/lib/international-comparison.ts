export function compareShoppingCosts(dutyFree: number, storePrice: number, refund: number, dutyFeePercent: number, storeFeePercent: number) {
  if (![dutyFree, storePrice, refund, dutyFeePercent, storeFeePercent].every(value => Number.isFinite(value) && value >= 0)
      || dutyFree <= 0 || storePrice <= 0 || refund > storePrice || dutyFeePercent > 100 || storeFeePercent > 100) return null;
  const dutyTotal = dutyFree * (1 + dutyFeePercent / 100);
  const storeTotal = storePrice * (1 + storeFeePercent / 100) - refund;
  return { dutyTotal, storeTotal, difference: storeTotal - dutyTotal };
}
