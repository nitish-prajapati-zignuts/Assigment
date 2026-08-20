import { Meeting, ActionItem } from "@/types/meeting";

/**
 * Strips HTML tags for clean plain text export
 */
function stripHtml(html: string): string {
  if (!html) return "";
  let currentHtml = html;
  let previousHtml;
  do {
    previousHtml = currentHtml;
    currentHtml = currentHtml.replace(/<[^>]*>?/gm, "");
  } while (currentHtml !== previousHtml);
  return currentHtml.trim();
}

/**
 * Downloads a blob as a file in browser
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Export single Meeting to Markdown (.md)
 */
export function exportMeetingToMarkdown(meeting: Meeting) {
  let md = `# ${meeting.title}\n\n`;
  md += `**Date:** ${meeting.date}\n`;
  md += `**Type:** ${meeting.type}\n`;
  md += `**Participants:** ${meeting.participants.join(", ")}\n\n`;

  if (meeting.summary) {
    const s = meeting.summary;
    md += `## 📌 Overview / Purpose\n${s.purpose || "N/A"}\n\n`;

    if (s.discussionPoints && s.discussionPoints.length > 0) {
      md += `## 💬 Main Discussion Points\n`;
      s.discussionPoints.forEach((pt) => {
        md += `- ${pt}\n`;
      });
      md += `\n`;
    }

    if (s.majorOutcomes && s.majorOutcomes.length > 0) {
      md += `## ✅ Major Outcomes & Highlights\n`;
      s.majorOutcomes.forEach((out) => {
        md += `- ${out}\n`;
      });
      md += `\n`;
    }

    if (s.importantConcerns && s.importantConcerns.length > 0) {
      md += `## ⚠️ Concerns & Roadblocks\n`;
      s.importantConcerns.forEach((c) => {
        md += `- ${c}\n`;
      });
      md += `\n`;
    }

    if (s.actionItems && s.actionItems.length > 0) {
      md += `## 🚀 Extracted Action Items\n`;
      md += `| Task | Owner | Due Date | Priority | Status |\n`;
      md += `| --- | --- | --- | --- | --- |\n`;
      s.actionItems.forEach((ai) => {
        md += `| ${stripHtml(ai.task)} | ${stripHtml(ai.owner)} | ${stripHtml(ai.dueDate)} | ${ai.priority} | ${ai.status} |\n`;
      });
      md += `\n`;
    }
  }

  if (meeting.transcript) {
    md += `## 📝 Raw Transcript\n\`\`\`text\n${meeting.transcript}\n\`\`\`\n`;
  }

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const fileName = `${meeting.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_notes.md`;
  downloadBlob(blob, fileName);
}

/**
 * 2. Export single Meeting to PDF (via browser print layout)
 */
export function exportMeetingToPDF(meeting: Meeting) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const summaryHtml = meeting.summary
    ? `
      <h2 style="color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px;">Overview & Purpose</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #374151;">${meeting.summary.purpose || "N/A"}</p>

      ${
        meeting.summary.discussionPoints?.length
          ? `<h2 style="color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 20px;">Main Discussion Points</h2>
             <ul style="font-size: 14px; line-height: 1.6; color: #374151;">${meeting.summary.discussionPoints
               .map((pt) => `<li>${pt}</li>`)
               .join("")}</ul>`
          : ""
      }

      ${
        meeting.summary.majorOutcomes?.length
          ? `<h2 style="color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 20px;">Major Outcomes</h2>
             <ul style="font-size: 14px; line-height: 1.6; color: #374151;">${meeting.summary.majorOutcomes
               .map((o) => `<li>${o}</li>`)
               .join("")}</ul>`
          : ""
      }

      ${
        meeting.summary.actionItems?.length
          ? `<h2 style="color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 20px;">Action Items</h2>
             <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
               <thead>
                 <tr style="background-color: #f3f4f6; text-align: left;">
                   <th style="padding: 8px; border: 1px solid #e5e7eb;">Task</th>
                   <th style="padding: 8px; border: 1px solid #e5e7eb;">Owner</th>
                   <th style="padding: 8px; border: 1px solid #e5e7eb;">Due Date</th>
                   <th style="padding: 8px; border: 1px solid #e5e7eb;">Priority</th>
                   <th style="padding: 8px; border: 1px solid #e5e7eb;">Status</th>
                 </tr>
               </thead>
               <tbody>
                 ${meeting.summary.actionItems
                   .map(
                     (ai) => `
                   <tr>
                     <td style="padding: 8px; border: 1px solid #e5e7eb;">${stripHtml(ai.task)}</td>
                     <td style="padding: 8px; border: 1px solid #e5e7eb;">${stripHtml(ai.owner)}</td>
                     <td style="padding: 8px; border: 1px solid #e5e7eb;">${stripHtml(ai.dueDate)}</td>
                     <td style="padding: 8px; border: 1px solid #e5e7eb;">${ai.priority}</td>
                     <td style="padding: 8px; border: 1px solid #e5e7eb;">${ai.status}</td>
                   </tr>`
                   )
                   .join("")}
               </tbody>
             </table>`
          : ""
      }
    `
    : "<p>No summary generated yet.</p>";

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${meeting.title} - PDF Export</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; padding: 30px; color: #111827; }
          .header { border-bottom: 3px solid #6366f1; padding-bottom: 12px; margin-bottom: 24px; }
          .meta { font-size: 13px; color: #6b7280; margin-top: 6px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; color: #111827;">${meeting.title}</h1>
          <div class="meta">
            <span>Date: ${meeting.date}</span> &bull; 
            <span>Type: ${meeting.type}</span> &bull; 
            <span>Participants: ${meeting.participants.join(", ")}</span>
          </div>
        </div>
        ${summaryHtml}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

/**
 * 3. Export Action Items to CSV (.csv)
 */
export function exportActionItemsToCSV(items: (ActionItem & { meetingTitle?: string })[]) {
  const headers = ["ID", "Meeting Title", "Task", "Owner", "Due Date", "Priority", "Status"];
  const rows = items.map((i) => [
    i.id || "",
    `"${(i.meetingTitle || "").replace(/"/g, '""')}"`,
    `"${stripHtml(i.task).replace(/"/g, '""')}"`,
    `"${stripHtml(i.owner).replace(/"/g, '""')}"`,
    `"${stripHtml(i.dueDate).replace(/"/g, '""')}"`,
    i.priority,
    i.status,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `action_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * 4. Export Action Items to Markdown (.md)
 */
export function exportActionItemsToMarkdown(items: (ActionItem & { meetingTitle?: string })[]) {
  let md = `# Action Tracker Export\n\n`;
  md += `**Exported Date:** ${new Date().toLocaleDateString()}\n`;
  md += `**Total Tasks:** ${items.length}\n\n`;

  md += `| Meeting | Task | Owner | Due Date | Priority | Status |\n`;
  md += `| --- | --- | --- | --- | --- | --- |\n`;

  items.forEach((i) => {
    md += `| ${i.meetingTitle || "General"} | ${stripHtml(i.task)} | ${stripHtml(i.owner)} | ${stripHtml(i.dueDate)} | ${i.priority} | ${i.status} |\n`;
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `action_tracker_export_${new Date().toISOString().slice(0, 10)}.md`);
}

/**
 * 5. Export Meetings List to CSV (.csv)
 */
export function exportMeetingsToCSV(meetings: Meeting[]) {
  const headers = ["ID", "Title", "Date", "Type", "Participants", "Action Items Count"];
  const rows = meetings.map((m) => [
    m.id,
    `"${m.title.replace(/"/g, '""')}"`,
    `"${m.date}"`,
    `"${m.type}"`,
    `"${m.participants.join("; ").replace(/"/g, '""')}"`,
    m.summary?.actionItems?.length || 0,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `meetings_export_${new Date().toISOString().slice(0, 10)}.csv`);
}
