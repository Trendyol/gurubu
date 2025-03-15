const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const os = require("os");

class PdfService {
  turkishToEnglish(text) {
    if (!text) return "";

    return text
      .toString()
      .replace(/ı/g, "i")
      .replace(/İ/g, "I")
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "G")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "U")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "S")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "C")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "O");
  }

  translateToEnglish(text) {
    if (!text) return "";

    const translations = {
      "Jira Board": "Jira Board",
      "Story Points Raporu": "Story Points Report",
      "Toplam Görev": "Total Tasks",
      "Toplam Baslangic Story Point": "Total Initial Story Points",
      "Toplam Guncel Story Point": "Total Current Story Points",
      "Toplam Degisim": "Total Change",
      Özet: "Summary",
      Açıklama: "Description",
      "İlk SP": "Initial SP",
      "Son SP": "Final SP",
      Sayfa: "Page",
    };

    let result = this.turkishToEnglish(text);

    Object.keys(translations).forEach((key) => {
      const englishKey = this.turkishToEnglish(key);
      const pattern = new RegExp(englishKey, "g");
      result = result.replace(pattern, translations[key]);
    });

    return result;
  }

  cleanText(text) {
    if (!text) return "";

    let cleanedText = text.toString().replace(/<[^>]*>/g, " ");

    cleanedText = cleanedText
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#8209;/g, "-")
      .replace(/\{code:.*?\}/g, "")
      .trim();

    cleanedText = cleanedText.replace(/\s+/g, " ");

    return this.turkishToEnglish(cleanedText);
  }

  encodeSpecialChars(text) {
    if (!text) return "";

    return text
      .toString()
      .replace(/\r\n|\r|\n/g, " ")
      .replace(/\t/g, "    ");
  }

  addPageNumber(doc, pageNumber, totalPages) {
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#666666")
      .text(`Page ${pageNumber} / ${totalPages}`, 20, doc.page.height - 15, {
        align: "center",
        width: doc.page.width - 40,
      });
  }

  async generateIssuesReport(issues, boardId) {
    return new Promise((resolve, reject) => {
      try {
        const tempFilePath = path.join(
          os.tmpdir(),
          `jira_board_${boardId}_report_${Date.now()}.pdf`
        );

        const doc = new PDFDocument({
          size: "A4",
          margin: 20,
          info: {
            Title: `Jira Board ${boardId} Story Points Report`,
            Author: "Gurubu Application",
            Producer: "PDFKit",
            Creator: "Gurubu PDF Service",
          },
          pdfVersion: "1.7",
          compress: true,
          autoFirstPage: true,
          bufferPages: false,
        });

        const stream = fs.createWriteStream(tempFilePath);
        doc.pipe(stream);

        const originalFont = "Helvetica";
        const boldFont = "Helvetica-Bold";

        doc
          .font(boldFont)
          .fontSize(14)
          .fillColor("#000000")
          .text(`Jira Board ${boardId} Story Points Report`, {
            align: "center",
          });

        doc.moveDown(0.5);

        doc
          .font(originalFont)
          .fontSize(9)
          .text(`Total Tasks: ${issues.length}`, {
            align: "left",
          });

        let totalInitialPoints = 0;
        let totalCurrentPoints = 0;

        issues.forEach((issue) => {
          totalInitialPoints += issue.initialStoryPoint || 0;
          totalCurrentPoints += issue.currentStoryPoint || 0;
        });

        doc.text(
          `Total Initial Story Points: ${totalInitialPoints.toFixed(1)}`,
          {
            align: "left",
          }
        );

        doc.text(
          `Total Current Story Points: ${totalCurrentPoints.toFixed(1)}`,
          {
            align: "left",
          }
        );

        const diff = totalCurrentPoints - totalInitialPoints;
        const percentChange =
          totalInitialPoints > 0 ? (diff / totalInitialPoints) * 100 : 0;

        doc.text(
          `Total Change: ${diff.toFixed(1)} (${percentChange.toFixed(1)}%)`,
          {
            align: "left",
          }
        );

        doc.moveDown(0.5);

        const pageWidth = doc.page.width - 40;
        const colWidths = {
          key: pageWidth * 0.1,
          summary: pageWidth * 0.35,
          description: pageWidth * 0.35,
          initial: pageWidth * 0.1,
          current: pageWidth * 0.1,
        };

        const tableTop = doc.y;
        let tableRow = tableTop;

        doc
          .lineWidth(0.5)
          .moveTo(20, tableRow)
          .lineTo(doc.page.width - 20, tableRow)
          .stroke();

        tableRow += 2;

        doc
          .fillColor("#e0e0e0")
          .rect(20, tableRow, pageWidth, 20)
          .fill();

        doc
          .fillColor("#000000")
          .fontSize(8)
          .font(boldFont)
          .text("Key", 23, tableRow + 6, {
            width: colWidths.key,
            align: "left",
          })
          .text("Summary", 23 + colWidths.key, tableRow + 6, {
            width: colWidths.summary,
            align: "left",
          })
          .text(
            "Description",
            23 + colWidths.key + colWidths.summary,
            tableRow + 6,
            { width: colWidths.description, align: "left" }
          )
          .text(
            "Initial SP",
            23 + colWidths.key + colWidths.summary + colWidths.description,
            tableRow + 6,
            { width: colWidths.initial, align: "center" }
          )
          .text(
            "Final SP",
            23 +
              colWidths.key +
              colWidths.summary +
              colWidths.description +
              colWidths.initial,
            tableRow + 6,
            { width: colWidths.current, align: "center" }
          );

        tableRow += 20;

        doc
          .lineWidth(0.5)
          .moveTo(20, tableRow)
          .lineTo(doc.page.width - 20, tableRow)
          .stroke();

        doc.font(originalFont);

        let currentPage = 1;
        let rowCount = 0;

        this.addPageFooter(doc, currentPage);

        const availablePageHeight = doc.page.height - 50;

        for (let i = 0; i < issues.length; i++) {
          const issue = issues[i];

          const key = issue.key;
          const summary = this.cleanText(issue.summary || "");
          let description = this.cleanText(issue.description || "");

          const fontSize = 7;
          doc.fontSize(fontSize);

          const summaryWidth = colWidths.summary - 4;
          const descriptionWidth = colWidths.description - 4;

          const summaryCharsPerLine = Math.floor(
            summaryWidth / (fontSize * 0.5)
          );
          const descriptionCharsPerLine = Math.floor(
            descriptionWidth / (fontSize * 0.5)
          );

          const summaryLines =
            Math.ceil(summary.length / summaryCharsPerLine) || 1;
          const descriptionLines =
            Math.ceil(description.length / descriptionCharsPerLine) || 1;

          const maxLines = Math.max(summaryLines, descriptionLines, 2);

          const lineHeight = fontSize * 1.2;
          const rowHeight = Math.max(maxLines * lineHeight + 4, 18);

          if (tableRow + rowHeight > availablePageHeight) {
            doc.addPage({ margin: 20 });
            currentPage++;
            rowCount = 0;

            this.addPageFooter(doc, currentPage);

            tableRow = 40;

            doc
              .lineWidth(0.5)
              .moveTo(20, tableRow - 20)
              .lineTo(doc.page.width - 20, tableRow - 20)
              .stroke();

            doc
              .fillColor("#e0e0e0")
              .rect(20, tableRow - 18, pageWidth, 16)
              .fill();

            doc
              .fillColor("#000000")
              .fontSize(8)
              .font(boldFont)
              .text("Key", 23, tableRow - 16, {
                width: colWidths.key,
                align: "left",
              })
              .text("Summary", 23 + colWidths.key, tableRow - 16, {
                width: colWidths.summary,
                align: "left",
              })
              .text(
                "Description",
                23 + colWidths.key + colWidths.summary,
                tableRow - 16,
                { width: colWidths.description, align: "left" }
              )
              .text(
                "Initial SP",
                23 + colWidths.key + colWidths.summary + colWidths.description,
                tableRow - 16,
                { width: colWidths.initial, align: "center" }
              )
              .text(
                "Final SP",
                23 +
                  colWidths.key +
                  colWidths.summary +
                  colWidths.description +
                  colWidths.initial,
                tableRow - 16,
                { width: colWidths.current, align: "center" }
              );

            doc
              .lineWidth(0.5)
              .moveTo(20, tableRow)
              .lineTo(doc.page.width - 20, tableRow)
              .stroke();

            doc.font(originalFont);
          }

          if (i % 2 === 0) {
            doc
              .fillColor("#f5f5f5")
              .rect(20, tableRow, pageWidth, rowHeight)
              .fill();
          }

          const textY = tableRow + 2;

          doc.fillColor("#000000").fontSize(fontSize);

          doc.text(key, 23, textY, {
            width: colWidths.key - 4,
            height: rowHeight - 4,
          });

          doc.text(summary, 23 + colWidths.key, textY, {
            width: colWidths.summary - 4,
            height: rowHeight - 4,
          });

          doc.text(
            description,
            23 + colWidths.key + colWidths.summary,
            textY,
            {
              width: colWidths.description - 4,
              height: rowHeight - 4,
            }
          );

          doc.text(
            issue.initialStoryPoint.toString(),
            23 + colWidths.key + colWidths.summary + colWidths.description,
            textY,
            {
              width: colWidths.initial - 4,
              height: rowHeight - 4,
              align: "center",
            }
          );

          doc.text(
            issue.currentStoryPoint.toString(),
            23 +
              colWidths.key +
              colWidths.summary +
              colWidths.description +
              colWidths.initial,
            textY,
            {
              width: colWidths.current - 4,
              height: rowHeight - 4,
              align: "center",
            }
          );

          tableRow += rowHeight;
          doc
            .lineWidth(0.25)
            .moveTo(20, tableRow)
            .lineTo(doc.page.width - 20, tableRow)
            .stroke();

          rowCount++;
        }

        doc.end();

        stream.on("finish", () => {
          resolve(tempFilePath);
        });

        stream.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        console.error("PDF generation error:", error);
        reject(error);
      }
    });
  }

  addPageFooter(doc, pageNumber) {
    doc
      .fontSize(10)
      .fillColor("#000")
      .text(`${pageNumber}`, 0, doc.page.height - 50, {
        align: "center",
        width: doc.page.width,
      });
  }

  async cleanupPdf(filePath) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("PDF dosyası silinemedi:", error);
      }
    }
  }
}

module.exports = new PdfService();
