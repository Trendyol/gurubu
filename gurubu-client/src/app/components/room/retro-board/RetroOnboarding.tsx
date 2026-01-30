"use client";

import { useState, useEffect } from "react";
import "@/styles/room/retro-board/retro-onboarding.scss";

interface RetroOnboardingProps {
  isOwner: boolean;
  onTriggerConfetti?: () => void;
}

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
  target: string | null;
  position?: "right" | "bottom" | "top" | "center" | "left";
  action?: string | null;
  highlightSidebar?: boolean;
  triggerConfetti?: boolean;
}

const RetroOnboarding = ({ isOwner, onTriggerConfetti }: RetroOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  useEffect(() => {
    const storageKey = isOwner ? "retroOnboardingSeenOwner" : "retroOnboardingSeenUser";
    const hasSeenOnboarding = localStorage.getItem(storageKey);
    if (!hasSeenOnboarding) {
      setTimeout(() => setShow(true), 1000);
    }
  }, [isOwner]);

  const ownerSteps: OnboardingStep[] = [
    {
      icon: "👋",
      title: "Welcome, Facilitator!",
      description: "As the retro owner, you have special controls to manage the session.",
      target: null,
      action: null,
    },
    {
      icon: "📝",
      title: "Card Templates",
      description: "Use the sidebar to drag colorful card templates. Click any column to add cards directly!",
      target: ".retro-sidebar__icon[data-type='cards']",
      position: "right" as const,
      action: null,
    },
    {
      icon: "🎨",
      title: "Stamps & Images",
      description: "Add visual elements! Use stamps to react and images to make your board more engaging.",
      target: ".retro-sidebar__icon[data-type='stamps']",
      position: "right" as const,
      action: null,
    },
    {
      icon: "🖼️",
      title: "Board Images",
      description: "Upload and drag images from the sidebar to place them anywhere on the board!",
      target: ".retro-sidebar__icon[data-type='images']",
      position: "right" as const,
      action: null,
    },
    {
      icon: "🎛️",
      title: "Control Panel",
      description: "Use the top bar to access timer, music, export, and invite controls!",
      target: ".retro-board__header",
      position: "bottom" as const,
      action: null,
    },
    {
      icon: "⏰",
      title: "Timer Control",
      description: "Click the timer button to set timers and keep activities focused!",
      target: ".retro-board__control-btn",
      position: "bottom" as const,
      action: null,
    },
    {
      icon: "📊",
      title: "Export & Share",
      description: "Export results to CSV and share the invite link with your team!",
      target: ".retro-board__invite-btn",
      position: "bottom" as const,
      action: null,
    },
    {
      icon: "🎯",
      title: "Action Items",
      description: "Track action items in the side panel. Click the button on the right to open!",
      target: ".retro-action-panel__toggle",
      position: "left" as const,
      action: null,
    },
    {
      icon: "🎉",
      title: "Celebrate Wins!",
      description: "Click the sparkles button to celebrate achievements with confetti!",
      target: ".retro-sidebar__icon[data-type='confetti']",
      position: "right" as const,
      action: null,
      triggerConfetti: true,
    },
  ];

  const userSteps: OnboardingStep[] = [
    {
      icon: "👋",
      title: "Welcome to Retro!",
      description: "Let's quickly show you around so you can participate effectively.",
      target: null,
      action: null,
    },
    {
      icon: "📝",
      title: "Add Your Thoughts",
      description: "Click any column to add cards. Share what went well, what didn't, and your ideas!",
      target: ".retro-board__columns",
      position: "center" as const,
      action: null,
    },
    {
      icon: "🎨",
      title: "Use Card Templates",
      description: "Find colorful card templates in the sidebar to express yourself!",
      target: ".retro-sidebar__icon[data-type='cards']",
      position: "right" as const,
      action: null,
    },
    {
      icon: "🖼️",
      title: "Add Stamps & Images",
      description: "Use stamps and images from the sidebar to make your cards more visual!",
      target: ".retro-sidebar__icon[data-type='stamps']",
      position: "right" as const,
      action: null,
    },
    {
      icon: "👍",
      title: "Vote on Cards",
      description: "Click cards to vote on them. Your votes help prioritize important topics!",
      target: ".retro-board__columns",
      position: "center" as const,
      action: null,
    },
    {
      icon: "👥",
      title: "Collaborate",
      description: "See everyone's cursors in real-time. Mention teammates with @ in your cards!",
      target: null,
      action: null,
    },
    {
      icon: "🎯",
      title: "Action Items",
      description: "Check action items in the side panel. Click the button on the right to view them!",
      target: ".retro-action-panel__toggle",
      position: "left" as const,
      action: null,
    },
    {
      icon: "🎉",
      title: "Celebrate Together!",
      description: "Click the sparkles button when the team achieves something great!",
      target: ".retro-sidebar__icon[data-type='confetti']",
      position: "right" as const,
      action: null,
      triggerConfetti: true,
    },
  ];

  const steps = isOwner ? ownerSteps : userSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    const storageKey = isOwner ? "retroOnboardingSeenOwner" : "retroOnboardingSeenUser";
    localStorage.setItem(storageKey, "true");
    setShow(false);
  };

  // Step değiştiğinde action'ları yönet
  useEffect(() => {
    if (!show) return;

    const step = steps[currentStep];

    // Konfeti tetikle (sadece bir kez)
    if (step.triggerConfetti && onTriggerConfetti && !confettiTriggered) {
      setTimeout(() => {
        onTriggerConfetti();
        setConfettiTriggered(true);
      }, 500);
    }

    // Target element'e scroll
    if (step.target) {
      setTimeout(() => {
        const element = document.querySelector(step.target!);
        if (element) {
          // Viewport kontrolü
          const rect = element.getBoundingClientRect();
          if (rect.top < 0 || rect.bottom > window.innerHeight || rect.left < 0 || rect.right > window.innerWidth) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }
        }
      }, 100);
    }
  }, [show, currentStep, steps, onTriggerConfetti, confettiTriggered]);

  if (!show) return null;

  const step = steps[currentStep];
  const targetElement = step.target ? document.querySelector(step.target) : null;
  const targetRect = targetElement?.getBoundingClientRect();

  const getTooltipPosition = () => {
    if (!targetRect || !step.position) return {};

    const tooltipWidth = 400;
    const tooltipHeight = 250;
    const padding = 30;
    
    let left = 0;
    let top = 0;
    let transform = '';

    switch (step.position) {
      case 'right':
        left = Math.min(targetRect.right + padding, window.innerWidth - tooltipWidth - 20);
        top = Math.max(20, Math.min(targetRect.top + targetRect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - 20));
        break;
      case 'left':
        left = Math.max(20, targetRect.left - tooltipWidth - padding);
        top = Math.max(20, Math.min(targetRect.top + targetRect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - 20));
        break;
      case 'bottom':
        left = Math.max(20, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 20));
        top = Math.min(targetRect.bottom + padding, window.innerHeight - tooltipHeight - 20);
        break;
      case 'top':
        left = Math.max(20, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 20));
        top = Math.max(20, targetRect.top - tooltipHeight - padding);
        break;
      case 'center':
        left = window.innerWidth / 2 - tooltipWidth / 2;
        top = window.innerHeight / 2 - tooltipHeight / 2;
        break;
      default:
        return {};
    }

    return { left: `${left}px`, top: `${top}px` };
  };

  return (
    <>
      <div 
        className={`retro-onboarding ${step.target ? 'retro-onboarding--positioned' : ''}`}
        style={step.target ? getTooltipPosition() : {}}
      >
        <div className="retro-onboarding__content">
          <div className="retro-onboarding__icon">{step.icon}</div>
          <h2 className="retro-onboarding__title">{step.title}</h2>
          <p className="retro-onboarding__description">{step.description}</p>

          <div className="retro-onboarding__progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`retro-onboarding__dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div className="retro-onboarding__actions">
            <button
              className="retro-onboarding__button retro-onboarding__button--skip"
              onClick={handleSkip}
            >
              Skip
            </button>
            <button
              className="retro-onboarding__button retro-onboarding__button--next"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? "Get Started 🚀" : "Next"}
            </button>
          </div>
        </div>
      </div>
      <div className="retro-onboarding__overlay" onClick={handleSkip}></div>
    </>
  );
};

export default RetroOnboarding;
