export const convertJiraToMarkdown = (jiraText: string) => {
  let converted = jiraText;

  // Convert {**}text{**} to **text** (Bold)
  converted = converted?.replace(/\{\*\}([^{}]*)\{\*\}/g, "**$1**");

  // Handle cases where {*}x{*} means x is a bullet and bold
  converted = converted?.replace(/\{\*\}([^{}]*)\{\*\}/g, "- **$1**");

  // Bold the entire string, including the word and the colon
  converted = converted?.replace(/\{\*\}([^{}]+):\{\*\}/g, "**$1:**");

  // Convert table structure ||Header||Header||Header|| to Markdown table
  converted = converted?.replace(
    /\|\|([^|]*)\|\|([^|]*)\|\|([^|]*)\|\|/g,
    "| $1 | $2 | $3 |\n|---|---|---|"
  );

  // Convert {code:java}...{code} to ```java...```
  converted = converted?.replace(/\{code:java\}([\s\S]*?)\{code\}/g, "```java\n$1\n```");

  // Handle \r\n or \n multiple consecutive newlines by replacing with markdown line breaks
  let newlineCount = (converted?.match(/\r\n/g) || []).length;

  // Adjust text based on the number of consecutive newlines
  if (newlineCount > 1) {
    converted = converted?.replace(/\r\n+/g, '\n\n');  // Multiple consecutive \r\n will result in double newlines
  }

  // Convert \r\n (carriage return) or \n (newline) to a Markdown line break
  converted = converted?.replace(/\r\n|\n/g, "  \n"); // Markdown line breaks

  // Convert # to ordered list (Treating lines starting with # as ordered list items)
  converted = converted?.replace(/^#\s(.*)/gm, (match, p1) => {
    return `- ${p1}`;  // Convert to ordered list item with dash `-`
  });

  // Handle numbered lists (1. 2. 3. ... into Markdown numbering)
  converted = converted?.replace(/^(\d+)\. (.*)$/gm, "$1. $2");

  // Ensure sorting doesn't break the list numbers (sorted list example)
  converted = converted?.replace(/(\d+)\. (\d+)\./g, '$1. $2.');
  
  return converted || "";
};
