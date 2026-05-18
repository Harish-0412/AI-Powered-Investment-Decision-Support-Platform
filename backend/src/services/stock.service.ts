import { cacheGet, cacheSet } from "../lib/redis";

const STOCK_CACHE_TTL = 300;
const HISTORY_CACHE_TTL = 3600;
const LIST_CACHE_TTL = 180;
const PAGE_SIZE = 20;

// NSE/BSE universe symbol lists (real tickers on Yahoo Finance with .NS / .BO suffix)
const UNIVERSES: Record<string, string[]> = {
  "Nifty 50": [
    "RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS",
    "HINDUNILVR.NS","ITC.NS","SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS",
    "LT.NS","AXISBANK.NS","ASIANPAINT.NS","MARUTI.NS","SUNPHARMA.NS",
    "TITAN.NS","BAJFINANCE.NS","WIPRO.NS","ULTRACEMCO.NS","NESTLEIND.NS",
    "POWERGRID.NS","NTPC.NS","ONGC.NS","TECHM.NS","HCLTECH.NS",
    "BAJAJFINSV.NS","TATAMOTORS.NS","TATASTEEL.NS","ADANIENT.NS","ADANIPORTS.NS",
    "COALINDIA.NS","JSWSTEEL.NS","GRASIM.NS","CIPLA.NS","DRREDDY.NS",
    "DIVISLAB.NS","EICHERMOT.NS","HEROMOTOCO.NS","BPCL.NS","BRITANNIA.NS",
    "APOLLOHOSP.NS","TATACONSUM.NS","HINDALCO.NS","UPL.NS","SBILIFE.NS",
    "HDFCLIFE.NS","INDUSINDBK.NS","M&M.NS","BAJAJ-AUTO.NS","SHREECEM.NS"
  ],
  "Nifty Bank": [
    "HDFCBANK.NS","ICICIBANK.NS","KOTAKBANK.NS","AXISBANK.NS","SBIN.NS",
    "INDUSINDBK.NS","BANDHANBNK.NS","FEDERALBNK.NS","IDFCFIRSTB.NS","AUBANK.NS",
    "PNB.NS","BANKBARODA.NS"
  ],
  "Nifty 100": [
    "RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS",
    "HINDUNILVR.NS","ITC.NS","SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS",
    "LT.NS","AXISBANK.NS","ASIANPAINT.NS","MARUTI.NS","SUNPHARMA.NS",
    "TITAN.NS","BAJFINANCE.NS","WIPRO.NS","ULTRACEMCO.NS","NESTLEIND.NS",
    "POWERGRID.NS","NTPC.NS","ONGC.NS","TECHM.NS","HCLTECH.NS",
    "BAJAJFINSV.NS","TATAMOTORS.NS","TATASTEEL.NS","ADANIENT.NS","ADANIPORTS.NS",
    "COALINDIA.NS","JSWSTEEL.NS","GRASIM.NS","CIPLA.NS","DRREDDY.NS",
    "DIVISLAB.NS","EICHERMOT.NS","HEROMOTOCO.NS","BPCL.NS","BRITANNIA.NS",
    "APOLLOHOSP.NS","TATACONSUM.NS","HINDALCO.NS","UPL.NS","SBILIFE.NS",
    "HDFCLIFE.NS","INDUSINDBK.NS","M&M.NS","BAJAJ-AUTO.NS","SHREECEM.NS",
    "PIDILITIND.NS","SIEMENS.NS","HAVELLS.NS","DABUR.NS","MARICO.NS",
    "BERGEPAINT.NS","COLPAL.NS","GODREJCP.NS","MUTHOOTFIN.NS","CHOLAFIN.NS",
    "TORNTPHARM.NS","LUPIN.NS","BIOCON.NS","AUROPHARMA.NS","ALKEM.NS",
    "ZYDUSLIFE.NS","ABBOTINDIA.NS","GLAXO.NS","PFIZER.NS","SANOFI.NS",
    "TATAPOWER.NS","ADANIGREEN.NS","ADANITRANS.NS","TORNTPOWER.NS","CESC.NS",
    "INDIGO.NS","IRCTC.NS","CONCOR.NS","GMRINFRA.NS","AIAENG.NS",
    "VOLTAS.NS","WHIRLPOOL.NS","BLUESTARCO.NS","CROMPTON.NS","POLYCAB.NS",
    "MCDOWELL-N.NS","RADICO.NS","UNITEDSPRT.NS","VBL.NS","JUBLFOOD.NS",
    "DEVYANI.NS","WESTLIFE.NS","SAPPHIRE.NS","ZOMATO.NS","NYKAA.NS",
    "PAYTM.NS","POLICYBZR.NS","DELHIVERY.NS","CARTRADE.NS","EASEMYTRIP.NS"
  ],
  "Midcap 100": [
    "PIDILITIND.NS","SIEMENS.NS","HAVELLS.NS","DABUR.NS","MARICO.NS",
    "BERGEPAINT.NS","COLPAL.NS","GODREJCP.NS","MUTHOOTFIN.NS","CHOLAFIN.NS",
    "TORNTPHARM.NS","LUPIN.NS","BIOCON.NS","AUROPHARMA.NS","ALKEM.NS",
    "ZYDUSLIFE.NS","TATAPOWER.NS","ADANIGREEN.NS","TORNTPOWER.NS","CESC.NS",
    "INDIGO.NS","IRCTC.NS","CONCOR.NS","VOLTAS.NS","POLYCAB.NS",
    "ZOMATO.NS","NYKAA.NS","PAYTM.NS","DELHIVERY.NS","JUBLFOOD.NS",
    "MPHASIS.NS","LTTS.NS","COFORGE.NS","PERSISTENT.NS","KPITTECH.NS",
    "TRENT.NS","VEDL.NS","SAIL.NS","NMDC.NS","MOIL.NS",
    "BALKRISIND.NS","APOLLOTYRE.NS","MRF.NS","CEATLTD.NS","JKTYRE.NS",
    "SUNDRMFAST.NS","MOTHERSON.NS","BOSCHLTD.NS","SCHAEFFLER.NS","TIMKEN.NS",
    "AAVAS.NS","CANFINHOME.NS","HOMEFIRST.NS","APTUS.NS","REPCO.NS",
    "LALPATHLAB.NS","METROPOLIS.NS","THYROCARE.NS","KRSNAA.NS","VIJAYA.NS",
    "KIMS.NS","NARAYANA.NS","RAINBOW.NS","MEDANTA.NS","FORTIS.NS",
    "MAXHEALTH.NS","ASTER.NS","YATHARTH.NS","SUVENPHAR.NS","GRANULES.NS",
    "LAURUSLABS.NS","SOLARA.NS","SEQUENT.NS","GLAND.NS","STRIDES.NS",
    "IPCALAB.NS","AJANTPHARM.NS","NATCOPHARM.NS","JBCHEPHARM.NS","ERIS.NS",
    "IIFL.NS","MFSL.NS","ANGELONE.NS","5PAISA.NS","MOTILALOFS.NS",
    "HDFCAMC.NS","NIPPONLIFE.NS","UTIAMC.NS","ABSLAMC.NS","ICICIGI.NS",
    "NIACL.NS","STARHEALTH.NS","GODIGIT.NS","ACCELYA.NS","TANLA.NS",
    "ROUTE.NS","INDIAMART.NS","JUSTDIAL.NS","INFOEDGE.NS","MATRIMONY.NS"
  ],
  "NSE": [],
  "BSE": []
};

const SECTOR_MAP: Record<string, string[]> = {
  "Information Technology": ["TCS.NS","INFY.NS","WIPRO.NS","HCLTECH.NS","TECHM.NS","MPHASIS.NS","LTTS.NS","COFORGE.NS","PERSISTENT.NS","KPITTECH.NS"],
  "Banking": ["HDFCBANK.NS","ICICIBANK.NS","KOTAKBANK.NS","AXISBANK.NS","SBIN.NS","INDUSINDBK.NS","BANDHANBNK.NS","FEDERALBNK.NS","IDFCFIRSTB.NS","PNB.NS","BANKBARODA.NS"],
  "Financial Services": ["BAJFINANCE.NS","BAJAJFINSV.NS","MUTHOOTFIN.NS","CHOLAFIN.NS","HDFCLIFE.NS","SBILIFE.NS","IIFL.NS","ANGELONE.NS","HDFCAMC.NS","NIPPONLIFE.NS"],
  "Oil & Gas": ["RELIANCE.NS","ONGC.NS","BPCL.NS","IOC.NS","GAIL.NS","HINDPETRO.NS","MRPL.NS","CASTROLIND.NS"],
  "FMCG": ["HINDUNILVR.NS","ITC.NS","NESTLEIND.NS","BRITANNIA.NS","DABUR.NS","MARICO.NS","COLPAL.NS","GODREJCP.NS","TATACONSUM.NS","VBL.NS"],
  "Pharmaceuticals": ["SUNPHARMA.NS","CIPLA.NS","DRREDDY.NS","DIVISLAB.NS","LUPIN.NS","BIOCON.NS","AUROPHARMA.NS","ALKEM.NS","TORNTPHARM.NS","ZYDUSLIFE.NS"],
  "Automobiles": ["MARUTI.NS","TATAMOTORS.NS","EICHERMOT.NS","HEROMOTOCO.NS","BAJAJ-AUTO.NS","M&M.NS","TVSMOTOR.NS","ASHOKLEY.NS","ESCORTS.NS"],
  "Metals & Mining": ["TATASTEEL.NS","JSWSTEEL.NS","HINDALCO.NS","VEDL.NS","SAIL.NS","NMDC.NS","COALINDIA.NS","MOIL.NS","NATIONALUM.NS"],
  "Infrastructure": ["LT.NS","ADANIPORTS.NS","ADANIENT.NS","GMRINFRA.NS","IRB.NS","KNRCON.NS","PNCINFRA.NS","HGINFRA.NS"],
  "Power": ["POWERGRID.NS","NTPC.NS","TATAPOWER.NS","ADANIGREEN.NS","ADANITRANS.NS","TORNTPOWER.NS","CESC.NS","NHPC.NS","SJVN.NS"],
  "Cement": ["ULTRACEMCO.NS","SHREECEM.NS","AMBUJACEM.NS","ACC.NS","DALMIACEME.NS","RAMCOCEM.NS","JKCEMENT.NS","HEIDELBERG.NS"],
  "Consumer Durables": ["TITAN.NS","ASIANPAINT.NS","HAVELLS.NS","VOLTAS.NS","POLYCAB.NS","CROMPTON.NS","BLUESTARCO.NS","WHIRLPOOL.NS","BERGEPAINT.NS"],
  "Telecom": ["BHARTIARTL.NS","IDEA.NS","TATACOMM.NS","HFCL.NS","STLTECH.NS"],
  "Healthcare": ["APOLLOHOSP.NS","FORTIS.NS","MAXHEALTH.NS","NARAYANA.NS","KIMS.NS","LALPATHLAB.NS","METROPOLIS.NS","THYROCARE.NS"],
  "Retail": ["TRENT.NS","DMART.NS","JUBLFOOD.NS","WESTLIFE.NS","DEVYANI.NS","SAPPHIRE.NS","ZOMATO.NS","NYKAA.NS"],
  "Real Estate": ["DLF.NS","GODREJPROP.NS","OBEROIRLTY.NS","PRESTIGE.NS","BRIGADE.NS","SOBHA.NS","MAHLIFE.NS","PHOENIXLTD.NS"],
  "Aerospace & Defence": ["HAL.NS","BEL.NS","BEML.NS","MTAR.NS","PARAS.NS","DCAL.NS","IDEAFORGE.NS"],
  "Chemicals": ["PIDILITIND.NS","UPL.NS","SRF.NS","AARTI.NS","DEEPAKNTR.NS","NAVINFLUOR.NS","ALKYLAMINE.NS","CLEAN.NS"],
  "Textiles": ["PAGEIND.NS","RAYMOND.NS","ARVIND.NS","TRIDENT.NS","WELSPUNIND.NS","VARDHMAN.NS","NIITLTD.NS"]
};

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: Date;
}

export interface StockListItem {
  symbol: string;
  name: string;
  exchange: string;
  ltp: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  weekHigh52: number | null;
  weekLow52: number | null;
  sparkline: number[];
}

export interface StockListResult {
  stocks: StockListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `stock_quote:${normalizedSymbol}`;
  const cachedData = await cacheGet<StockQuote>(cacheKey);
  if (cachedData) return cachedData;

  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(normalizedSymbol)}`);
  if (!response.ok) throw new Error(`Yahoo Finance responded with ${response.status}`);

  const data = await response.json() as any;
  const result = data.chart?.result?.[0];
  if (!result?.meta?.regularMarketPrice || !result.meta.previousClose) {
    throw new Error("Yahoo Finance response did not include quote metadata");
  }

  const meta = result.meta;
  const quote: StockQuote = {
    symbol: normalizedSymbol,
    price: meta.regularMarketPrice,
    change: meta.regularMarketPrice - meta.previousClose,
    changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
    updatedAt: new Date()
  };

  await cacheSet(cacheKey, quote, STOCK_CACHE_TTL);
  return quote;
};

export const getHistoricalData = async (symbol: string, range: string = "1mo") => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `stock_history:${normalizedSymbol}:${range}`;
  const cachedData = await cacheGet(cacheKey);
  if (cachedData) return cachedData;

  const params = new URLSearchParams({ range, interval: "1d" });
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(normalizedSymbol)}?${params}`);
  if (!response.ok) throw new Error(`Yahoo Finance responded with ${response.status}`);

  const data = await response.json() as any;
  const result = data.chart?.result?.[0];
  if (!result?.timestamp || !result.indicators?.quote?.[0]) {
    throw new Error("Yahoo Finance response did not include historical data");
  }

  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];
  const history = timestamps.map((time: number, index: number) => ({
    date: new Date(time * 1000).toISOString().split("T")[0],
    open: quotes.open[index],
    high: quotes.high[index],
    low: quotes.low[index],
    close: quotes.close[index],
    volume: quotes.volume[index]
  }));

  await cacheSet(cacheKey, history, HISTORY_CACHE_TTL);
  return history;
};

const fetchYahooQuoteSummary = async (symbol: string): Promise<StockListItem | null> => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;

    const data = await res.json() as any;
    const result = data.chart?.result?.[0];
    if (!result?.meta) return null;

    const meta = result.meta;
    const closes: number[] = (result.indicators?.quote?.[0]?.close ?? []).filter((v: any) => v != null);
    const ltp: number = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prev: number = meta.previousClose ?? ltp;
    const change = ltp - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
    const marketCap: number | null = meta.marketCap ?? null;

    // Derive display name: strip .NS / .BO suffix
    const displaySymbol = symbol.replace(/\.(NS|BO)$/i, "");
    const longName: string = meta.longName || meta.shortName || displaySymbol;
    const exchange: string = meta.exchangeName || (symbol.endsWith(".NS") ? "NSE" : symbol.endsWith(".BO") ? "BSE" : "NSE");

    return {
      symbol: displaySymbol,
      name: longName,
      exchange,
      ltp,
      change,
      changePercent,
      marketCap,
      weekHigh52: meta.fiftyTwoWeekHigh ?? null,
      weekLow52: meta.fiftyTwoWeekLow ?? null,
      sparkline: closes.slice(-15)
    };
  } catch {
    return null;
  }
};

export const searchStocks = async (opts: {
  query: string;
  page: number;
  sector: string;
  marketCap: string;
  universe: string;
  alpha: string;
}): Promise<StockListResult> => {
  const cacheKey = `stock_list:${JSON.stringify(opts)}`;
  const cached = await cacheGet<StockListResult>(cacheKey);
  if (cached) return cached;

  // Determine base symbol pool
  let pool: string[];
  if (opts.sector && SECTOR_MAP[opts.sector]) {
    pool = SECTOR_MAP[opts.sector];
  } else if (opts.universe && UNIVERSES[opts.universe] && UNIVERSES[opts.universe].length > 0) {
    pool = UNIVERSES[opts.universe];
  } else {
    // Default: Nifty 100 as the base universe
    pool = UNIVERSES["Nifty 100"];
  }

  // Alphabetical filter
  if (opts.alpha) {
    pool = pool.filter(s => s.toUpperCase().startsWith(opts.alpha.toUpperCase()));
  }

  // Text search filter
  if (opts.query) {
    const q = opts.query.toUpperCase();
    pool = pool.filter(s => s.toUpperCase().includes(q));
  }

  const total = pool.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(opts.page, totalPages);
  const slice = pool.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Fetch live data in parallel (batches of 5 to avoid rate limits)
  const results: StockListItem[] = [];
  for (let i = 0; i < slice.length; i += 5) {
    const batch = slice.slice(i, i + 5);
    const settled = await Promise.allSettled(batch.map(fetchYahooQuoteSummary));
    for (const s of settled) {
      if (s.status === "fulfilled" && s.value) results.push(s.value);
    }
  }

  // Market cap filter (applied post-fetch)
  let filtered = results;
  if (opts.marketCap) {
    const CR = 1e7; // 1 crore = 10M
    filtered = results.filter(s => {
      if (!s.marketCap) return false;
      const capCr = s.marketCap / CR;
      if (opts.marketCap === "small") return capCr < 5000;
      if (opts.marketCap === "mid") return capCr >= 5000 && capCr < 20000;
      if (opts.marketCap === "large") return capCr >= 20000;
      return true;
    });
  }

  const result: StockListResult = {
    stocks: filtered,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages
  };

  await cacheSet(cacheKey, result, LIST_CACHE_TTL);
  return result;
};
