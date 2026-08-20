export const checkIsOverdue = (dueDate: string, status: string): boolean => {
  if (!dueDate || dueDate === "Not specified" || status === "Completed") {
    return false;
  }
  const today = new Date().toISOString().split("T")[0];
  return dueDate < today;
};

export const stripHtml = (input: string | null | undefined): string => {
  if (!input) return "";
  let str = input;
  if (/<[a-z]/i.test(str)) {
    str = str.replace(/<br\s*\/?>/gi, " ").replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n");
    let previousStr;
    do {
      previousStr = str;
      str = str.replace(/<[^>]+>/g, " ");
    } while (str !== previousStr);
    str = str
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&rdquo;/gi, '"')
      .replace(/&ldquo;/gi, '"')
      .replace(/&mdash;/gi, "—")
      .replace(/&ndash;/gi, "–")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim();
  } else {
    str = str
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&rdquo;/gi, '"')
      .replace(/&ldquo;/gi, '"')
      .replace(/&mdash;/gi, "—")
      .replace(/&ndash;/gi, "–")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/[ \t]+/g, " ")
      .trim();
  }
  return str;
};

export const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "Urgent":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 font-semibold";
    case "High":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 font-semibold";
    case "Medium":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800";
    case "Low":
      return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
};
