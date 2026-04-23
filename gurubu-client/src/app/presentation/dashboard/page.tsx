"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getPresentationHistory, removePresentationFromHistory, savePresentationToHistory, PresentationHistoryItem } from "@/shared/helpers/lobbyStorage";
import { PresentationService } from "@/services/presentationService";
import { IconPlus, IconTrash, IconClock, IconPlayerPlay, IconArrowLeft, IconSlideshow, IconSearch, IconMoodEmpty } from "@tabler/icons-react";
import "@/styles/room/presentation-board/presentation-dashboard.scss";

const TEMPLATE_COLORS: Record<string, { gradient: string; accent: string; icon: string }> = {
  'blank': { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea', icon: '📄' },
  'business': { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#f5576c', icon: '💼' },
  'technical': { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#4facfe', icon: '💻' },
  'educational': { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#43e97b', icon: '📚' },
  'default': { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea', icon: '📊' },
};

const getTemplateStyle = (templateId?: string) => {
  return TEMPLATE_COLORS[templateId || 'default'] || TEMPLATE_COLORS['default'];
};

const PresentationDashboard = () => {
  const router = useRouter();
  const [history, setHistory] = useState<PresentationHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [retentionDays, setRetentionDays] = useState(5);
  const [isPermanent, setIsPermanent] = useState(false);
  const [creating, setCreating] = useState(false);

  const presentationService = new PresentationService(process.env.NEXT_PUBLIC_API_URL || "");

  useEffect(() => {
    setMounted(true);
    const savedNickname = localStorage.getItem("presentationNickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }

    const items = getPresentationHistory();
    setHistory(items);

    // Fetch templates
    const fetchTemplates = async () => {
      const fetchedTemplates = await presentationService.getTemplates();
      setTemplates(fetchedTemplates);
      setLoadingTemplates(false);
    };

    fetchTemplates();

    // Validate which presentations still exist on the server
    const validatePresentations = async () => {
      if (items.length === 0) {
        setValidating(false);
        return;
      }

      try {
        const result = await presentationService.checkPresentationBatch(items.map(i => i.presentationId));
        
        // Mark non-existent presentations
        const validated = items.map(item => ({
          ...item,
          _exists: result.existingIds.includes(item.presentationId),
        }));
        setHistory(validated as any);
      } catch {
        // If validation fails, just show all items
      } finally {
        setValidating(false);
      }
    };

    validatePresentations();
  }, []);

  const handleRemove = (presentationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingId(presentationId);
    setTimeout(() => {
      removePresentationFromHistory(presentationId);
      setHistory(prev => prev.filter(item => item.presentationId !== presentationId));
      setRemovingId(null);
    }, 300);
  };

  const handleCreatePresentation = async () => {
    if (!nickname.trim() || creating) return;

    setCreating(true);
    const trimmedNickName = nickname.trim();

    localStorage.setItem("presentationNickname", trimmedNickName);

    const payload = {
      nickName: trimmedNickName,
      title: title.trim() || "My Presentation",
      templateId: selectedTemplate,
      retentionDays: isPermanent ? null : retentionDays,
      isPermanent,
    };

    const response = await presentationService.createPresentation(payload);

    if (!response) {
      setCreating(false);
      return;
    }

    let lobby = JSON.parse(localStorage.getItem("presentationLobby") || "{}");

    if (!Object.keys(lobby).length) {
      const lobbyContent = {
        state: {
          presentations: {
            [response.presentationId]: response,
          },
        },
      };
      lobby = lobbyContent;
      localStorage.setItem("presentationLobby", JSON.stringify(lobbyContent));
    }

    if (!lobby.state) {
      lobby.state = {};
    }
    if (!lobby.state.presentations) {
      lobby.state.presentations = {};
    }

    lobby.state.presentations[response.presentationId] = response;
    localStorage.setItem("presentationLobby", JSON.stringify(lobby));

    savePresentationToHistory(response.presentationId, title.trim() || "My Presentation", selectedTemplate, false);

    router.push(`/presentation/${response.presentationId}`);
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    return history.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  if (!mounted) return null;

  return (
    <main className="presentation-dashboard">
      {/* Animated background */}
      <div className="presentation-dashboard__bg">
        <div className="presentation-dashboard__bg-orb presentation-dashboard__bg-orb--1" />
        <div className="presentation-dashboard__bg-orb presentation-dashboard__bg-orb--2" />
        <div className="presentation-dashboard__bg-orb presentation-dashboard__bg-orb--3" />
      </div>

      <div className="presentation-dashboard__wrapper">
        {/* Top navigation */}
        <nav className="presentation-dashboard__nav">
          <button
            className="presentation-dashboard__nav-back"
            onClick={() => router.push('/')}
          >
            <IconArrowLeft size={18} />
            <span>Home</span>
          </button>
          <div className="presentation-dashboard__nav-brand">
            <IconSlideshow size={20} />
            <span>Presentation Hub</span>
          </div>
        </nav>

        {/* Header section */}
        <header className="presentation-dashboard__hero">
          <div className="presentation-dashboard__hero-text">
            <h1>My Presentations</h1>
            <p>Create interactive presentations with code, animations, and rich media</p>
          </div>
          <button
            className="presentation-dashboard__new-btn"
            onClick={() => setShowTemplateModal(true)}
          >
            <IconPlus size={20} />
            <span>New Presentation</span>
          </button>
        </header>

        {/* Search bar */}
        {history.length > 3 && (
          <div className="presentation-dashboard__search">
            <IconSearch size={18} className="presentation-dashboard__search-icon" />
            <input
              type="text"
              placeholder="Search presentations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="presentation-dashboard__search-input"
            />
          </div>
        )}

        {/* Stats bar */}
        <div className="presentation-dashboard__stats">
          <div className="presentation-dashboard__stat">
            <span className="presentation-dashboard__stat-value">{history.length}</span>
            <span className="presentation-dashboard__stat-label">Total</span>
          </div>
          <div className="presentation-dashboard__stat">
            <span className="presentation-dashboard__stat-value">
              {history.filter(i => i.started).length}
            </span>
            <span className="presentation-dashboard__stat-label">Started</span>
          </div>
        </div>

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="presentation-dashboard__modal-overlay" onClick={() => setShowTemplateModal(false)}>
            <div className="presentation-dashboard__modal" onClick={(e) => e.stopPropagation()}>
              <div className="presentation-dashboard__modal-header">
                <h2>Create New Presentation</h2>
                <button onClick={() => setShowTemplateModal(false)}>×</button>
              </div>

              <div className="presentation-dashboard__modal-content">
                <div className="presentation-dashboard__form-group">
                  <label>Your Nickname</label>
                  <input
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => {
                      if (e.target.value.length < 17) {
                        setNickname(e.target.value.trim());
                      }
                    }}
                    maxLength={16}
                  />
                </div>

                <div className="presentation-dashboard__form-group">
                  <label>Presentation Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="My Presentation"
                    value={title}
                    onChange={(e) => {
                      if (e.target.value.length < 51) {
                        setTitle(e.target.value);
                      }
                    }}
                    maxLength={50}
                  />
                </div>

                <div className="presentation-dashboard__form-group">
                  <label>Choose Template</label>
                  {loadingTemplates ? (
                    <div>Loading templates...</div>
                  ) : (
                    <div className="presentation-dashboard__template-gallery">
                      {templates.map((template) => {
                        const style = getTemplateStyle(template.id);
                        const category = template.category || 'General';
                        return (
                          <div
                            key={template.id}
                            className={`presentation-dashboard__template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                            onClick={() => setSelectedTemplate(template.id)}
                            style={{ borderColor: selectedTemplate === template.id ? style.accent : 'transparent' }}
                          >
                            <div 
                              className="presentation-dashboard__template-preview"
                              style={{ background: style.gradient }}
                            >
                              <div className="presentation-dashboard__template-preview-content">
                                <div className="presentation-dashboard__template-preview-icon">{template.icon}</div>
                                {template.popular && (
                                  <div className="presentation-dashboard__template-badge">Popular</div>
                                )}
                              </div>
                            </div>
                            <div className="presentation-dashboard__template-info">
                              <div className="presentation-dashboard__template-name">{template.name}</div>
                              <div className="presentation-dashboard__template-category">{category}</div>
                              <div className="presentation-dashboard__template-description">{template.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="presentation-dashboard__form-group">
                  <label>Storage</label>
                  <div className="presentation-dashboard__storage-options">
                    <button
                      type="button"
                      className={isPermanent ? 'active' : ''}
                      onClick={() => setIsPermanent(true)}
                    >
                      Permanent
                    </button>
                    <button
                      type="button"
                      className={!isPermanent ? 'active' : ''}
                      onClick={() => setIsPermanent(false)}
                    >
                      Temporary
                    </button>
                  </div>
                  {!isPermanent && (
                    <div className="presentation-dashboard__retention-options">
                      {[1, 5, 7, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          className={retentionDays === days ? 'active' : ''}
                          onClick={() => setRetentionDays(days)}
                        >
                          {days} day{days > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="presentation-dashboard__create-btn"
                  onClick={handleCreatePresentation}
                  disabled={!nickname.trim() || creating || loadingTemplates}
                >
                  {creating ? "Creating..." : "Create Presentation 🚀"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Presentations grid */}
        {validating ? (
          <div className="presentation-dashboard__loading">Loading...</div>
        ) : filteredHistory.length === 0 && !searchQuery ? (
          <div className="presentation-dashboard__empty">
            <IconSlideshow size={64} strokeWidth={1.5} />
            <h2>No presentations yet</h2>
            <p>Create your first interactive presentation to get started</p>
            <button
              className="presentation-dashboard__empty-btn"
              onClick={() => setShowTemplateModal(true)}
            >
              <IconPlus size={20} />
              Create Presentation
            </button>
          </div>
        ) : filteredHistory.length === 0 && searchQuery ? (
          <div className="presentation-dashboard__no-results">
            <IconMoodEmpty size={48} strokeWidth={1.5} />
            <p>No presentations match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <div className="presentation-dashboard__grid">
            {filteredHistory.map((item: any, index: number) => {
              const style = getTemplateStyle(item.templateId);
              const isExpired = !validating && item._exists === false;
              return (
                <div
                  key={item.presentationId}
                  className={`presentation-dashboard__card ${removingId === item.presentationId ? 'presentation-dashboard__card--removing' : ''} ${isExpired ? 'presentation-dashboard__card--expired' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => {
                    if (!isExpired) {
                      router.push(`/presentation/${item.presentationId}`);
                    }
                  }}
                >
                  <div
                    className="presentation-dashboard__card-accent"
                    style={{ background: isExpired ? '#4b5563' : style.gradient }}
                  />

                  <div className="presentation-dashboard__card-body">
                    <div className="presentation-dashboard__card-header">
                      <div className="presentation-dashboard__card-icon">{style.icon}</div>
                      <button
                        className="presentation-dashboard__card-delete"
                        onClick={(e) => handleRemove(item.presentationId, e)}
                        title="Remove from history"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    <h3 className="presentation-dashboard__card-title">{item.title}</h3>

                    <div className="presentation-dashboard__card-meta">
                      <div className="presentation-dashboard__card-meta-item">
                        <IconClock size={14} />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {isExpired && (
                      <div className="presentation-dashboard__card-expired">
                        <span>Expired</span>
                      </div>
                    )}

                    {!isExpired && (
                      <button
                        className="presentation-dashboard__card-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/presentation/${item.presentationId}`);
                        }}
                      >
                        <IconPlayerPlay size={16} />
                        <span>{item.started ? 'Continue' : 'Start'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default PresentationDashboard;
