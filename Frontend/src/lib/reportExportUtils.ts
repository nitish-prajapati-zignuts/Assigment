import { Meeting, MeetingSummary, ActionItem } from "@/types/meeting";

/**
 * Generates an executive HTML string representation of a meeting summary
 */
export function buildExecutiveReportHTML(meeting: Meeting): string {
  const summary: MeetingSummary = meeting.summary || {
    purpose: "",
    discussionPoints: [],
    majorOutcomes: [],
    importantConcerns: [],
    nextSteps: [],
  };

  const participants = Array.isArray(meeting.participants)
    ? meeting.participants.join(", ")
    : meeting.participants || "N/A";

  const keyDecisionsHTML = (summary.keyDecisions || [])
    .map((item: any) => {
      const text = typeof item === "string" ? item : item.decision || JSON.stringify(item);
      const cat = typeof item === "object" && item?.category ? ` [${item.category}]` : "";
      return `<li style="margin-bottom: 6px; color: #1e293b; font-size: 14px; font-weight: 500;">🔹${cat} ${text}</li>`;
    })
    .join("");

  const discussionPointsHTML = (summary.discussionPoints || [])
    .map((point: string) => `<li style="margin-bottom: 6px; color: #334155; font-size: 14px;">▫️ ${point}</li>`)
    .join("");

  const actionItemsHTML = (summary.actionItems || [])
    .map(
      (item: ActionItem) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-size: 13px; font-weight: 600; color: #0f172a;">${item.task}</td>
      <td style="padding: 10px; font-size: 13px; color: #475569;">${item.owner}</td>
      <td style="padding: 10px; font-size: 13px; color: #475569;">${item.dueDate}</td>
      <td style="padding: 10px; font-size: 13px;"><span style="padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #e0e7ff; color: #3730a3;">${item.priority || "Medium"}</span></td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${meeting.title} - Executive Summary Report</title>
  <style>
    @media print {
      body { background: #ffffff !important; color: #000000 !important; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.6;
      margin: 0;
      padding: 32px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      border-bottom: 2px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 8px;
      background: #e0e7ff;
      color: #4338ca;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      margin: 12px 0 6px 0;
      color: #0f172a;
    }
    .meta {
      font-size: 13px;
      color: #64748b;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .card {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid #6366f1;
      font-size: 14px;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    th {
      text-align: left;
      padding: 8px 10px;
      background: #f1f5f9;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${meeting.type || "General Meeting"}</span>
      <h1 class="title">${meeting.title}</h1>
      <div class="meta">
        <strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString(undefined, { dateStyle: "full" })} &bull; 
        <strong>Participants:</strong> ${participants}
      </div>
    </div>

    ${
      summary.purpose
        ? `<div class="section">
            <div class="section-title">Purpose & Overview</div>
            <div class="card">${summary.purpose}</div>
          </div>`
        : ""
    }

    ${
      keyDecisionsHTML
        ? `<div class="section">
            <div class="section-title">Key Strategic Decisions</div>
            <ul style="padding-left: 20px; margin: 0;">${keyDecisionsHTML}</ul>
          </div>`
        : ""
    }

    ${
      discussionPointsHTML
        ? `<div class="section">
            <div class="section-title">Main Discussion Points</div>
            <ul style="padding-left: 20px; margin: 0;">${discussionPointsHTML}</ul>
          </div>`
        : ""
    }

    ${
      actionItemsHTML
        ? `<div class="section">
            <div class="section-title">Extracted Action Items</div>
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                ${actionItemsHTML}
              </tbody>
            </table>
          </div>`
        : ""
    }

    <div class="footer">
      Generated automatically by <strong>Syncra AI Executive Assistant</strong> &bull; ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads meeting summary as an HTML Executive Report file (.html)
 */
export function exportMeetingToHTMLReport(meeting: Meeting) {
  const htmlContent = buildExecutiveReportHTML(meeting);
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const safeTitle = meeting.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeTitle}_executive_summary.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens print preview formatted specifically for saving as a PDF document
 */
export function exportMeetingToPDF(meeting: Meeting) {
  const htmlContent = buildExecutiveReportHTML(meeting);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to open the PDF print dialog.");
    return;
  }
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
