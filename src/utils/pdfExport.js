import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatTime, formatDate } from './helpers';

const COLORS = {
  primary: [56, 139, 203],    // sky-500
  steel400: [42, 122, 217],   // #2A7AD9 — "Puppy"
  steel500: [26, 99, 198],    // #1A63C6 — "Bot"
  dark: [41, 37, 36],         // stone-800
  medium: [120, 113, 108],    // stone-500
  light: [231, 229, 228],     // stone-200
  success: [52, 211, 153],    // emerald-400
  danger: [251, 113, 133],    // rose-400
};

function addHeader(doc, title, subtitle) {
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.primary);
  doc.text('PuppyBot', 14, 20);
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.text(title, 14, 30);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.medium);
    doc.text(subtitle, 14, 37);
  }
  return subtitle ? 45 : 38;
}

function addSectionTitle(doc, y, title) {
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, y);
  doc.setFont(undefined, 'normal');
  return y + 6;
}

// Draws "powered by <paw> PuppyBot" right-aligned at the given baseline y
function drawBrandedLogo(doc, rightEdge, baselineY, fontSize, pawPng) {
  const iconSize = fontSize * 0.55;
  const gap = 1.5;

  doc.setFontSize(fontSize);
  doc.setFont(undefined, 'bold');
  const botW = doc.getTextWidth('Bot');
  const puppyW = doc.getTextWidth('Puppy');

  doc.setFontSize(fontSize * 0.71);
  doc.setFont(undefined, 'normal');
  const poweredW = doc.getTextWidth('powered by');

  const totalW = poweredW + gap + iconSize + gap + puppyW + botW;
  let x = rightEdge - totalW;

  doc.setFontSize(fontSize * 0.71);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.medium);
  doc.text('powered by', x, baselineY);
  x += poweredW + gap;

  if (pawPng) {
    try { doc.addImage(pawPng, 'PNG', x, baselineY - iconSize + 1, iconSize, iconSize); } catch {}
  }
  x += iconSize + gap;

  doc.setFontSize(fontSize);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.steel400);
  doc.text('Puppy', x, baselineY);
  x += puppyW;

  doc.setTextColor(...COLORS.steel500);
  doc.text('Bot', x, baselineY);
}

// ─── STATS PDF (graph images) ────────────────────────────────
export function exportStatsPdf({ chartImages, rangeLabel, pawPng, puppyName }) {
  const doc = new jsPDF('l');
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  const footerY = pageH - 10;
  let y = margin;

  // Header line: title left, branded logo right
  const headerBaseline = y + 6;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text(`${puppyName}'s Daily Progress Report`, margin, headerBaseline);

  drawBrandedLogo(doc, pageW - margin, headerBaseline, 12, pawPng);
  y += 12;

  // Date range + timestamp
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Date Range: ', margin, y);
  const labelW = doc.getTextWidth('Date Range: ');
  doc.setFont(undefined, 'normal');
  doc.text(rangeLabel, margin + labelW, y);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.medium);
  const now = new Date();
  const stamp = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  doc.text(stamp, pageW - margin, y, { align: 'right' });
  y += 4;

  // Divider
  doc.setDrawColor(...COLORS.light);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const chartAreaH = footerY - 4;
  const gap = 6;

  const nonSchedule = chartImages.filter((c) => !c.isSchedule);
  const schedule = chartImages.filter((c) => c.isSchedule);

  // Non-schedule charts: two per page, stacked vertically
  for (let i = 0; i < nonSchedule.length; i += 2) {
    const isFirstPage = (i === 0);
    if (!isFirstPage) {
      doc.addPage();
      y = margin;
    }

    const pair = nonSchedule.slice(i, i + 2);
    const availH = chartAreaH - y;
    const slotH = pair.length === 2 ? (availH - gap) / 2 : availH;

    pair.forEach((chart, j) => {
      const aspectRatio = chart.height / chart.width;
      let imgW = contentW;
      let imgH = imgW * aspectRatio;

      if (imgH > slotH) {
        imgH = slotH;
        imgW = imgH / aspectRatio;
      }

      const xOffset = margin + (contentW - imgW) / 2;
      const slotTop = y + j * (slotH + gap);
      const yOffset = slotTop + (slotH - imgH) / 2;
      doc.addImage(chart.dataUrl, 'PNG', xOffset, yOffset, imgW, imgH);
    });
  }

  // Schedule charts: one per page, width-first
  for (const chart of schedule) {
    doc.addPage();
    y = margin;

    const availH = chartAreaH - y;
    const aspectRatio = chart.height / chart.width;
    let imgW = contentW;
    let imgH = imgW * aspectRatio;

    if (imgH > availH) {
      imgH = availH;
      imgW = imgH / aspectRatio;
    }

    const xOffset = margin + (contentW - imgW) / 2;
    const yOffset = y + (availH - imgH) / 2;
    doc.addImage(chart.dataUrl, 'PNG', xOffset, yOffset, imgW, imgH);
  }

  // Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawBrandedLogo(doc, pageW - margin, footerY, 8, pawPng);
  }

  doc.save('puppybot-stats-report.pdf');
}

// ─── HISTORY PDF ─────────────────────────────────────────────
export function exportHistoryPdf({ allLogs, selectedDates, puppyName, categoryLabel, pawPng }) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const footerY = pageH - 10;
  const sortedDates = [...selectedDates].sort((a, b) => a.localeCompare(b));
  const name = puppyName || 'Puppy';

  let y = margin;

  // Header line: title left, branded logo right
  const headerBaseline = y + 6;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text(`${name}'s History Report`, margin, headerBaseline);
  drawBrandedLogo(doc, pageW - margin, headerBaseline, 12, pawPng);
  y += 12;

  // Category + timestamp
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Category: ', margin, y);
  const catLabelW = doc.getTextWidth('Category: ');
  doc.setFont(undefined, 'normal');
  doc.text(categoryLabel || 'All Categories', margin + catLabelW, y);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.medium);
  const now = new Date();
  const stamp = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  doc.text(stamp, pageW - margin, y, { align: 'right' });
  y += 4;

  // Divider
  doc.setDrawColor(...COLORS.light);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  sortedDates.forEach((date, idx) => {
    const log = allLogs[date];
    if (!log) return;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Date header
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.setFont(undefined, 'bold');
    doc.text(formatDate(date), margin, y);
    doc.setFont(undefined, 'normal');
    y += 2;
    doc.setDrawColor(...COLORS.light);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    // Schedule
    const scheduleRows = [];
    log.wakeUpTimes?.forEach((w) => {
      scheduleRows.push(['Wake Up', formatTime(w.time)]);
    });
    if (log.bedTime) {
      scheduleRows.push(['Bed Time', formatTime(log.bedTime)]);
    }
    if (scheduleRows.length > 0) {
      y = addSectionTitle(doc, y, 'Schedule');
      autoTable(doc, {
        startY: y,
        head: [['Type', 'Time']],
        body: scheduleRows,
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 6;
    }

    // Potty breaks
    if (log.pottyBreaks?.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      y = addSectionTitle(doc, y, 'Potty Breaks');
      autoTable(doc, {
        startY: y,
        head: [['Time', 'Pee', 'Poop', 'Bell', 'Notes']],
        body: log.pottyBreaks.map((p) => [
          formatTime(p.time),
          p.pee === 'good' ? 'Good' : p.pee === 'accident' ? 'Accident' : '-',
          p.poop === 'good' ? 'Good' : p.poop === 'accident' ? 'Accident' : '-',
          p.ringBell ? 'Yes' : '-',
          p.notes || '',
        ]),
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 4: { cellWidth: 50 } },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 6;
    }

    // Meals
    if (log.meals?.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      y = addSectionTitle(doc, y, 'Meals');
      autoTable(doc, {
        startY: y,
        head: [['Time', 'Food Given', 'Food Eaten', 'Notes']],
        body: log.meals.map((m) => [
          formatTime(m.time),
          m.foodGiven || '-',
          m.foodEaten || '-',
          m.notes || '',
        ]),
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 3: { cellWidth: 50 } },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 6;
    }

    // Naps
    if (log.naps?.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      y = addSectionTitle(doc, y, 'Naps');
      autoTable(doc, {
        startY: y,
        head: [['Start', 'End', 'Notes']],
        body: log.naps.map((n) => [
          formatTime(n.startTime),
          formatTime(n.endTime),
          n.notes || '',
        ]),
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 6;
    }

    // Skills & Notes
    if (log.skills) {
      if (y > 265) { doc.addPage(); y = 20; }
      y = addSectionTitle(doc, y, 'Skills');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.medium);
      const lines = doc.splitTextToSize(log.skills, 180);
      doc.text(lines, margin, y);
      y += lines.length * 4 + 4;
    }
    if (log.notes) {
      if (y > 265) { doc.addPage(); y = 20; }
      y = addSectionTitle(doc, y, 'Notes');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.medium);
      const lines = doc.splitTextToSize(log.notes, 180);
      doc.text(lines, margin, y);
      y += lines.length * 4 + 4;
    }

    if (idx < sortedDates.length - 1) {
      y += 8;
    }
  });

  // Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawBrandedLogo(doc, pageW - margin, footerY, 8, pawPng);
  }

  doc.save('puppybot-history-report.pdf');
}
