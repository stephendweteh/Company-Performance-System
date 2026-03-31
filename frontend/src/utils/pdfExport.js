const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 40;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 40;

const escapePdfText = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const wrapText = (text, fontSize) => {
  const content = String(text || '').trim();
  if (!content) return [''];

  const maxChars = Math.max(24, Math.floor((PAGE_WIDTH - (MARGIN_X * 2)) / (fontSize * 0.52)));
  const paragraphs = content.split(/\n+/);
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      lines.push('');
      return;
    }

    let currentLine = words[0];
    for (let index = 1; index < words.length; index += 1) {
      const nextLine = `${currentLine} ${words[index]}`;
      if (nextLine.length <= maxChars) {
        currentLine = nextLine;
      } else {
        lines.push(currentLine);
        currentLine = words[index];
      }
    }
    lines.push(currentLine);
  });

  return lines;
};

export const downloadSimplePdf = ({ filename, title, blocks }) => {
  const pages = [];
  let currentPage = [];
  let currentY = PAGE_HEIGHT - MARGIN_TOP;

  const pushPage = () => {
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    currentPage = [];
    currentY = PAGE_HEIGHT - MARGIN_TOP;
  };

  const addBlock = ({ text, fontSize = 10, bold = false, gapAfter = 6 }) => {
    const lines = wrapText(text, fontSize);
    const lineHeight = Math.max(fontSize + 2, 12);
    const requiredHeight = (lines.length * lineHeight) + gapAfter;

    if (currentY - requiredHeight < MARGIN_BOTTOM) {
      pushPage();
    }

    lines.forEach((line) => {
      currentPage.push({
        text: line,
        fontSize,
        bold,
        x: MARGIN_X,
        y: currentY,
      });
      currentY -= lineHeight;
    });

    currentY -= gapAfter;
  };

  addBlock({ text: title, fontSize: 16, bold: true, gapAfter: 10 });
  addBlock({ text: `Generated: ${new Date().toLocaleDateString()}`, fontSize: 10, gapAfter: 12 });

  blocks.forEach((block) => addBlock(block));
  pushPage();

  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesId = 2;
  objects.push('');
  const normalFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageIds = [];
  pages.forEach((page) => {
    const commands = page
      .map((entry) => `BT /F${entry.bold ? '2' : '1'} ${entry.fontSize} Tf 1 0 0 1 ${entry.x} ${entry.y.toFixed(2)} Tm (${escapePdfText(entry.text)}) Tj ET`)
      .join('\n');

    const contentId = addObject(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${normalFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets[index + 1] = pdf.length;
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};