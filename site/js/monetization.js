export function provider(){return globalThis.TodayMayorMonetization||null}
export async function showRewardedAd(placement='daily-leaves'){const p=provider();if(!p?.showRewardedAd)return {ok:false,error:'PROVIDER_NOT_CONFIGURED'};return p.showRewardedAd({placement})}
export async function purchaseProduct(productId){const p=provider();if(!p?.purchase)return {ok:false,error:'PROVIDER_NOT_CONFIGURED'};return p.purchase({productId})}
