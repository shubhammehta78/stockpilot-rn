export type Holding={id:string;symbol:string;name:string;shares:number;avgPrice:number;price:number;change:number};
export const holdings:Holding[]=[{id:"1",symbol:"AAPL",name:"Apple Inc.",shares:18,avgPrice:176.2,price:226.4,change:1.84},{id:"2",symbol:"NVDA",name:"NVIDIA Corporation",shares:12,avgPrice:118.5,price:188.7,change:3.21},{id:"3",symbol:"MSFT",name:"Microsoft Corporation",shares:8,avgPrice:382.4,price:515.1,change:-0.42},{id:"4",symbol:"AMZN",name:"Amazon.com Inc.",shares:10,avgPrice:181.3,price:231.8,change:1.12}];
export const watchlist=holdings.map(h=>({symbol:h.symbol,name:h.name,price:h.price,change:h.change}));
export const portfolioValue=holdings.reduce((s,h)=>s+h.shares*h.price,0);
export const investedValue=holdings.reduce((s,h)=>s+h.shares*h.avgPrice,0);