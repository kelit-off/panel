import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import { formatDay, formatDayLong } from '@/components/admin/analytics/format';

// Dark-surface values from the validated data-viz palette (slot 1 blue, slot 2 orange, fixed status hues).
export const palette = {
    series: [ '#3987e5', '#d95926' ],
    good: '#0ca30c',
    warning: '#fab219',
    critical: '#d03b3b',
    neutral: '#6b7280',
    grid: 'rgba(255, 255, 255, 0.07)',
    surface: '#1f2937',
    axis: '#9ca3af',
};

const useWidth = (): [ React.RefObject<HTMLDivElement>, number ] => {
    const ref = useRef<HTMLDivElement>(null);
    const [ width, setWidth ] = useState(0);

    useEffect(() => {
        const update = () => ref.current && setWidth(ref.current.clientWidth);
        update();
        window.addEventListener('resize', update);

        return () => window.removeEventListener('resize', update);
    }, []);

    return [ ref, width ];
};

const niceScale = (max: number, count = 4): { top: number; ticks: number[] } => {
    const raw = max <= 0 ? 1 : max / count;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow;
    const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
    const top = Math.max(step, Math.ceil(max / step) * step);
    const ticks: number[] = [];

    for (let value = 0; value <= top + step / 1000; value += step) {
        ticks.push(value);
    }

    return { top, ticks };
};

// Fewer date labels on narrow charts so neighbours never overlap.
const axisLabelIndexes = (count: number, width: number): number[] => {
    if (count <= 1) {
        return [ 0 ];
    }

    const steps = width < 460 ? 2 : 4;

    return Array.from(new Set(Array.from({ length: steps + 1 }, (_, i) => Math.round((i / steps) * (count - 1)))));
};

export interface ChartSeries {
    key: string;
    name: string;
    color: string;
}

export interface TablePayload {
    columns: string[];
    rows: (string | number)[][];
}

export const ChartCard = ({ title, subtitle, legend, table, children, className }: {
    title: string;
    subtitle?: string;
    legend?: ChartSeries[];
    table?: TablePayload;
    children: React.ReactNode;
    className?: string;
}) => {
    const [ showTable, setShowTable ] = useState(false);

    return (
        <section css={tw`flex flex-col overflow-hidden rounded-xl border border-white border-opacity-5 bg-neutral-800`} className={className}>
            <header css={tw`flex items-start justify-between gap-4 px-5 pt-5`}>
                <div css={tw`min-w-0`}>
                    <h3 css={tw`font-header text-sm font-bold text-neutral-100`}>{title}</h3>
                    {subtitle && <p css={tw`mt-0.5 text-xs text-neutral-400`}>{subtitle}</p>}
                </div>
                <div css={tw`flex flex-shrink-0 items-center gap-4`}>
                    {legend && legend.length > 1 && (
                        <ul css={tw`flex items-center gap-4`}>
                            {legend.map(item => (
                                <li key={item.key} css={tw`flex items-center gap-1.5 text-xs text-neutral-300`}>
                                    <span css={tw`inline-block rounded-full`} style={{ width: 10, height: 3, background: item.color }}/>
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    {table && (
                        <button
                            type={'button'}
                            aria-pressed={showTable}
                            onClick={() => setShowTable(!showTable)}
                            css={tw`rounded-md px-2 py-1 text-xs font-semibold text-neutral-400 hover:bg-white hover:bg-opacity-10 hover:text-neutral-100`}
                        >
                            {showTable ? 'Graphique' : 'Tableau'}
                        </button>
                    )}
                </div>
            </header>
            <div css={tw`flex-1 px-5 pb-5 pt-4`}>
                {showTable && table ? (
                    <div css={tw`overflow-auto`} style={{ maxHeight: 260 }}>
                        <table css={tw`w-full text-left text-xs`}>
                            <thead>
                                <tr>
                                    {table.columns.map(column => (
                                        <th key={column} css={tw`sticky top-0 bg-neutral-800 py-1.5 pr-4 font-semibold uppercase tracking-wider text-neutral-400`}>{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map((row, i) => (
                                    <tr key={i} css={tw`border-t border-white border-opacity-5`}>
                                        {row.map((cell, j) => (
                                            <td key={j} css={tw`py-1.5 pr-4 text-neutral-200`} style={{ fontVariantNumeric: 'tabular-nums' }}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : children}
            </div>
        </section>
    );
};

interface LineChartProps {
    data: { date: Date; [key: string]: number | Date }[];
    series: ChartSeries[];
    formatValue: (value: number) => string;
    height?: number;
    area?: boolean;
}

export const LineChart = ({ data, series, formatValue, height = 240, area = false }: LineChartProps) => {
    const [ ref, width ] = useWidth();
    const [ active, setActive ] = useState<number | null>(null);

    const margin = { top: 12, right: 14, bottom: 26, left: 44 };
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = height - margin.top - margin.bottom;
    const count = data.length;

    const max = Math.max(0, ...data.flatMap(point => series.map(s => Number(point[s.key]))));
    const { top, ticks } = niceScale(max);

    const x = (index: number) => margin.left + (count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth);
    const y = (value: number) => margin.top + plotHeight - (value / top) * plotHeight;

    const labelIndexes = axisLabelIndexes(count, width);

    const pathFor = (key: string) => data.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(Number(point[key])).toFixed(1)}`).join(' ');

    const onPointerMove = (event: React.PointerEvent<SVGRectElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        const ratio = plotWidth === 0 ? 0 : (event.clientX - box.left) / box.width;
        setActive(Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1)))));
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            setActive(current => Math.max(0, (current === null ? count - 1 : current) - 1));
        } else if (event.key === 'ArrowRight') {
            setActive(current => Math.min(count - 1, (current === null ? count - 1 : current) + 1));
        } else {
            return;
        }
        event.preventDefault();
    };

    const activePoint = active !== null ? data[active] : null;
    const tooltipLeft = active !== null ? x(active) : 0;
    const flip = width > 0 && tooltipLeft > width * 0.6;

    return (
        <div ref={ref} css={tw`relative w-full`} style={{ height }}>
            {width > 0 && (
                <svg
                    width={width}
                    height={height}
                    role={'img'}
                    aria-label={series.map(s => s.name).join(', ') + ' par jour'}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    onFocus={() => setActive(current => current === null ? count - 1 : current)}
                    onBlur={() => setActive(null)}
                    css={tw`block outline-none`}
                >
                    {ticks.map(tick => (
                        <g key={tick}>
                            <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke={palette.grid} strokeWidth={1}/>
                            <text x={margin.left - 8} y={y(tick)} textAnchor={'end'} dominantBaseline={'middle'} fill={palette.axis} fontSize={11}>
                                {formatValue(tick)}
                            </text>
                        </g>
                    ))}

                    {labelIndexes.map(index => (
                        <text
                            key={index}
                            x={x(index)}
                            y={height - 6}
                            textAnchor={index === 0 ? 'start' : index === count - 1 ? 'end' : 'middle'}
                            fill={palette.axis}
                            fontSize={11}
                        >
                            {formatDay(data[index].date)}
                        </text>
                    ))}

                    {area && series.map(s => (
                        <path
                            key={s.key + '-area'}
                            d={`${pathFor(s.key)} L${x(count - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`}
                            fill={s.color}
                            fillOpacity={0.1}
                        />
                    ))}

                    {series.map(s => (
                        <path key={s.key} d={pathFor(s.key)} fill={'none'} stroke={s.color} strokeWidth={2} strokeLinejoin={'round'} strokeLinecap={'round'}/>
                    ))}

                    {active === null && count > 0 && series.map(s => (
                        <circle key={s.key + '-end'} cx={x(count - 1)} cy={y(Number(data[count - 1][s.key]))} r={4} fill={s.color} stroke={palette.surface} strokeWidth={2}/>
                    ))}

                    {active !== null && (
                        <g>
                            <line x1={x(active)} x2={x(active)} y1={margin.top} y2={margin.top + plotHeight} stroke={palette.axis} strokeOpacity={0.5} strokeWidth={1}/>
                            {series.map(s => (
                                <circle key={s.key + '-dot'} cx={x(active)} cy={y(Number(data[active][s.key]))} r={4} fill={s.color} stroke={palette.surface} strokeWidth={2}/>
                            ))}
                        </g>
                    )}

                    <rect
                        x={margin.left}
                        y={margin.top}
                        width={plotWidth}
                        height={plotHeight}
                        fill={'transparent'}
                        onPointerMove={onPointerMove}
                        onPointerLeave={() => setActive(null)}
                    />
                </svg>
            )}

            {activePoint && (
                <div
                    css={tw`pointer-events-none absolute z-10 rounded-lg border border-white border-opacity-10 bg-neutral-900 px-3 py-2 shadow-lg`}
                    style={{ top: 8, left: tooltipLeft, transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})`, minWidth: 130 }}
                >
                    <p css={tw`mb-1 text-xs text-neutral-400`}>{formatDayLong(activePoint.date)}</p>
                    {series.map(s => (
                        <p key={s.key} css={tw`flex items-center gap-2 text-xs`}>
                            <span css={tw`inline-block rounded-full`} style={{ width: 10, height: 3, background: s.color }}/>
                            <strong css={tw`font-semibold text-neutral-50`}>{formatValue(Number(activePoint[s.key]))}</strong>
                            {series.length > 1 && <span css={tw`text-neutral-400`}>{s.name}</span>}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Sparkline = ({ values, color = palette.series[0] }: { values: number[]; color?: string }) => {
    const bucket = Math.ceil(values.length / 12);
    const points = Array.from({ length: Math.ceil(values.length / bucket) }, (_, i) => (
        values.slice(i * bucket, (i + 1) * bucket).reduce((a, b) => a + b, 0)
    ));
    const max = Math.max(1, ...points);
    const w = 84;
    const h = 28;
    const px = (i: number) => 4 + (points.length <= 1 ? 0 : (i / (points.length - 1)) * (w - 8));
    const py = (v: number) => h - 4 - (v / max) * (h - 8);

    return (
        <svg width={w} height={h} aria-hidden={'true'} css={tw`flex-shrink-0`}>
            <path
                d={points.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ')}
                fill={'none'}
                stroke={palette.neutral}
                strokeWidth={2}
                strokeLinejoin={'round'}
                strokeLinecap={'round'}
            />
            <circle cx={px(points.length - 1)} cy={py(points[points.length - 1])} r={4} fill={color} stroke={palette.surface} strokeWidth={2}/>
        </svg>
    );
};

export interface BarRow {
    label: string;
    sub?: string;
    value: number;
}

export const BarList = ({ rows, formatValue, color = palette.series[0] }: { rows: BarRow[]; formatValue: (value: number) => string; color?: string }) => {
    const max = Math.max(1, ...rows.map(row => row.value));

    return (
        <ul css={tw`space-y-1`}>
            {rows.map(row => (
                <li key={row.label} tabIndex={0} css={tw`rounded-lg px-2 py-2 outline-none hover:bg-white hover:bg-opacity-5 focus:bg-white focus:bg-opacity-5`}>
                    <div css={tw`flex items-baseline justify-between gap-3`}>
                        <span css={tw`truncate text-sm font-semibold text-neutral-100`}>{row.label}</span>
                        <span css={tw`flex-shrink-0 text-sm font-semibold text-neutral-50`} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatValue(row.value)}</span>
                    </div>
                    <div css={tw`mt-1.5 flex items-center gap-3`}>
                        <div css={tw`flex-1`} style={{ height: 10 }}>
                            <div
                                style={{
                                    width: `${Math.max(2, (row.value / max) * 100)}%`,
                                    height: 10,
                                    background: color,
                                    borderRadius: '0 4px 4px 0',
                                    opacity: 0.9,
                                }}
                            />
                        </div>
                        {row.sub && <span css={tw`flex-shrink-0 text-xs text-neutral-400`}>{row.sub}</span>}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export interface Segment {
    key: string;
    label: string;
    value: number;
    color: string;
}

export const SegmentedBar = ({ segments }: { segments: Segment[] }) => {
    const shown = segments.filter(segment => segment.value > 0);
    const total = shown.reduce((sum, segment) => sum + segment.value, 0);

    if (total === 0) {
        return <p css={tw`py-6 text-center text-sm text-neutral-500`}>Aucune commande pour le moment.</p>;
    }

    return (
        <div>
            <div css={tw`flex`} style={{ height: 14, gap: 2 }} role={'img'} aria-label={shown.map(s => `${s.label} : ${s.value}`).join(', ')}>
                {shown.map((segment, i) => (
                    <div
                        key={segment.key}
                        title={`${segment.label} : ${segment.value}`}
                        style={{
                            flex: segment.value,
                            background: segment.color,
                            borderRadius: `${i === 0 ? 4 : 0}px ${i === shown.length - 1 ? 4 : 0}px ${i === shown.length - 1 ? 4 : 0}px ${i === 0 ? 4 : 0}px`,
                        }}
                    />
                ))}
            </div>
            <ul css={tw`mt-5 space-y-2.5`}>
                {segments.map(segment => (
                    <li key={segment.key} css={tw`flex items-center gap-3 text-sm`}>
                        <span css={tw`inline-block flex-shrink-0 rounded-full`} style={{ width: 10, height: 10, background: segment.color }}/>
                        <span css={tw`flex-1 text-neutral-300`}>{segment.label}</span>
                        <strong css={tw`font-semibold text-neutral-50`} style={{ fontVariantNumeric: 'tabular-nums' }}>{segment.value}</strong>
                        <span css={tw`w-10 text-right text-xs text-neutral-400`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {Math.round((segment.value / total) * 100)} %
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const DivergingBars = ({ data, upLabel, downLabel, formatValue, height = 240 }: {
    data: { date: Date; up: number; down: number }[];
    upLabel: string;
    downLabel: string;
    formatValue: (value: number) => string;
    height?: number;
}) => {
    const [ ref, width ] = useWidth();
    const [ active, setActive ] = useState<number | null>(null);

    const margin = { top: 12, right: 14, bottom: 26, left: 52 };
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = height - margin.top - margin.bottom;
    const count = data.length;

    const upTop = niceScale(Math.max(0, ...data.map(point => point.up)), 2).top;
    const downTop = niceScale(Math.max(0, ...data.map(point => point.down)), 2).top;
    const unit = plotHeight / (upTop + downTop);
    const zeroY = margin.top + upTop * unit;
    const slot = count > 0 ? plotWidth / count : 0;
    const barWidth = Math.max(1, Math.min(18, slot * 0.7));
    const centerX = (index: number) => margin.left + (index + 0.5) * slot;

    const labelIndexes = axisLabelIndexes(count, width);

    const onPointerMove = (event: React.PointerEvent<SVGRectElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        const ratio = box.width === 0 ? 0 : (event.clientX - box.left) / box.width;
        setActive(Math.min(count - 1, Math.max(0, Math.floor(ratio * count))));
    };

    const activePoint = active !== null ? data[active] : null;
    const tooltipLeft = active !== null ? centerX(active) : 0;
    const flip = width > 0 && tooltipLeft > width * 0.6;

    return (
        <div ref={ref} css={tw`relative w-full`} style={{ height }}>
            {width > 0 && (
                <svg width={width} height={height} role={'img'} aria-label={`${upLabel} et ${downLabel} par jour`} css={tw`block`}>
                    {[ upTop, 0, -downTop ].map(tick => (
                        <g key={tick}>
                            <line
                                x1={margin.left}
                                x2={width - margin.right}
                                y1={zeroY - tick * unit}
                                y2={zeroY - tick * unit}
                                stroke={tick === 0 ? palette.axis : palette.grid}
                                strokeOpacity={tick === 0 ? 0.5 : 1}
                                strokeWidth={1}
                            />
                            <text x={margin.left - 8} y={zeroY - tick * unit} textAnchor={'end'} dominantBaseline={'middle'} fill={palette.axis} fontSize={11}>
                                {formatValue(Math.abs(tick))}
                            </text>
                        </g>
                    ))}

                    {labelIndexes.map(index => (
                        <text
                            key={index}
                            x={centerX(index)}
                            y={height - 6}
                            textAnchor={index === 0 ? 'start' : index === count - 1 ? 'end' : 'middle'}
                            fill={palette.axis}
                            fontSize={11}
                        >
                            {formatDay(data[index].date)}
                        </text>
                    ))}

                    {data.map((point, i) => (
                        <g key={i} opacity={active === null || active === i ? 1 : 0.45}>
                            {point.up > 0 && (
                                <rect x={centerX(i) - barWidth / 2} y={zeroY - point.up * unit} width={barWidth} height={point.up * unit} rx={2} fill={palette.good}/>
                            )}
                            {point.down > 0 && (
                                <rect x={centerX(i) - barWidth / 2} y={zeroY} width={barWidth} height={point.down * unit} rx={2} fill={palette.critical}/>
                            )}
                        </g>
                    ))}

                    <rect
                        x={margin.left}
                        y={margin.top}
                        width={plotWidth}
                        height={plotHeight}
                        fill={'transparent'}
                        onPointerMove={onPointerMove}
                        onPointerLeave={() => setActive(null)}
                    />
                </svg>
            )}

            {activePoint && (
                <div
                    css={tw`pointer-events-none absolute z-10 rounded-lg border border-white border-opacity-10 bg-neutral-900 px-3 py-2 shadow-lg`}
                    style={{ top: 8, left: tooltipLeft, transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})`, minWidth: 150 }}
                >
                    <p css={tw`mb-1 text-xs text-neutral-400`}>{formatDayLong(activePoint.date)}</p>
                    <p css={tw`flex items-center gap-2 text-xs`}>
                        <span css={tw`inline-block rounded-full`} style={{ width: 10, height: 10, background: palette.good }}/>
                        <strong css={tw`font-semibold text-neutral-50`}>+{formatValue(activePoint.up)}</strong>
                        <span css={tw`text-neutral-400`}>{upLabel}</span>
                    </p>
                    <p css={tw`flex items-center gap-2 text-xs`}>
                        <span css={tw`inline-block rounded-full`} style={{ width: 10, height: 10, background: palette.critical }}/>
                        <strong css={tw`font-semibold text-neutral-50`}>−{formatValue(activePoint.down)}</strong>
                        <span css={tw`text-neutral-400`}>{downLabel}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export const Meter = ({ label, used, limit, format }: { label: string; used: number; limit: number; format: (value: number) => string }) => {
    const ratio = limit > 0 ? used / limit : 0;
    const fill = ratio >= 0.95 ? palette.critical : ratio >= 0.85 ? palette.warning : palette.series[0];

    return (
        <div>
            <div css={tw`mb-1.5 flex items-baseline justify-between text-xs`}>
                <span css={tw`text-neutral-400`}>{label}</span>
                <span css={tw`text-neutral-200`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {format(used)} / {format(limit)} <span css={tw`ml-1 font-semibold text-neutral-50`}>{Math.round(ratio * 100)} %</span>
                </span>
            </div>
            <div css={tw`overflow-hidden rounded-full`} style={{ height: 8, background: 'rgba(57, 135, 229, 0.18)' }}>
                <div style={{ width: `${Math.min(100, ratio * 100)}%`, height: 8, background: fill, borderRadius: 999 }}/>
            </div>
        </div>
    );
};
