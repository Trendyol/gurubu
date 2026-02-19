const PRESENTATION_TEMPLATES = {
  'blank': {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch with a blank presentation.',
    popular: true,
    category: 'General',
    coverPage: {
      elements: [],
      background: { color: '#ffffff' },
      transition: { type: 'fade', duration: 500 }
    },
    contentPage: {
      elements: [],
      background: { color: '#ffffff' },
      transition: { type: 'fade', duration: 500 }
    },
    theme: {
      primaryColor: '#667eea',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#764ba2'
    },
    elementExamples: [
      {
        name: 'Simple Title',
        description: 'Basic heading element',
        elements: [
          {
            type: 'heading',
            content: 'Title',
            style: { fontFamily: 'Arial', fontSize: 48, fontWeight: 'bold', color: '#000000' },
            position: { x: 100, y: 200 },
            size: { width: 800, height: 80 }
          }
        ]
      },
      {
        name: 'Text Block',
        description: 'Paragraph text',
        elements: [
          {
            type: 'text',
            content: 'Add your text here...',
            style: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'normal', color: '#333333' },
            position: { x: 100, y: 200 },
            size: { width: 800, height: 200 }
          }
        ]
      }
    ],
    defaultStyles: {
      heading: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 48,
        fontWeight: '700',
        color: '#000000',
        letterSpacing: '-0.02em'
      },
      text: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 24,
        fontWeight: '400',
        color: '#333333',
        lineHeight: '1.5'
      }
    }
  },
  'business': {
    id: 'business',
    name: 'Business',
    icon: '💼',
    description: 'Professional business presentation template.',
    popular: true,
    category: 'Business',
    coverPage: {
      elements: [],
      background: { color: '#1a1a2e', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
      transition: { type: 'fade', duration: 500 }
    },
    contentPage: {
      elements: [],
      background: { color: '#f8f9fa', gradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' },
      transition: { type: 'slide', duration: 500 }
    },
    theme: {
      primaryColor: '#1a1a2e',
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      accentColor: '#667eea'
    },
    elementExamples: [
      {
        name: 'Title + Subtitle',
        description: 'Professional title with subtitle',
        elements: [
          {
            type: 'heading',
            content: 'Title',
            style: { fontFamily: 'Arial', fontSize: 56, fontWeight: 'bold', color: '#1a1a1a' },
            position: { x: 100, y: 200 },
            size: { width: 800, height: 100 }
          },
          {
            type: 'text',
            content: 'Subtitle',
            style: { fontFamily: 'Arial', fontSize: 32, fontWeight: 'normal', color: '#666666' },
            position: { x: 100, y: 320 },
            size: { width: 800, height: 50 }
          }
        ]
      },
      {
        name: 'Content Section',
        description: 'Title with content area',
        elements: [
          {
            type: 'heading',
            content: 'Content Title',
            style: { fontFamily: 'Arial', fontSize: 42, fontWeight: 'bold', color: '#1a1a1a' },
            position: { x: 100, y: 100 },
            size: { width: 800, height: 80 }
          },
          {
            type: 'text',
            content: 'Add your content here...',
            style: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'normal', color: '#333333' },
            position: { x: 100, y: 220 },
            size: { width: 800, height: 400 }
          }
        ]
      }
    ],
    defaultStyles: {
      heading: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 42,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: '-0.02em'
      },
      text: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 24,
        fontWeight: '400',
        color: '#333333',
        lineHeight: '1.6'
      }
    }
  },
  'technical': {
    id: 'technical',
    name: 'Technical',
    icon: '💻',
    description: 'Technical presentation with code examples.',
    popular: true,
    category: 'Technical',
    coverPage: {
      elements: [],
      background: { color: '#0d1117', gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' },
      transition: { type: 'fade', duration: 500 }
    },
    contentPage: {
      elements: [],
      background: { color: '#0d1117', gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' },
      transition: { type: 'fade', duration: 500 }
    },
    theme: {
      primaryColor: '#58a6ff',
      backgroundColor: '#0d1117',
      textColor: '#c9d1d9',
      accentColor: '#58a6ff'
    },
    elementExamples: [
      {
        name: 'Code Block',
        description: 'Code example with title',
        elements: [
          {
            type: 'heading',
            content: 'Code Example',
            style: { fontFamily: 'Courier New', fontSize: 36, fontWeight: 'bold', color: '#000000' },
            position: { x: 100, y: 100 },
            size: { width: 800, height: 60 }
          },
          {
            type: 'code',
            content: '// Add your code here\nconsole.log("Hello, World!");',
            style: { fontFamily: 'Courier New', fontSize: 16, language: 'javascript' },
            position: { x: 100, y: 180 },
            size: { width: 800, height: 300 }
          }
        ]
      },
      {
        name: 'Technical Title',
        description: 'Simple technical title',
        elements: [
          {
            type: 'heading',
            content: 'Technical Presentation',
            style: { fontFamily: 'Courier New', fontSize: 48, fontWeight: 'bold', color: '#000000' },
            position: { x: 100, y: 200 },
            size: { width: 800, height: 80 }
          }
        ]
      }
    ],
    defaultStyles: {
      heading: {
        fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        fontSize: 36,
        fontWeight: '600',
        color: '#58a6ff',
        letterSpacing: '-0.01em'
      },
      text: {
        fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        fontSize: 18,
        fontWeight: '400',
        color: '#c9d1d9',
        lineHeight: '1.6'
      },
      code: {
        fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        fontSize: 16,
        language: 'javascript'
      }
    }
  },
  'educational': {
    id: 'educational',
    name: 'Educational',
    icon: '📚',
    description: 'Educational presentation template for lessons.',
    popular: false,
    category: 'Education',
    coverPage: {
      elements: [],
      background: { color: '#fff8e1', gradient: 'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)' },
      transition: { type: 'fade', duration: 500 }
    },
    contentPage: {
      elements: [],
      background: { color: '#ffffff', gradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' },
      transition: { type: 'slide', duration: 500 }
    },
    theme: {
      primaryColor: '#f57c00',
      backgroundColor: '#fff8e1',
      textColor: '#3e2723',
      accentColor: '#ff9800'
    },
    elementExamples: [
      {
        name: 'Lesson Header',
        description: 'Title with chapter subtitle',
        elements: [
          {
            type: 'heading',
            content: 'Lesson Title',
            style: { fontFamily: 'Georgia', fontSize: 52, fontWeight: 'bold', color: '#1a1a1a' },
            position: { x: 100, y: 200 },
            size: { width: 800, height: 80 }
          },
          {
            type: 'text',
            content: 'Chapter 1: Introduction',
            style: { fontFamily: 'Georgia', fontSize: 28, fontWeight: 'normal', color: '#666666' },
            position: { x: 100, y: 300 },
            size: { width: 800, height: 50 }
          }
        ]
      },
      {
        name: 'Learning Objectives',
        description: 'Bullet list format',
        elements: [
          {
            type: 'heading',
            content: 'Learning Objectives',
            style: { fontFamily: 'Georgia', fontSize: 40, fontWeight: 'bold', color: '#1a1a1a' },
            position: { x: 100, y: 100 },
            size: { width: 800, height: 60 }
          },
          {
            type: 'text',
            content: '• Objective 1\n• Objective 2\n• Objective 3',
            style: { fontFamily: 'Georgia', fontSize: 24, fontWeight: 'normal', color: '#333333' },
            position: { x: 100, y: 200 },
            size: { width: 800, height: 400 }
          }
        ]
      }
    ],
    defaultStyles: {
      heading: {
        fontFamily: '"Merriweather", "Georgia", serif',
        fontSize: 40,
        fontWeight: '700',
        color: '#3e2723',
        letterSpacing: '-0.01em'
      },
      text: {
        fontFamily: '"Merriweather", "Georgia", serif',
        fontSize: 24,
        fontWeight: '400',
        color: '#5d4037',
        lineHeight: '1.7'
      }
    }
  }
};

const getTemplate = (templateId) => {
  return PRESENTATION_TEMPLATES[templateId] || PRESENTATION_TEMPLATES['blank'];
};

const getAllTemplates = () => {
  return Object.values(PRESENTATION_TEMPLATES);
};

const getPopularTemplates = () => {
  return Object.values(PRESENTATION_TEMPLATES).filter(t => t.popular);
};

module.exports = {
  PRESENTATION_TEMPLATES,
  getTemplate,
  getAllTemplates,
  getPopularTemplates
};
