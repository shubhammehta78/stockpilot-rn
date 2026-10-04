import {Holding,holdings} from "./mock";
import {loadSnapshot,saveSnapshot} from "../store/storage";

export interface PortfolioRepository{
  getHoldings():Promise<Holding[]>;
  saveHoldings(items:Holding[]):Promise<void>;
}

const KEY="holdings";

export const portfolioRepository:PortfolioRepository={
  async getHoldings(){return (await loadSnapshot<Holding[]>(KEY)) ?? holdings;},
  async saveHoldings(items){await saveSnapshot(items,KEY);}
};
