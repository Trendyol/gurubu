const pdfService = require("../services/pdfService");
const jiraService = require("../services/jiraService");
const fs = require("fs");
exports.downloadBoardIssuesAsPdf = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!boardId) {
      return res.status(400).json({ error: "Board ID gerekli" });
    }

    const result = await jiraService.getAllBoardIssuesWithInitialStoryPoints(
      boardId
    );

    if (!result || !result.issues || result.issues.length === 0) {
      return res.status(404).json({ error: "Bu board için görev bulunamadı" });
    }

    const pdfPath = await pdfService.generateIssuesReport(
      result.issues,
      boardId
    );

    if (!fs.existsSync(pdfPath)) {
      return res
        .status(500)
        .json({ error: "PDF oluşturulurken bir hata oluştu" });
    }

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const formattedTime = today.toTimeString().split(" ")[0].replace(/:/g, "");
    const filename = `jira_board_${boardId}_raporu_${formattedDate}_${formattedTime}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    fileStream.on("close", () => {
      pdfService.cleanupPdf(pdfPath);
    });
  } catch (error) {
    console.error("PDF oluşturma hatası:", error);
    res.status(500).json({
      error: "PDF oluşturulurken bir hata oluştu",
      details: error.message,
    });
  }
};
