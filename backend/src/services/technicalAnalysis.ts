import { OHLCVBar, IndicatorSet, SignalType, SignalComponent, Recommendation } from '../types/index';

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = new Array(values.length).fill(NaN);

  // Find first valid start index
  let start = period - 1;
  if (start >= values.length) return result;

  // Seed with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  result[start] = sum / period;

  for (let i = start + 1; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

function sma(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += values[i - j];
    result[i] = sum / period;
  }
  return result;
}

function computeRSI(closes: number[], period = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN);
  if (closes.length < period + 1) return result;

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta > 0) avgGain += delta;
    else avgLoss += Math.abs(delta);
  }
  avgGain /= period;
  avgLoss /= period;

  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = 100 - 100 / (1 + rs0);

  for (let i = period + 1; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[i] = 100 - 100 / (1 + rs);
  }
  return result;
}

function computeMACD(
  closes: number[],
  fast = 12,
  slow = 26,
  signal = 9
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const ema12 = ema(closes, fast);
  const ema26 = ema(closes, slow);

  const macdLine: number[] = closes.map((_, i) => {
    if (isNaN(ema12[i]) || isNaN(ema26[i])) return NaN;
    return ema12[i] - ema26[i];
  });

  // Compute signal EMA only on valid MACD values
  const validMacd = macdLine.filter((v) => !isNaN(v));
  const macdEma = ema(validMacd, signal);

  const signalLine: number[] = new Array(closes.length).fill(NaN);
  let macdIdx = 0;
  for (let i = 0; i < closes.length; i++) {
    if (!isNaN(macdLine[i])) {
      if (!isNaN(macdEma[macdIdx])) {
        signalLine[i] = macdEma[macdIdx];
      }
      macdIdx++;
    }
  }

  const histogram = macdLine.map((v, i) => {
    if (isNaN(v) || isNaN(signalLine[i])) return NaN;
    return v - signalLine[i];
  });

  return { macdLine, signalLine, histogram };
}

function computeBollingerBands(
  closes: number[],
  period = 20,
  stdDev = 2
): { upper: number[]; middle: number[]; lower: number[]; percent: number[] } {
  const middle = sma(closes, period);
  const upper: number[] = new Array(closes.length).fill(NaN);
  const lower: number[] = new Array(closes.length).fill(NaN);
  const percent: number[] = new Array(closes.length).fill(NaN);

  for (let i = period - 1; i < closes.length; i++) {
    let sum = 0;
    const mean = middle[i];
    for (let j = 0; j < period; j++) sum += Math.pow(closes[i - j] - mean, 2);
    const sd = Math.sqrt(sum / period);
    upper[i] = mean + stdDev * sd;
    lower[i] = mean - stdDev * sd;
    const range = upper[i] - lower[i];
    percent[i] = range === 0 ? 0.5 : (closes[i] - lower[i]) / range;
  }

  return { upper, middle, lower, percent };
}

export function computeIndicators(bars: OHLCVBar[]): IndicatorSet {
  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume);

  const rsi = computeRSI(closes);
  const { macdLine, signalLine, histogram } = computeMACD(closes);
  const { upper, middle, lower, percent } = computeBollingerBands(closes);

  return {
    rsi,
    macdLine,
    macdSignal: signalLine,
    macdHistogram: histogram,
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    ema20: ema(closes, 20),
    ema200: ema(closes, 200),
    bbUpper: upper,
    bbMiddle: middle,
    bbLower: lower,
    bbPercent: percent,
    volumeMA20: sma(volumes, 20),
  };
}

function lastValid(arr: number[]): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (!isNaN(arr[i]) && isFinite(arr[i])) return arr[i];
  }
  return NaN;
}

export function computeRecommendation(bars: OHLCVBar[], indicators: IndicatorSet): Recommendation {
  const currentRSI = lastValid(indicators.rsi);
  const currentMACD = lastValid(indicators.macdHistogram);
  const prevMACD = (() => {
    for (let i = indicators.macdHistogram.length - 2; i >= 0; i--) {
      if (!isNaN(indicators.macdHistogram[i])) return indicators.macdHistogram[i];
    }
    return NaN;
  })();
  const currentBBPercent = lastValid(indicators.bbPercent);
  const currentClose = bars[bars.length - 1]?.close ?? NaN;
  const currentEMA200 = lastValid(indicators.ema200);
  const currentSMA20 = lastValid(indicators.sma20);
  const currentSMA50 = lastValid(indicators.sma50);
  const currentVolume = bars[bars.length - 1]?.volume ?? 0;
  const avgVolume = lastValid(indicators.volumeMA20);

  const components: SignalComponent[] = [];
  let totalScore = 0;

  // RSI component
  let rsiScore = 0;
  let rsiSignal = 'Neutral';
  if (!isNaN(currentRSI)) {
    if (currentRSI < 25) { rsiScore = 2; rsiSignal = 'Fuertemente sobrevendido'; }
    else if (currentRSI < 30) { rsiScore = 1; rsiSignal = 'Sobrevendido'; }
    else if (currentRSI > 75) { rsiScore = -2; rsiSignal = 'Fuertemente sobrecomprado'; }
    else if (currentRSI > 70) { rsiScore = -1; rsiSignal = 'Sobrecomprado'; }
    else { rsiScore = 0; rsiSignal = 'Neutral'; }
  }
  components.push({ name: 'RSI (14)', value: Math.round(currentRSI * 100) / 100, signal: rsiSignal, score: rsiScore });
  totalScore += rsiScore;

  // MACD component
  let macdScore = 0;
  let macdSignal = 'Neutral';
  if (!isNaN(currentMACD) && !isNaN(prevMACD)) {
    if (currentMACD > 0 && currentMACD > prevMACD) { macdScore = 2; macdSignal = 'Momentum alcista fuerte'; }
    else if (currentMACD > 0) { macdScore = 1; macdSignal = 'Momentum alcista'; }
    else if (currentMACD < 0 && currentMACD < prevMACD) { macdScore = -2; macdSignal = 'Momentum bajista fuerte'; }
    else if (currentMACD < 0) { macdScore = -1; macdSignal = 'Momentum bajista'; }
  }
  components.push({ name: 'MACD Histograma', value: Math.round(currentMACD * 10000) / 10000, signal: macdSignal, score: macdScore });
  totalScore += macdScore;

  // Bollinger Bands component
  let bbScore = 0;
  let bbSignal = 'Neutral';
  if (!isNaN(currentBBPercent)) {
    if (currentBBPercent < 0.10) { bbScore = 2; bbSignal = 'Precio muy por debajo de banda'; }
    else if (currentBBPercent < 0.25) { bbScore = 1; bbSignal = 'Precio en banda inferior'; }
    else if (currentBBPercent > 0.90) { bbScore = -2; bbSignal = 'Precio muy por encima de banda'; }
    else if (currentBBPercent > 0.75) { bbScore = -1; bbSignal = 'Precio en banda superior'; }
    else { bbScore = 0; bbSignal = 'Dentro de bandas'; }
  }
  components.push({ name: 'Bandas Bollinger', value: Math.round(currentBBPercent * 100) / 100, signal: bbSignal, score: bbScore });
  totalScore += bbScore;

  // Moving Averages component
  let maScore = 0;
  let maSignal = 'Neutral';
  const priceVsEMA200 = !isNaN(currentClose) && !isNaN(currentEMA200) && currentEMA200 !== 0
    ? ((currentClose - currentEMA200) / currentEMA200) * 100
    : NaN;

  if (!isNaN(currentClose) && !isNaN(currentEMA200) && !isNaN(currentSMA20) && !isNaN(currentSMA50)) {
    const aboveEMA200 = currentClose > currentEMA200;
    const goldenCross = currentSMA20 > currentSMA50;
    if (aboveEMA200 && goldenCross) { maScore = 2; maSignal = 'Tendencia alcista (Cruz Dorada)'; }
    else if (aboveEMA200) { maScore = 1; maSignal = 'Por encima de EMA200'; }
    else if (!aboveEMA200 && !goldenCross) { maScore = -2; maSignal = 'Tendencia bajista (Cruz de la Muerte)'; }
    else { maScore = -1; maSignal = 'Por debajo de EMA200'; }
  }
  components.push({ name: 'Medias Móviles', value: Math.round((priceVsEMA200 || 0) * 100) / 100, signal: maSignal, score: maScore });
  totalScore += maScore;

  // Volume confirmation
  let volScore = 0;
  let volSignal = 'Normal';
  if (!isNaN(avgVolume) && avgVolume > 0 && currentVolume > 0) {
    const isAboveAvg = currentVolume > avgVolume * 1.5;
    const lastChange = bars.length > 1 ? bars[bars.length - 1].close - bars[bars.length - 2].close : 0;
    if (isAboveAvg && lastChange > 0) { volScore = 1; volSignal = 'Volumen alto en día alcista'; }
    else if (isAboveAvg && lastChange < 0) { volScore = -1; volSignal = 'Volumen alto en día bajista'; }
    else { volScore = 0; volSignal = 'Volumen normal'; }
  }
  components.push({ name: 'Volumen', value: currentVolume, signal: volSignal, score: volScore });
  totalScore += volScore;

  let signal: SignalType;
  if (totalScore >= 5) signal = 'STRONG_BUY';
  else if (totalScore >= 2) signal = 'BUY';
  else if (totalScore <= -5) signal = 'STRONG_SELL';
  else if (totalScore <= -2) signal = 'SELL';
  else signal = 'NEUTRAL';

  return {
    signal,
    score: totalScore,
    components,
    currentRSI: Math.round(currentRSI * 100) / 100,
    currentMACD: Math.round(currentMACD * 10000) / 10000,
    currentBBPercent: Math.round(currentBBPercent * 100) / 100,
    priceVsEMA200: Math.round((priceVsEMA200 || 0) * 100) / 100,
  };
}
