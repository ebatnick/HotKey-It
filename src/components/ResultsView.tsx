import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRotateRight,
  faRepeat,
  faShareNodes,
  faTrophy,
  faBullseye,
  faBolt,
  faClock,
  faTriangleExclamation,
  faArrowRight,
  faCircleCheck,
  faCheck,
  faChartLine,
  faChartSimple,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { animate, stagger } from 'animejs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SessionResult, OSMode, ThemeColors } from '../types';
import { generateScorecardBlob } from '../utils/cardGenerator';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ResultsViewProps {
  result: SessionResult;
  personalBest: { spm: number; accuracy: number } | null;
  os: OSMode;
  theme: ThemeColors;
  onRestart: () => void;
  onRepeat: () => void;
  onDrillWeakKeys: (weakShortcuts: SessionResult['weakShortcuts']) => void;
  onOpenHistory?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  personalBest,
  os,
  theme,
  onRestart,
  onRepeat,
  onDrillWeakKeys,
  onOpenHistory,
}) => {
  const [chartMode, setChartMode] = useState<'spm' | 'latency' | 'both'>('spm');
  const [copiedToast, setCopiedToast] = useState(false);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const cardTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isNewPB = !personalBest || result.spm > personalBest.spm;

  // anime.js smooth entrance animations on mount
  useEffect(() => {
    try {
      animate('.animate-stat-card', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(60),
        ease: 'outQuad',
        duration: 450
      });

      animate('.animate-chart-container', {
        translateY: [15, 0],
        opacity: [0, 1],
        ease: 'outCubic',
        duration: 600,
        delay: 200
      });
    } catch {}
  }, []);

  // Format Chart.js timeline labels and datasets
  const timeline = result.timeline || [];
  const labels = timeline.map(item => `#${item.index}`);

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      ...(chartMode === 'spm' || chartMode === 'both' ? [{
        label: 'Speed (SPM)',
        data: timeline.map(t => t.instantSpm),
        borderColor: theme.accent,
        backgroundColor: `${theme.accent}20`,
        borderWidth: 2.5,
        pointBackgroundColor: timeline.map(t => t.isCorrect ? theme.accent : theme.error),
        pointBorderColor: theme.surface,
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
        yAxisID: 'y'
      }] : []),
      ...(chartMode === 'latency' || chartMode === 'both' ? [{
        label: 'Reaction (ms)',
        data: timeline.map(t => t.latencyMs),
        borderColor: '#38bdf8',
        backgroundColor: '#38bdf815',
        borderWidth: 2,
        borderDash: chartMode === 'both' ? [4, 4] : [],
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: theme.surface,
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        pointHoverRadius: 5.5,
        tension: 0.35,
        fill: chartMode === 'latency',
        yAxisID: chartMode === 'both' ? 'y1' : 'y'
      }] : [])
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme.surface,
        titleColor: theme.text,
        bodyColor: theme.subText,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        bodyFont: {
          family: 'monospace',
          size: 11
        },
        titleFont: {
          family: 'monospace',
          size: 12,
          weight: 'bold'
        },
        callbacks: {
          title: (context) => {
            const idx = context[0]?.dataIndex;
            const item = timeline[idx];
            return item ? `#${item.index} — ${item.shortcutName}` : '';
          },
          label: (context) => {
            const val = context.parsed.y;
            if (context.dataset.label?.includes('Speed')) {
              return `  Speed: ${val} SPM`;
            }
            return `  Reaction: ${val} ms`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          font: {
            family: 'monospace',
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.06)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          font: {
            family: 'monospace',
            size: 10
          }
        }
      },
      ...(chartMode === 'both' ? {
        y1: {
          position: 'right' as const,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#38bdf888',
            font: {
              family: 'monospace',
              size: 10
            }
          }
        }
      } : {})
    }
  };

  // Generate Monkeytype-style scorecard image, copy to clipboard, and display preview for 3s
  const handleShare = async () => {
    if (isGeneratingCard) return;
    setIsGeneratingCard(true);

    try {
      const { blob, dataUrl } = await generateScorecardBlob(result, theme, os);
      setCardPreviewUrl(dataUrl);

      // 1. Copy image directly to clipboard as PNG
      let copiedAsImage = false;
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          copiedAsImage = true;
          setCopiedToast(true);
        }
      } catch (err) {
        console.warn('Clipboard image write failed, trying text fallback', err);
      }

      // 2. Fallback to text copy if image clipboard was rejected
      if (!copiedAsImage) {
        try {
          const shareText = `⚡ KeyFlow — ${result.preset.toUpperCase()} (${result.modeType === 'count' ? `${result.modeValue} keys` : `${result.durationSeconds}s`})\n` +
            `• Speed: ${result.spm} SPM | Accuracy: ${result.accuracy}%\n` +
            `• Reaction: ${result.avgReactionTimeMs}ms\n` +
            `Master your shortcuts on KeyFlow!`;
          await navigator.clipboard.writeText(shareText);
          setCopiedToast(true);
        } catch {}
      }

      // 3. Automatically close card preview after exactly 3 seconds
      if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
      cardTimerRef.current = setTimeout(() => {
        setCardPreviewUrl(null);
        setCopiedToast(false);
      }, 3000);
    } catch (e) {
      console.error('Failed to generate scorecard', e);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full max-w-4xl mx-auto px-4 py-4 select-none animate-fade-in font-mono">
      {/* 3-Second Scorecard Modal Overlay (Monkeytype card mode) */}
      {cardPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in cursor-pointer"
          onClick={() => {
            if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
            setCardPreviewUrl(null);
            setCopiedToast(false);
          }}
        >
          {/* Notification Badge */}
          <div
            style={{
              backgroundColor: theme.accent,
              color: theme.keyActiveText,
              boxShadow: `0 0 25px ${theme.accent}66`,
            }}
            className="mb-4 px-5 py-2 rounded-full font-mono text-xs font-bold flex items-center gap-2 shadow-2xl animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <FontAwesomeIcon icon={faCheck} />
            <span>Card copied to clipboard! (Closing in 3s)</span>
          </div>

          {/* Rendered Card Image */}
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden border shadow-2xl"
            style={{ borderColor: theme.border, backgroundColor: theme.bg }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={cardPreviewUrl}
              alt="KeyFlow Scorecard"
              className="w-full h-auto object-contain block select-none"
            />
          </div>

          {/* Quick Actions Bar outside the card */}
          <div
            style={{ color: theme.subText }}
            className="flex items-center gap-3 mt-4 text-xs font-mono"
            onClick={e => e.stopPropagation()}
          >
            <a
              href={cardPreviewUrl}
              download={`keyflow-${result.preset}-${result.spm}spm.png`}
              className="flex items-center gap-1.5 hover:underline font-semibold px-3 py-1.5 rounded-xl border"
              style={{ color: theme.accent, borderColor: theme.border, backgroundColor: theme.surface }}
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Save PNG</span>
            </a>
            <span className="opacity-40">•</span>
            <button
              type="button"
              onClick={() => {
                if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
                setCardPreviewUrl(null);
                setCopiedToast(false);
              }}
              className="opacity-70 hover:opacity-100 transition-opacity underline decoration-dotted underline-offset-4 cursor-pointer"
            >
              click anywhere or press esc to close
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {copiedToast && (
        <div
          style={{
            backgroundColor: theme.accent,
            color: theme.keyActiveText,
            boxShadow: `0 0 20px ${theme.accent}66`,
          }}
          className="fixed top-8 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 z-50 animate-fade-in shadow-xl"
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Result scorecard copied to clipboard!</span>
        </div>
      )}

      {/* New Personal Best Banner */}
      {isNewPB && (
        <div
          style={{
            backgroundColor: `${theme.accent}15`,
            borderColor: `${theme.accent}50`,
            color: theme.accent,
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold mb-4 animate-pulse"
        >
          <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
          <span>New Personal Best! SPM: {result.spm}</span>
        </div>
      )}

      {/* Hero Stats Grid (animated with anime.js) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-5">
        {/* SPM Speed */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="animate-stat-card p-4 sm:p-5 rounded-2xl border flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs mb-2" style={{ color: theme.subText }}>
            <span>spm (speed)</span>
            <FontAwesomeIcon icon={faBolt} style={{ color: theme.accent }} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: theme.accent }}>
              {result.spm}
            </span>
          </div>
          <span className="text-[10px] mt-2" style={{ color: theme.subText }}>
            shortcuts / minute
          </span>
        </div>

        {/* Accuracy */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="animate-stat-card p-4 sm:p-5 rounded-2xl border flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs mb-2" style={{ color: theme.subText }}>
            <span>accuracy</span>
            <FontAwesomeIcon icon={faBullseye} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: theme.text }}>
              {result.accuracy}%
            </span>
          </div>
          <span className="text-[10px] mt-2" style={{ color: theme.subText }}>
            {result.correctCount} / {result.totalAttempts} clean
          </span>
        </div>

        {/* Reaction Time */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="animate-stat-card p-4 sm:p-5 rounded-2xl border flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs mb-2" style={{ color: theme.subText }}>
            <span>reaction</span>
            <FontAwesomeIcon icon={faClock} className="text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: theme.text }}>
              {result.avgReactionTimeMs}
            </span>
            <span className="text-xs" style={{ color: theme.subText }}>ms</span>
          </div>
          <span className="text-[10px] mt-2" style={{ color: theme.subText }}>
            average delay
          </span>
        </div>

        {/* Session Info */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="animate-stat-card p-4 sm:p-5 rounded-2xl border flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs mb-2" style={{ color: theme.subText }}>
            <span>session</span>
            <FontAwesomeIcon icon={faCircleCheck} className="text-violet-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold capitalize" style={{ color: theme.text }}>
              {result.preset}
            </span>
            <div className="text-xs mt-1" style={{ color: theme.subText }}>
              {result.modeType} {result.modeValue ? `(${result.modeValue})` : ''}
            </div>
          </div>
          <span className="text-[10px] mt-2" style={{ color: theme.subText }}>
            duration: {result.durationSeconds}s
          </span>
        </div>
      </div>

      {/* Speed & Latency Chart.js Graph */}
      {timeline.length > 0 && (
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="animate-chart-container w-full p-4 rounded-2xl border mb-5 flex flex-col"
        >
          {/* Chart Header & Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} style={{ color: theme.accent }} />
              <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: theme.text }}>
                Performance Graph (Chart.js)
              </span>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-zinc-950/40 p-1 rounded-xl border border-zinc-800/80 text-[11px]">
              <button
                type="button"
                onClick={() => setChartMode('spm')}
                style={{
                  backgroundColor: chartMode === 'spm' ? theme.accent : 'transparent',
                  color: chartMode === 'spm' ? theme.keyActiveText : theme.subText,
                }}
                className="px-2 py-0.5 rounded-lg font-semibold transition-all"
              >
                Speed (SPM)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('latency')}
                style={{
                  backgroundColor: chartMode === 'latency' ? theme.accent : 'transparent',
                  color: chartMode === 'latency' ? theme.keyActiveText : theme.subText,
                }}
                className="px-2 py-0.5 rounded-lg font-semibold transition-all"
              >
                Reaction (ms)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('both')}
                style={{
                  backgroundColor: chartMode === 'both' ? theme.accent : 'transparent',
                  color: chartMode === 'both' ? theme.keyActiveText : theme.subText,
                }}
                className="px-2 py-0.5 rounded-lg font-semibold transition-all"
              >
                Both
              </button>
            </div>
          </div>

          {/* Chart.js Canvas Container */}
          <div className="w-full h-44 relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Problematic Shortcuts / High Latency */}
      {result.weakShortcuts && result.weakShortcuts.length > 0 && (
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="w-full p-4 rounded-2xl border mb-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.text }}>
                Problematic Shortcuts / High Latency
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onDrillWeakKeys(result.weakShortcuts)}
              style={{
                backgroundColor: theme.accent,
                color: theme.keyActiveText,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Practice These</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.weakShortcuts.slice(0, 4).map(item => (
              <div
                key={`weak-${item.id}`}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border }}
                className="p-3 rounded-xl border flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold" style={{ color: theme.text }}>
                    {item.name}
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-70" style={{ color: theme.subText }}>
                    {item.keysDisplay}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-400">{item.latencyMs}ms</div>
                  {item.mistakes > 0 && (
                    <div className="text-[10px] text-red-400">{item.mistakes} mistakes</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Controls (Next, Repeat, Share, History) */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        {/* Next Test Button */}
        <button
          type="button"
          onClick={onRestart}
          style={{
            backgroundColor: theme.accent,
            color: theme.keyActiveText,
            boxShadow: `0 0 20px ${theme.accent}44`,
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <FontAwesomeIcon icon={faRotateRight} />
          <span>Next Test (Tab + Enter)</span>
        </button>

        {/* Repeat Exact Test */}
        <button
          type="button"
          onClick={onRepeat}
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-xs hover:opacity-85 active:scale-95 transition-all cursor-pointer"
          title="Repeat the exact same shortcuts to improve your score"
        >
          <FontAwesomeIcon icon={faRepeat} />
          <span>Repeat Test</span>
        </button>

        {/* Share Result */}
        <button
          type="button"
          onClick={handleShare}
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-xs hover:opacity-85 active:scale-95 transition-all cursor-pointer"
          title="Share scorecard or copy to clipboard"
        >
          <FontAwesomeIcon icon={faShareNodes} style={{ color: theme.accent }} />
          <span>Share</span>
        </button>

        {/* View in History */}
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.subText,
            }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border font-semibold text-xs hover:opacity-85 active:scale-95 transition-all cursor-pointer"
            title="View personal bests and history"
          >
            <FontAwesomeIcon icon={faChartSimple} />
            <span className="hidden sm:inline">History</span>
          </button>
        )}
      </div>
    </div>
  );
};
