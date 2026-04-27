import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  value: number;
  percent?: number;
  showIcon?: boolean;
  className?: string;
}

export function PriceChange({ value, percent, showIcon = true, className }: Props) {
  const cls = value > 0 ? 'price-change price-change-pos' : value < 0 ? 'price-change price-change-neg' : 'price-change price-change-flat';
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const sign = value > 0 ? '+' : '';

  return (
    <span className={`${cls}${className ? ' ' + className : ''}`}>
      {showIcon && <Icon size={11} />}
      {sign}{value.toFixed(2)}
      {percent !== undefined && (
        <span className="price-change-sub">({sign}{percent.toFixed(2)}%)</span>
      )}
    </span>
  );
}

export function ColoredValue({ value, format = 'number', decimals = 2 }: {
  value: number;
  format?: 'number' | 'percent';
  decimals?: number;
}) {
  const cls = value > 0 ? 'num-pos' : value < 0 ? 'num-neg' : 'num-flat';
  const sign = value > 0 ? '+' : '';
  const suffix = format === 'percent' ? '%' : '';
  return <span className={cls}>{sign}{value.toFixed(decimals)}{suffix}</span>;
}
