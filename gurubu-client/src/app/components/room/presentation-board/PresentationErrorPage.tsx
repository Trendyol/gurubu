"use client";

interface PresentationErrorPageProps {
  type: 'not-found' | 'expired' | 'error';
}

export default function PresentationErrorPage({ type }: PresentationErrorPageProps) {
  const getMessage = () => {
    switch (type) {
      case 'not-found':
        return {
          title: 'Presentation Not Found',
          message: 'This presentation does not exist or has been deleted.',
        };
      case 'expired':
        return {
          title: 'Presentation Expired',
          message: 'This presentation has expired and is no longer available.',
        };
      default:
        return {
          title: 'Error',
          message: 'An error occurred while loading the presentation.',
        };
    }
  };

  const { title, message } = getMessage();

  return (
    <div className="presentation-error-page">
      <div className="presentation-error-page__content">
        <h1 className="presentation-error-page__title">{title}</h1>
        <p className="presentation-error-page__message">{message}</p>
      </div>
    </div>
  );
}
