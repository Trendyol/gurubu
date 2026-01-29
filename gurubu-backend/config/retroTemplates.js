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
        description: 'What should we start doing?',
        isMain: true
      },
      { 
        key: 'stop', 
        title: 'Stop 🛑', 
        color: 'red', 
        description: 'What should we stop doing?',
        isMain: true
      },
      { 
        key: 'continue', 
        title: 'Continue ✅', 
        color: 'blue', 
        description: 'What should we continue doing?',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'purple', 
        description: 'Next steps and tasks',
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
        description: 'What made you angry or frustrated?',
        isMain: true
      },
      { 
        key: 'sad', 
        title: 'Sad 😢', 
        color: 'orange', 
        description: 'What disappointed you?',
        isMain: true
      },
      { 
        key: 'glad', 
        title: 'Glad 😊', 
        color: 'green', 
        description: 'What made you happy?',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'purple', 
        description: 'Next steps and tasks',
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
        description: 'Celebrate successes',
        isMain: true
      },
      { 
        key: 'bad', 
        title: 'What could be improved? 🤔', 
        color: 'red', 
        description: 'Identify challenges',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'blue', 
        description: 'Next steps',
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
        description: 'What did we love?',
        isMain: true
      },
      { 
        key: 'learned', 
        title: 'Learned 📚', 
        color: 'blue', 
        description: 'What did we learn?',
        isMain: true
      },
      { 
        key: 'lacked', 
        title: 'Lacked 😔', 
        color: 'orange', 
        description: 'What was missing?',
        isMain: true
      },
      { 
        key: 'longedFor', 
        title: 'Longed For 🔮', 
        color: 'purple', 
        description: 'What do we wish for?',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'green', 
        description: 'Next steps and tasks',
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
        description: 'What propels us forward?',
        isMain: true
      },
      { 
        key: 'anchor', 
        title: 'Anchor ⚓', 
        color: 'red', 
        description: 'What slows us down?',
        isMain: true
      },
      { 
        key: 'island', 
        title: 'Island 🏝️', 
        color: 'blue', 
        description: 'Our goal/destination',
        isMain: true
      },
      { 
        key: 'rocks', 
        title: 'Rocks 🪨', 
        color: 'orange', 
        description: 'Risks and dangers',
        isMain: true
      },
      { 
        key: 'actionItems', 
        title: 'Action Items 🎯', 
        color: 'purple', 
        description: 'Next steps and tasks',
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
        description: 'What went well?',
        isMain: true
      },
      { 
        key: 'thorn', 
        title: 'Thorn 🌵', 
        color: 'red', 
        description: 'Challenges and pain points',
        isMain: true
      },
      { 
        key: 'bud', 
        title: 'Bud 🌱', 
        color: 'green', 
        description: 'Opportunities and potential',
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

const getTemplate = (templateId) => {
  return RETRO_TEMPLATES[templateId] || RETRO_TEMPLATES['what-went-well'];
};

const getAllTemplates = () => {
  return Object.values(RETRO_TEMPLATES);
};

const getPopularTemplates = () => {
  return Object.values(RETRO_TEMPLATES).filter(t => t.popular);
};

module.exports = {
  RETRO_TEMPLATES,
  getTemplate,
  getAllTemplates,
  getPopularTemplates
};
