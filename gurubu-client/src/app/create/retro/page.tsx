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

  // Custom template state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customColumnCount, setCustomColumnCount] = useState(3);
  const [customColumnNames, setCustomColumnNames] = useState<string[]>(["", "", ""]);

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

  const handleCustomColumnCountChange = (count: number) => {
    setCustomColumnCount(count);
    setCustomColumnNames((prev) => {
      const next = [...prev];
      // Grow or shrink the array
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });
  };

  const handleCustomColumnNameChange = (index: number, value: string) => {
    setCustomColumnNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const isCustomValid = selectedTemplate !== "custom" || customColumnNames.every((n) => n.trim().length > 0);

  const handleCreateRetro = async () => {
    setLoading(true);

    const trimmedNickName = nickname.trim();
    if (trimmedNickName === "") {
      setLoading(false);
      return;
    }

    localStorage.setItem("retroNickname", trimmedNickName);

    const payload: any = {
      nickName: trimmedNickName,
      title: title.trim() || "Team Retrospective",
      templateId: selectedTemplate,
      retentionDays,
    };

    if (selectedTemplate === "custom") {
      payload.customColumns = customColumnNames.map((n) => n.trim());
    }

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
                  <>
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
                                  const tooltipHeight = 400;
                                  const viewportHeight = window.innerHeight;

                                  if (iconRect.bottom + tooltipHeight > viewportHeight) {
                                    tooltip.style.top = 'auto';
                                    tooltip.style.bottom = '0';
                                  } else {
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

                      {/* Custom Template Option */}
                      <div
                        className={`retro-template-item ${selectedTemplate === 'custom' ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedTemplate('custom');
                          setShowCustomModal(true);
                        }}
                      >
                        <div className="retro-template-item__main">
                          <span className="retro-template-item__icon">🛠️</span>
                          <span className="retro-template-item__name">Custom</span>
                          {selectedTemplate === 'custom' && (
                            <span className="retro-template-item__custom-summary">
                              {customColumnNames.filter(n => n.trim()).join(', ') || 'Click to configure'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  </>
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
                disabled={loading || !nickname.trim() || loadingTemplates || !isCustomValid}
              >
                {loading ? "Creating..." : "Create Retro 🚀"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Template Modal */}
      {showCustomModal && (
        <div className="retro-custom-modal__overlay" onClick={() => setShowCustomModal(false)}>
          <div className="retro-custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="retro-custom-modal__header">
              <h2 className="retro-custom-modal__title">🛠️ Custom Template</h2>
              <p className="retro-custom-modal__subtitle">Define your own retrospective columns</p>
            </div>

            <div className="retro-custom-modal__body">
              <div className="retro-custom-modal__section">
                <label className="retro-custom-modal__label">Number of columns</label>
                <div className="retro-custom-modal__count-buttons">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`retro-custom-modal__count-btn ${customColumnCount === n ? 'selected' : ''}`}
                      onClick={() => handleCustomColumnCountChange(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="retro-custom-modal__section">
                <label className="retro-custom-modal__label">Column names</label>
                <div className="retro-custom-modal__inputs">
                  {customColumnNames.map((name, index) => (
                    <input
                      key={index}
                      type="text"
                      className="retro-custom-modal__input"
                      placeholder={`Column ${index + 1}`}
                      value={name}
                      onChange={(e) => handleCustomColumnNameChange(index, e.target.value)}
                      maxLength={40}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="retro-custom-modal__note">
                  An &quot;Action Items&quot; side panel will be added automatically.
                </p>
              </div>
            </div>

            <div className="retro-custom-modal__footer">
              <button
                className="retro-custom-modal__btn retro-custom-modal__btn--cancel"
                onClick={() => {
                  setShowCustomModal(false);
                  setSelectedTemplate('what-went-well');
                }}
              >
                Cancel
              </button>
              <button
                className="retro-custom-modal__btn retro-custom-modal__btn--confirm"
                onClick={() => setShowCustomModal(false)}
                disabled={!customColumnNames.every((n) => n.trim().length > 0)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CreateRetro;
