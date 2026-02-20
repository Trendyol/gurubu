const RETRO_TEMPLATES = {
  'start-stop-continue': {
    id: 'start-stop-continue',
    name: 'Start-Stop-Continue',
    icon: '🚀',
    description: 'Classic and simple. What to start, stop, and continue doing.',
    popular: true,
    columns: [
      { 
        key: 'start', 
        title: 'Start 🚀', 
        color: 'green', 
        description: 'New practices, tools, or behaviors we should begin. What would make us more effective?',
        isMain: true
      },
      { 
        key: 'stop', 
        title: 'Stop 🛑', 
        color: 'red', 
        description: 'Activities or habits that waste time or create problems. What should we eliminate?',
        isMain: true
      },
      { 
        key: 'continue', 
        title: 'Continue ✅', 
        color: 'blue', 
        description: 'Successful practices worth maintaining. What is working well and should stay?',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'purple', 
        description: 'Specific commitments to start, stop, or continue. Who owns what?',
        isMain: false
      }
    ]
  },
  'mad-sad-glad': {
    id: 'mad-sad-glad',
    name: 'Mad-Sad-Glad',
    icon: '😊',
    description: 'Express emotions. What made you mad, sad, or glad?',
    popular: true,
    columns: [
      { 
        key: 'mad', 
        title: 'Mad 😠', 
        color: 'red', 
        description: 'Things that frustrated or angered you. Express strong concerns that need attention.',
        isMain: true
      },
      { 
        key: 'sad', 
        title: 'Sad 😢', 
        color: 'orange', 
        description: 'Disappointments and missed opportunities. Share what let you down.',
        isMain: true
      },
      { 
        key: 'glad', 
        title: 'Glad 😊', 
        color: 'green', 
        description: 'Positive moments and achievements. Celebrate what made you happy!',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'purple', 
        description: 'Turn emotions into action. How do we address concerns and amplify successes?',
        isMain: false
      }
    ]
  },
  'what-went-well': {
    id: 'what-went-well',
    name: 'What Went Well',
    icon: '🎯',
    description: 'Analyze what went well and what to improve.',
    popular: false,
    columns: [
      { 
        key: 'good', 
        title: 'What went well? 😊', 
        color: 'green', 
        description: 'Share positive moments, achievements, and things that worked well during the sprint. Celebrate team successes!',
        isMain: true
      },
      { 
        key: 'bad', 
        title: 'What could be improved? 🤔', 
        color: 'red', 
        description: 'Discuss challenges, blockers, and areas for improvement. Focus on constructive feedback and solutions.',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'blue', 
        description: 'Define concrete next steps, commitments, and improvements. Assign owners and set deadlines.',
        isMain: false
      }
    ]
  },
  '4ls': {
    id: '4ls',
    name: '4Ls',
    icon: '📚',
    description: 'Loved, Learned, Lacked, Longed For - Detailed analysis.',
    popular: false,
    columns: [
      { 
        key: 'loved', 
        title: 'Loved ❤️', 
        color: 'pink', 
        description: 'What aspects of the sprint did we absolutely love? Highlight the best moments and practices.',
        isMain: true
      },
      { 
        key: 'learned', 
        title: 'Learned 📚', 
        color: 'blue', 
        description: 'What new knowledge, skills, or insights did we gain? Share learning experiences.',
        isMain: true
      },
      { 
        key: 'lacked', 
        title: 'Lacked 😔', 
        color: 'orange', 
        description: 'What resources, support, or conditions were missing? Identify gaps and needs.',
        isMain: true
      },
      { 
        key: 'longedFor', 
        title: 'Longed For 🔮', 
        color: 'purple', 
        description: 'What do we wish we had? Express desires for tools, processes, or improvements.',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'green', 
        description: 'Concrete tasks and commitments based on our reflections. Who will do what by when?',
        isMain: false
      }
    ]
  },
  'sailboat': {
    id: 'sailboat',
    name: 'Sailboat',
    icon: '⛵',
    description: 'Metaphorical retrospective using sailing imagery.',
    popular: false,
    columns: [
      { 
        key: 'wind', 
        title: 'Wind ⛵', 
        color: 'green', 
        description: 'What helps us move forward? Identify positive forces, momentum, and enabling factors.',
        isMain: true
      },
      { 
        key: 'anchor', 
        title: 'Anchor ⚓', 
        color: 'red', 
        description: 'What holds us back? Discuss obstacles, blockers, and things that slow down progress.',
        isMain: true
      },
      { 
        key: 'island', 
        title: 'Island 🏝️', 
        color: 'blue', 
        description: 'Where are we heading? Define our goals, vision, and desired destination.',
        isMain: true
      },
      { 
        key: 'rocks', 
        title: 'Rocks 🪨', 
        color: 'orange', 
        description: 'What risks and dangers should we watch out for? Identify potential problems ahead.',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'purple', 
        description: 'Chart our course forward. Define specific actions to navigate successfully.',
        isMain: false
      }
    ]
  },
  'rose-thorn-bud': {
    id: 'rose-thorn-bud',
    name: 'Rose-Thorn-Bud',
    icon: '🌹',
    description: 'Nature metaphor for successes, challenges, and opportunities.',
    popular: true,
    columns: [
      { 
        key: 'rose', 
        title: 'Rose 🌹', 
        color: 'pink', 
        description: 'Beautiful moments and highlights. What bloomed well during the sprint?',
        isMain: true
      },
      { 
        key: 'thorn', 
        title: 'Thorn 🌵', 
        color: 'red', 
        description: 'Pain points and challenges that hurt. What pricked us along the way?',
        isMain: true
      },
      { 
        key: 'bud', 
        title: 'Bud 🌱', 
        color: 'green', 
        description: 'Opportunities ready to bloom. What potential do we see for growth?',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'blue', 
        description: 'Next steps and tasks',
        isMain: false
      }
    ]
  }
};

const COLUMN_COLORS = ['green', 'red', 'blue', 'orange', 'pink', 'purple', 'teal', 'yellow'];

const getTemplate = (templateId) => {
  return RETRO_TEMPLATES[templateId] || RETRO_TEMPLATES['what-went-well'];
};

const getAllTemplates = () => {
  return Object.values(RETRO_TEMPLATES);
};

const getPopularTemplates = () => {
  return Object.values(RETRO_TEMPLATES).filter(t => t.popular);
};

/**
 * Build a custom template from user-provided column names.
 * Always adds an "Action Items" side column automatically.
 */
const buildCustomTemplate = (columnNames) => {
  const columns = columnNames.map((name, index) => ({
    key: `custom_${index}`,
    title: name,
    color: COLUMN_COLORS[index % COLUMN_COLORS.length],
    description: '',
    isMain: true,
  }));

  // Always add Action Items as side panel
  columns.push({
    key: 'actionItems',
    title: 'Action Items 🎯',
    color: 'purple',
    description: 'Define concrete next steps and commitments.',
    isMain: false,
  });

  return {
    id: 'custom',
    name: 'Custom',
    icon: '🛠️',
    description: 'Custom template with your own columns.',
    popular: false,
    columns,
  };
};

module.exports = {
  RETRO_TEMPLATES,
  getTemplate,
  getAllTemplates,
  getPopularTemplates,
  buildCustomTemplate
};
