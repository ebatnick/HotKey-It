import { SessionResult, ThemeColors, OSMode } from '../types';

/**
 * Generates a pixel-perfect, high-resolution scorecard image in the exact spirit of Monkeytype
 * Canvas draws:
 * - Left column: SPM (speed) and Accuracy (acc) in large accent typography
 * - Main area: Coordinate grid with smooth spline speed curve and reaction latency
 * - Bottom metrics: Test type, Reaction time, Clean/Mistakes, Time/Session
 * - Footer: Branding, date & URL
 */
export async function generateScorecardBlob(
  result: SessionResult,
  theme: ThemeColors,
  _os: OSMode
): Promise<{ blob: Blob; dataUrl: string }> {
  const width = 1100;
  const height = 360;
  const scale = 2; // 2x Retina resolution

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.scale(scale, scale);

  // 1. Background
  ctx.fillStyle = theme.bg || '#111215';
  ctx.fillRect(0, 0, width, height);

  // 2. Left Stats Column (Monkeytype signature layout)
  const leftX = 40;
  
  // SPM label
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '500 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText('spm', leftX, 58);

  // SPM Value
  ctx.fillStyle = theme.accent || '#e2b714';
  ctx.font = '800 58px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(result.spm.toString(), leftX, 118);

  // ACC label
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '500 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText('acc', leftX, 160);

  // ACC Value
  ctx.fillStyle = theme.accent || '#e2b714';
  ctx.font = '800 58px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(`${result.accuracy}%`, leftX, 220);

  // 3. Middle / Right Graph
  const graphX = 180;
  const graphY = 35;
  const graphW = width - graphX - 45;
  const graphH = 195;

  const timeline = result.timeline || [];
  const maxSpm = Math.max(...timeline.map(t => t.instantSpm), result.spm, 40);

  // Axis labels
  ctx.save();
  ctx.translate(graphX - 10, graphY + graphH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '400 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Shortcuts per Minute', 0, 0);
  ctx.restore();

  // Grid lines and y-axis tick values
  const gridSteps = [0, 0.33, 0.66, 1];
  ctx.textAlign = 'right';
  ctx.font = '400 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  gridSteps.forEach(ratio => {
    const y = graphY + graphH - ratio * graphH;
    const val = Math.round(ratio * maxSpm);
    
    ctx.beginPath();
    ctx.moveTo(graphX + 20, y);
    ctx.lineTo(graphX + graphW, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillText(val.toString(), graphX + 14, y + 3);
  });

  // Calculate points
  const points = timeline.map((item, idx) => {
    const x = timeline.length > 1
      ? graphX + 25 + (idx / (timeline.length - 1)) * (graphW - 35)
      : graphX + graphW / 2;
    const y = graphY + graphH - (item.instantSpm / maxSpm) * graphH;
    return { x, y, item };
  });

  // Draw smooth spline curve for SPM
  if (points.length > 1) {
    // Area gradient
    const gradient = ctx.createLinearGradient(0, graphY, 0, graphY + graphH);
    gradient.addColorStop(0, `${theme.accent}33`);
    gradient.addColorStop(1, `${theme.accent}00`);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      ctx.quadraticCurveTo(p0.x, p0.y, mx, (p0.y + p1.y) / 2);
    }
    const lastP = points[points.length - 1];
    ctx.lineTo(lastP.x, lastP.y);

    // Close area path for subtle fill
    ctx.lineTo(lastP.x, graphY + graphH);
    ctx.lineTo(points[0].x, graphY + graphH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      ctx.quadraticCurveTo(p0.x, p0.y, mx, (p0.y + p1.y) / 2);
    }
    ctx.lineTo(lastP.x, lastP.y);
    ctx.strokeStyle = theme.accent || '#e2b714';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Data dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.item.isCorrect ? 3.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = p.item.isCorrect ? (theme.accent || '#e2b714') : (theme.error || '#ca4754');
      ctx.fill();
    });
  }

  // X-axis index labels (1, 2, 3...)
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.font = '400 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  points.forEach((p, idx) => {
    ctx.fillText((idx + 1).toString(), p.x, graphY + graphH + 16);
  });

  // 4. Bottom Row Metrics (Monkeytype style: labels in dim subtext, values below in accent)
  const bottomY = 275;
  const colSpacing = 160;

  // Column 1: Test Type
  ctx.textAlign = 'left';
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '500 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText('test type', leftX, bottomY);

  ctx.fillStyle = theme.accent || '#e2b714';
  ctx.font = '700 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  const modeLabel = result.modeType === 'count' ? `keys ${result.modeValue}` : `${result.durationSeconds}s`;
  ctx.fillText(modeLabel, leftX, bottomY + 22);
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '400 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(result.preset, leftX, bottomY + 40);

  // Column 2: Reaction Time
  const col2X = leftX + colSpacing;
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '500 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText('reaction', col2X, bottomY);

  ctx.fillStyle = theme.accent || '#e2b714';
  ctx.font = '700 24px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(`${result.avgReactionTimeMs}ms`, col2X, bottomY + 26);

  // Column 3: Keys Clean / Attempts
  const col3X = col2X + colSpacing;
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '500 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText('shortcuts', col3X, bottomY);

  ctx.fillStyle = theme.accent || '#e2b714';
  ctx.font = '700 24px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(`${result.correctCount}/${result.mistakeCount}/${result.totalAttempts}`, col3X, bottomY + 26);

  // Column 4: Time
  const col4X = col3X + colSpacing;
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '500 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText('time', col4X, bottomY);

  ctx.fillStyle = theme.accent || '#e2b714';
  ctx.font = '700 24px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(`${result.durationSeconds}s`, col4X, bottomY + 26);

  // 5. Bottom Right Footer (Monkeytype style: username | date | domain)
  const now = new Date(result.timestamp || Date.now());
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const footerText = `KeyFlow  |  ${dateStr} ${timeStr}  |  keyflow.app`;

  ctx.textAlign = 'right';
  ctx.fillStyle = theme.subText || '#646669';
  ctx.font = '500 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(footerText, width - 40, bottomY + 36);

  // Export to Blob and Data URL
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Canvas blob generation failed'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob, dataUrl });
    }, 'image/png');
  });
}
