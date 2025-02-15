export const convertJiraToMarkdown = (jiraText: string) => {
  if (!jiraText) return "";
  
  let converted = jiraText;

  // Convert Jira task links to styled links
  converted = converted.replace(/SFWC-\d+/g, (match) => 
    `<a href="#" class="jira-task-link">${match}</a>`
  );

  // Convert color tags with proper Jira styling
  converted = converted.replace(
    /\{color:#([^}]+)\}([^{]+)\{color\}/g, 
    '<span style="color:#$1;font-weight:700">$2</span>'
  );

  // Handle section headers (Amaç:, Kapsam:, etc.)
  const sections = [
    'Amaç',
    'Kapsam',
    'Açıklama',
    'Servis Bilgileri',
    'Tasarım',
    'İlgili Tasklar',
    'İletişim',
    'Not',
    'Event Bilgileri'
  ];

  sections.forEach(section => {
    converted = converted.replace(
      new RegExp(`\\*${section}:\\*`, 'g'),
      `<h3 class="jira-section-header">${section}:</h3>`
    );
  });

  // First handle the Kapsam section's special formatting
  const kapsamPattern = /Kapsam:([^]*?)(?=\*[^:]+:|\$)/;
  const kapsamMatch = converted.match(kapsamPattern);
  
  if (kapsamMatch) {
    const kapsamContent = kapsamMatch[1];
    const formattedKapsam = kapsamContent.replace(
      /\{\*\}([^:]+):\s*([^\n\r]+)/g,
      (_, key, value) => `<div class="jira-key-value"><span class="key">${key}:</span> <span class="value">${value.trim()}</span></div>`
    );
    converted = converted.replace(kapsamContent, formattedKapsam);
  }

  // Process bullet points and nested content
  const lines = converted.split(/\r\n|\n/);
  let currentIndentLevel = 0;
  let inKapsamSection = false;

  converted = lines.map(line => {
    // Check if we're entering Kapsam section
    if (line.includes('Kapsam:')) {
      inKapsamSection = true;
      return line;
    } else if (line.match(/\*[^:]+:/)) {
      inKapsamSection = false;
      return line;
    }

    // Skip lines in Kapsam section as they're handled separately
    if (inKapsamSection) {
      return line;
    }

    // Handle bullet points
    if (line.match(/^\s*\*\s/)) {
      const indentMatch = line.match(/^\s*/);
      const indentation = indentMatch ? indentMatch[0].length : 0;
      const content = line.replace(/^\s*\*\s*/, '').trim();
      
      // Calculate relative indent level
      const indentLevel = Math.floor(indentation / 2);
      currentIndentLevel = indentLevel;

      return `<div class="jira-bullet level-${indentLevel}">${content}</div>`;
    }

    // Handle continuation of previous bullet point
    if (line.match(/^\s+/) && currentIndentLevel > 0) {
      return `<div class="jira-bullet-continuation level-${currentIndentLevel}">${line.trim()}</div>`;
    }

    currentIndentLevel = 0;
    return line;
  }).join('\\n');

  // Convert panels
  const panelRegex = /\{panel:([^}]*)\}([\s\S]*?)\{panel\}/g;
  converted = converted.replace(panelRegex, (match, attributes, content) => {
    // Parse panel attributes
    const attrs: { [key: string]: string } = {};
    attributes.split('|').forEach((attr: string) => {
      const [key, value] = attr.split('=');
      if (key && value) {
        attrs[key.trim()] = value.trim();
      }
    });

    // Build inline styles
    const styles = [
      attrs.borderStyle ? `border-style: ${attrs.borderStyle}` : 'border-style: solid',
      attrs.borderColor ? `border-color: ${attrs.borderColor}` : 'border-color: #b0bec5',
      attrs.bgColor ? `background-color: ${attrs.bgColor}` : 'background-color: #ffffff',
      'border-width: 1px',
      'border-radius: 3px',
      'margin: 10px 0',
      'padding: 0',
      'overflow: hidden'
    ].join(';');

    // Build title styles
    const titleStyles = [
      attrs.titleBGColor ? `background-color: ${attrs.titleBGColor}` : 'background-color: #f4f5f7',
      'padding: 7px 12px',
      'margin: 0',
      'font-size: 14px',
      'font-weight: 600'
    ].join(';');

    // Build content styles
    const contentStyles = [
      'padding: 10px 12px',
      'margin: 0'
    ].join(';');

    return `
      <div class="jira-panel" style="${styles}">
        ${attrs.title ? `<div class="jira-panel-title" style="${titleStyles}">${attrs.title}</div>` : ''}
        <div class="jira-panel-content" style="${contentStyles}">${content.trim()}</div>
      </div>
    `;
  });

  // Convert links
  converted = converted.replace(
    /\[(https?:\/\/[^\]]+)\]/g,
    '<a href="$1" target="_blank" class="jira-link">$1</a>'
  );

  // Convert tables
  converted = converted.replace(
    /\|\|([^|]*)\|\|([^|]*)\|\|([^|]*)\|\|/g,
    '<table class="jira-table"><thead><tr><th>$1</th><th>$2</th><th>$3</th></tr></thead><tbody>'
  );
  converted = converted.replace(
    /\|([^|]*)\|([^|]*)\|([^|]*)\|/g,
    '<tr><td>$1</td><td>$2</td><td>$3</td></tr>'
  );
  converted = converted.replace(
    /<tbody>(\s*)<tr><td>---<\/td>/g,
    '<tbody>'
  );
  converted += '</tbody></table>';

  // Handle line breaks
  converted = converted.replace(/\\r\\n|\\n/g, '<br/>');

  // Clean up any remaining Jira markdown artifacts
  converted = converted.replace(/\{\*\}/g, '');
  converted = converted.replace(/\{color\}/g, '');

  return `<div class="jira-description">${converted}</div>`;
};

export const jiraDescriptionStyles = `
  .jira-description {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 14px;
    line-height: 1.42857143;
    color: #172B4D;
    max-width: 800px;
  }

  .jira-section-header {
    color: #172B4D;
    font-size: 16px;
    font-weight: 500;
    margin: 24px 0 8px 0;
    padding: 0;
  }

  .jira-bullet {
    position: relative;
    padding-left: 20px;
    margin: 4px 0;
    line-height: 1.42857143;
  }

  .jira-bullet:before {
    content: "•";
    position: absolute;
    left: 8px;
    color: #172B4D;
  }

  .jira-bullet.level-0 {
    margin-left: 0;
  }

  .jira-bullet.level-1 {
    margin-left: 20px;
  }

  .jira-bullet.level-2 {
    margin-left: 40px;
  }

  .jira-bullet-continuation {
    padding-left: 20px;
    margin: 4px 0;
    line-height: 1.42857143;
  }

  .jira-bullet-continuation.level-1 {
    margin-left: 20px;
  }

  .jira-bullet-continuation.level-2 {
    margin-left: 40px;
  }

  .jira-key-value {
    position: relative;
    padding-left: 20px;
    margin: 4px 0;
    line-height: 1.42857143;
  }

  .jira-key-value:before {
    content: "•";
    position: absolute;
    left: 8px;
    color: #172B4D;
  }

  .jira-key-value .key {
    font-weight: 500;
  }

  .jira-key-value .value {
    color: #172B4D;
  }

  .jira-task-link {
    color: #0052CC;
    text-decoration: none;
    font-weight: 500;
  }

  .jira-task-link:hover {
    text-decoration: underline;
  }

  .jira-link {
    color: #0052CC;
    text-decoration: none;
    word-break: break-word;
  }

  .jira-link:hover {
    text-decoration: underline;
  }

  .jira-table {
    border-collapse: collapse;
    margin: 16px 0;
    width: 100%;
    background: #fff;
  }

  .jira-table th {
    background: #f4f5f7;
    text-align: left;
    color: #172B4D;
    font-weight: 500;
    padding: 7px 10px;
    border: 1px solid #DFE1E6;
  }

  .jira-table td {
    padding: 7px 10px;
    border: 1px solid #DFE1E6;
    vertical-align: top;
  }

  .jira-panel {
    margin: 10px 0;
    padding: 0;
    border: 1px solid #b0bec5;
    border-radius: 3px;
    overflow: hidden;
  }

  .jira-panel-title {
    background-color: #f4f5f7;
    padding: 7px 12px;
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .jira-panel-content {
    padding: 10px 12px;
    margin: 0;
  }

  br {
    margin-bottom: 8px;
  }

  h3:first-child {
    margin-top: 0;
  }
`;
