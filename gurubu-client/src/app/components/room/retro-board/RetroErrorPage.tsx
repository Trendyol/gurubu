"use client";

import { useRouter } from "next/navigation";
import "@/styles/room/retro-board/retro-error.scss";

interface RetroErrorPageProps {
  message?: string;
  type?: 'not-found' | 'expired' | 'error';
}

const RetroErrorPage = ({ 
  message = "Retrospective not found", 
  type = 'not-found' 
}: RetroErrorPageProps) => {
  const router = useRouter();

  const getIcon = () => {
    switch (type) {
      case 'not-found':
        return '🔍';
      case 'expired':
        return '⏰';
      case 'error':
        return '⚠️';
      default:
        return '🔍';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'not-found':
        return 'Retrospective Not Found';
      case 'expired':
        return 'Retrospective Expired';
      case 'error':
        return 'Something Went Wrong';
      default:
        return 'Retrospective Not Found';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'not-found':
        return 'The retrospective you\'re looking for doesn\'t exist or has been deleted.';
      case 'expired':
        return 'This retrospective has expired. Retrospectives are available for 24 hours.';
      case 'error':
        return message || 'We encountered an error while loading the retrospective.';
      default:
        return message;
    }
  };

  return (
    <div className="retro-error">
      <div className="retro-error__background">
        <div className="retro-error__gradient retro-error__gradient--1"></div>
        <div className="retro-error__gradient retro-error__gradient--2"></div>
        <div className="retro-error__gradient retro-error__gradient--3"></div>
        <div className="retro-error__gradient retro-error__gradient--4"></div>
      </div>

      <div className="retro-error__content">
        <div className="retro-error__icon">{getIcon()}</div>
        <h1 className="retro-error__title">{getTitle()}</h1>
        <p className="retro-error__message">{getMessage()}</p>

        <div className="retro-error__actions">
          <button
            className="retro-error__button retro-error__button--primary"
            onClick={() => router.push('/create/retro')}
          >
            Create New Retro 🚀
          </button>
          <button
            className="retro-error__button retro-error__button--secondary"
            onClick={() => router.push('/retro/dashboard')}
          >
            My Retrospectives
          </button>
          <button
            className="retro-error__button retro-error__button--secondary"
            onClick={() => router.push('/')}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetroErrorPage;
