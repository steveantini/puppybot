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

// ─── STATS PDF (graph images) ────────────────────────────────
export function exportStatsPdf({ chartImages, rangeLabel, pawPng }) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Branded header: "Powered by  <paw>  PuppyBot"
  const fontSize = 16;
  const baseline = y + 7;
  let x = margin;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.medium);
  doc.text('Powered by', x, baseline);
  x += doc.getTextWidth('Powered by') + 3;

  if (pawPng) {
    try { doc.addImage(pawPng, 'PNG', x, y - 1, 9, 9); } catch {}
  }
  x += 11;

  doc.setFontSize(fontSize);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.steel400);
  doc.text('Puppy', x, baseline);
  x += doc.getTextWidth('Puppy');

  doc.setTextColor(...COLORS.steel500);
  doc.text('Bot', x, baseline);
  x += doc.getTextWidth('Bot');

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.steel400);
  doc.text('.ai', x, baseline);

  y += 14;

  // Date range + timestamp
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text(`${rangeLabel}`, margin, y);
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

  // Add each chart image
  for (const chart of chartImages) {
    const aspectRatio = chart.height / chart.width;
    const imgW = contentW;
    const imgH = imgW * aspectRatio;

    // If the image won't fit on the current page, add a new page
    if (y + imgH > pageH - margin) {
      doc.addPage();
      y = margin;
    }

    doc.addImage(chart.dataUrl, 'PNG', margin, y, imgW, imgH);
    y += imgH + 8;
  }

  doc.save('puppybot-stats-report.pdf');
}

// ─── HISTORY PDF ─────────────────────────────────────────────
export function exportHistoryPdf(allLogs, selectedDates, puppyName) {
  const doc = new jsPDF();
  const sortedDates = [...selectedDates].sort((a, b) => a.localeCompare(b));

  let y = addHeader(
    doc,
    `Daily Log Report${puppyName ? ` — ${puppyName}` : ''}`,
    `${sortedDates.length} day${sortedDates.length !== 1 ? 's' : ''} · Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  );

  sortedDates.forEach((date, idx) => {
    const log = allLogs[date];
    if (!log) return;

    // Check if we need a new page (leave room for at least a header + small table)
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Date header
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.setFont(undefined, 'bold');
    doc.text(formatDate(date), 14, y);
    doc.setFont(undefined, 'normal');
    y += 2;
    doc.setDrawColor(...COLORS.light);
    doc.line(14, y, 196, y);
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
        margin: { left: 14, right: 14 },
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
        margin: { left: 14, right: 14 },
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
        margin: { left: 14, right: 14 },
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
        margin: { left: 14, right: 14 },
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
      doc.text(lines, 14, y);
      y += lines.length * 4 + 4;
    }
    if (log.notes) {
      if (y > 265) { doc.addPage(); y = 20; }
      y = addSectionTitle(doc, y, 'Notes');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.medium);
      const lines = doc.splitTextToSize(log.notes, 180);
      doc.text(lines, 14, y);
      y += lines.length * 4 + 4;
    }

    // Spacer between days
    if (idx < sortedDates.length - 1) {
      y += 8;
    }
  });

  doc.save('puppybot-daily-log.pdf');
}
