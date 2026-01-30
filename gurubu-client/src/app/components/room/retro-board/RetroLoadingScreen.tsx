"use client";

import "@/styles/room/retro-board/retro-loading.scss";

const RetroLoadingScreen = () => {
  return (
    <div className="retro-loading">
      <div className="retro-loading__background">
        <div className="retro-loading__gradient retro-loading__gradient--1"></div>
        <div className="retro-loading__gradient retro-loading__gradient--2"></div>
        <div className="retro-loading__gradient retro-loading__gradient--3"></div>
        <div className="retro-loading__gradient retro-loading__gradient--4"></div>
      </div>

      <div className="retro-loading__content">
        <div className="retro-loading__spinner">
          <div className="retro-loading__spinner-ring"></div>
          <div className="retro-loading__spinner-ring"></div>
          <div className="retro-loading__spinner-ring"></div>
          <div className="retro-loading__icon">🎯</div>
        </div>
        <h2 className="retro-loading__title">Loading Retrospective</h2>
        <p className="retro-loading__subtitle">Preparing your retro session...</p>
      </div>
    </div>
  );
};

export default RetroLoadingScreen;
