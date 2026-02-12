"use client";

import { useState, useRef, useEffect } from "react";
import { RetroService } from "@/services/retroService";
import { saveRetroToHistory } from "@/shared/helpers/lobbyStorage";
import "@/styles/room/style.scss";

interface RetroTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  popular: boolean;
  columns: Array<{
    key: string;
    title: string;
    color: string;
    description: string;
  }>;
}

const CreateRetro = () => {
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("what-went-well");
  const [retentionDays, setRetentionDays] = useState(5);
  const [templates, setTemplates] = useState<RetroTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const retroService = new RetroService(process.env.NEXT_PUBLIC_API_URL || "");

  useEffect(() => {
    const savedNickname = localStorage.getItem("retroNickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Fetch templates
    const fetchTemplates = async () => {
      const fetchedTemplates = await retroService.getTemplates();
      setTemplates(fetchedTemplates);
      setLoadingTemplates(false);
    };

    fetchTemplates();
  }, []);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 17) {
      setNickname(e.target.value.trim());
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 51) {
      setTitle(e.target.value);
    }
  };

  const handleCreateRetro = async () => {
    setLoading(true);

    const trimmedNickName = nickname.trim();
    if (trimmedNickName === "") {
      setLoading(false);
      return;
    }

    localStorage.setItem("retroNickname", trimmedNickName);

    const payload = {
      nickName: trimmedNickName,
      title: title.trim() || "Team Retrospective",
      templateId: selectedTemplate,
      retentionDays,
    };

    const response = await retroService.createRetro(payload);

    if (!response) {
      setLoading(false);
      return;
    }

    let lobby = JSON.parse(localStorage.getItem("retroLobby") || "{}");

    if (!Object.keys(lobby).length) {
      const lobbyContent = {
        state: {
          retros: {
            [response.retroId]: response,
          },
        },
      };
      lobby = lobbyContent;
      localStorage.setItem("retroLobby", JSON.stringify(lobbyContent));
    }

    lobby.state.retros[response.retroId] = response;
    localStorage.setItem("retroLobby", JSON.stringify(lobby));

    // Save to retro history for dashboard
    saveRetroToHistory(response.retroId, title.trim() || "Team Retrospective", selectedTemplate, false);

    window.location.assign(`/retro/dashboard`);
  };

  return (
    <main className="create-room">
      <div className="retro-nickname-wrapper">
        <div className="retro-nickname-background">
          <div className="retro-nickname-background__gradient retro-nickname-background__gradient--1"></div>
          <div className="retro-nickname-background__gradient retro-nickname-background__gradient--2"></div>
          <div className="retro-nickname-background__gradient retro-nickname-background__gradient--3"></div>
          <div className="retro-nickname-background__gradient retro-nickname-background__gradient--4"></div>
        </div>

        <div className="retro-nickname-form retro-nickname-form--wide">
          <div className="retro-nickname-form__container">
            <div className="retro-nickname-form__icon">🎯</div>
            <h1 className="retro-nickname-form__title">Create Retrospective</h1>
            <p className="retro-nickname-form__subtitle">Start a new team retrospective session</p>

            <div className="retro-nickname-form__form">
              <input
                ref={inputRef}
                type="text"
                className="retro-nickname-form__input"
                placeholder="Your nickname"
                value={nickname}
                onChange={handleNicknameChange}
                disabled={loading}
              />

              <input
                type="text"
                className="retro-nickname-form__input"
                placeholder="Retrospective title (optional)"
                value={title}
                onChange={handleTitleChange}
                disabled={loading}
              />

              {/* Template Selection */}
              <div className="retro-template-selector">
                <h3 className="retro-template-selector__title">
                  Choose a Template
                  <span className="retro-template-selector__hint">💡 Hover for details</span>
                </h3>

                {loadingTemplates ? (
                  <div className="retro-template-selector__loading">Loading...</div>
                ) : (
                  <div className="retro-template-scroll">
                    <div className="retro-template-list">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`retro-template-item ${selectedTemplate === template.id ? 'selected' : ''}`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="retro-template-item__main">
                            <span className="retro-template-item__icon">{template.icon}</span>
                            <span className="retro-template-item__name">{template.name}</span>

                            <div
                              className="retro-template-item__info"
                              onMouseEnter={(e) => {
                                const tooltip = e.currentTarget.querySelector('.retro-template-item__tooltip') as HTMLElement;
                                if (tooltip) {
                                  const iconRect = e.currentTarget.getBoundingClientRect();
                                  const tooltipHeight = 400; // Approximate tooltip height
                                  const viewportHeight = window.innerHeight;

                                  // Check if tooltip would go below viewport
                                  if (iconRect.bottom + tooltipHeight > viewportHeight) {
                                    // Open upwards
                                    tooltip.style.top = 'auto';
                                    tooltip.style.bottom = '0';
                                  } else {
                                    // Open downwards (default)
                                    tooltip.style.top = '-8px';
                                    tooltip.style.bottom = 'auto';
                                  }
                                }
                              }}
                            >
                              <span className="retro-template-item__info-icon">?</span>
                              <div className="retro-template-item__tooltip">
                            <div className="retro-template-tooltip">
                              <h4 className="retro-template-tooltip__title">
                                {template.icon} {template.name}
                              </h4>
                              <p className="retro-template-tooltip__description">{template.description}</p>

                              <div className="retro-template-tooltip__section">
                                <h5 className="retro-template-tooltip__section-title">Main Columns</h5>
                                <div className="retro-template-tooltip__columns">
                                  {template.columns.filter((col: any) => col.isMain !== false).map((col: any) => (
                                    <div key={col.key} className="retro-template-tooltip__column">
                                      <strong>{col.title}</strong>
                                      <span>{col.description}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {template.columns.some((col: any) => col.isMain === false) && (
                                <div className="retro-template-tooltip__section">
                                  <h5 className="retro-template-tooltip__section-title">Side Panel</h5>
                                  <div className="retro-template-tooltip__columns">
                                    {template.columns.filter((col: any) => col.isMain === false).map((col: any) => (
                                      <div key={col.key} className="retro-template-tooltip__column retro-template-tooltip__column--side">
                                        <strong>{col.title}</strong>
                                        <span>{col.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Retention Selection */}
              <div className="retro-retention-selector">
                <h3 className="retro-retention-selector__title">Expires in</h3>
                <div className="retro-retention-selector__options">
                  {[
                    { days: 1, label: "1 day" },
                    { days: 5, label: "5 days" },
                    { days: 7, label: "7 days" },
                    { days: 30, label: "30 days" },
                  ].map((option) => (
                    <button
                      key={option.days}
                      type="button"
                      className={`retro-retention-selector__option ${retentionDays === option.days ? 'selected' : ''}`}
                      onClick={() => setRetentionDays(option.days)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="retro-nickname-form__submit"
                onClick={handleCreateRetro}
                disabled={loading || !nickname.trim() || loadingTemplates}
              >
                {loading ? "Creating..." : "Create Retro 🚀"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateRetro;
