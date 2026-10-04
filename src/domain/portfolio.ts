import {Holding} from "../data/mock";

export function holdingValue(h:Holding){return h.shares*h.price}
export function holdingPnl(h:Holding){return (h.price-h.avgPrice)*h.shares}
export function portfolioValue(items:Holding[]){return items.reduce((sum,h)=>sum+holdingValue(h),0)}
export function investedValue(items:Holding[]){return items.reduce((sum,h)=>sum+h.shares*h.avgPrice,0)}
export function portfolioPnl(items:Holding[]){return portfolioValue(items)-investedValue(items)}
export function portfolioReturn(items:Holding[]){const invested=investedValue(items);return invested===0?0:(portfolioPnl(items)/invested)*100}
