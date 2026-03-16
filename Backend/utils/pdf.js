const PDFDocument = require('pdfkit');

/**
 * Generate a PDF eligibility report.
 * @param {object} data  { user, lgcseResults, summary, eligible, borderline, not_eligible, qualType }
 * @param {object} res   Express response object
 */
function generateEligibilityReport(data, res) {
  const { user, lgcseResults, summary, eligible, borderline, not_eligible, qualType } = data;
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="APES_Eligibility_Report_${Date.now()}.pdf"`);
  doc.pipe(res);

  const BLUE   = '#003580';
  const GREEN  = '#009A44';
  const YELLOW = '#FFCD00';
  const DARK   = '#1a1a2e';
  const GRAY   = '#666666';
  const WHITE  = '#FFFFFF';

  // --- Header ---
  doc.rect(0, 0, doc.page.width, 90).fill(BLUE);
  doc.fill(WHITE).fontSize(22).font('Helvetica-Bold').text('APES', 50, 25);
  doc.fontSize(11).font('Helvetica').text('Automatic Prospectus & Eligibility System', 50, 52);
  doc.fontSize(9).text('Lesotho University Admissions Guide — NUL | LP | Botho University', 50, 68);
  doc.fill(DARK);

  doc.moveDown(3);

  // --- Report meta ---
  doc.fontSize(16).font('Helvetica-Bold').fillColor(BLUE).text('Eligibility Report', 50, 105);
  doc.fontSize(10).font('Helvetica').fillColor(GRAY);
  if (user) {
    doc.text(`Student: ${user.full_name}`, 50, 130);
    doc.text(`Email:   ${user.email}`, 50, 145);
  }
  doc.text(`Date:    ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 50, 160);
  doc.text(`Qualification Type: ${qualType || 'LGCSE'}`, 50, 175);

  // --- Summary boxes ---
  const startY = 200;
  const boxW   = 150;
  const boxGap = 16;
  function summaryBox(x, y, label, count, color) {
    doc.roundedRect(x, y, boxW, 60, 8).fill(color);
    doc.fill(WHITE).fontSize(26).font('Helvetica-Bold').text(count, x, y + 8, { width: boxW, align: 'center' });
    doc.fontSize(10).font('Helvetica').text(label, x, y + 40, { width: boxW, align: 'center' });
  }
  summaryBox(50,              startY, 'Eligible',     summary.eligible_count,     '#1a8741');
  summaryBox(50 + boxW + boxGap, startY, 'Borderline', summary.borderline_count, '#b06000');
  summaryBox(50 + (boxW + boxGap) * 2, startY, 'Not Eligible', summary.not_eligible_count, '#cc2222');

  doc.fill(GRAY).fontSize(9).text(`Total programmes checked: ${summary.total_checked}`, 50, startY + 70);

  // --- LGCSE Grades submitted ---
  doc.moveDown(1);
  doc.fillColor(BLUE).fontSize(13).font('Helvetica-Bold').text('Submitted Grades', 50, startY + 90);
  doc.moveDown(0.3);

  const gradePerRow = 4;
  lgcseResults.forEach((g, i) => {
    const col = i % gradePerRow;
    const row = Math.floor(i / gradePerRow);
    const gx  = 50 + col * 120;
    const gy  = startY + 115 + row * 22;
    doc.fillColor(DARK).fontSize(10).font('Helvetica')
      .text(`${g.subject_id}: `, gx, gy, { continued: true })
      .font('Helvetica-Bold').text(g.grade);
  });

  const tableStart = startY + 115 + Math.ceil(lgcseResults.length / gradePerRow) * 22 + 20;

  // --- Eligible programmes ---
  function drawProgrammeSection(title, programmes, color, yStart) {
    if (programmes.length === 0) return yStart;

    if (yStart > doc.page.height - 150) {
      doc.addPage();
      yStart = 50;
    }

    doc.fillColor(color).fontSize(13).font('Helvetica-Bold').text(title, 50, yStart);
    yStart += 22;

    programmes.forEach((p, idx) => {
      if (yStart > doc.page.height - 80) {
        doc.addPage();
        yStart = 50;
      }
      doc.roundedRect(50, yStart, doc.page.width - 100, 44, 6).fill('#f5f5f8');
      doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold')
        .text(`${idx + 1}. ${p.programme_name}`, 62, yStart + 6, { width: doc.page.width - 140 });
      doc.fillColor(GRAY).fontSize(9).font('Helvetica')
        .text(`${p.institution_name || p.institution_id}  •  ${p.qualification_type}  •  ${p.duration_years} yr(s)${p.aps_calculated ? '  •  APS: ' + p.aps_calculated : ''}`, 62, yStart + 22);
      yStart += 52;
    });

    return yStart + 10;
  }

  let y = tableStart;
  y = drawProgrammeSection(`✅  Eligible Programmes (${eligible.length})`,     eligible,     GREEN,  y);
  y = drawProgrammeSection(`⚠️  Borderline Programmes (${borderline.length})`, borderline,   '#b06000', y);

  // --- Footer ---
  const pages = doc.bufferedPageRange();
  for (let i = pages.start; i <= pages.start + pages.count - 1; i++) {
    doc.switchToPage(i);
    doc.rect(0, doc.page.height - 35, doc.page.width, 35).fill('#f0f0f0');
    doc.fillColor(GRAY).fontSize(8).font('Helvetica')
      .text(`APES — apes.ac.ls  |  Generated ${new Date().toISOString().split('T')[0]}  |  Page ${i - pages.start + 1} of ${pages.count}`,
        50, doc.page.height - 22, { align: 'center', width: doc.page.width - 100 });
  }

  doc.end();
}

module.exports = { generateEligibilityReport };
