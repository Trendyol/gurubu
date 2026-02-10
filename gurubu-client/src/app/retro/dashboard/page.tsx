"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getRetroHistory, removeRetroFromHistory, markRetroStarted, RetroHistoryItem } from "@/shared/helpers/lobbyStorage";
import { RetroService } from "@/services/retroService";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { IconPlus, IconTrash, IconClock, IconPlayerPlay, IconLogin, IconArrowLeft, IconLayoutColumns, IconSearch, IconMoodEmpty } from "@tabler/icons-react";
import "@/styles/room/retro-board/retro-dashboard.scss";

const TEMPLATE_COLORS: Record<string, { gradient: string; accent: string; icon: string }> = {
  'what-went-well': { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea', icon: '🚀' },
  'mad-sad-glad': { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#f5576c', icon: '🎭' },
  'start-stop-continue': { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#4facfe', icon: '🔄' },
  'liked-learned-lacked': { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#43e97b', icon: '📚' },
  'sailboat': { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accent: '#fa709a', icon: '⛵' },
  'four-ls': { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', accent: '#a18cd1', icon: '4️⃣' },
  'default': { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea', icon: '📋' },
};

const getTemplateStyle = (templateId?: string) => {
  return TEMPLATE_COLORS[templateId || 'default'] || TEMPLATE_COLORS['default'];
};

const RetroDashboard = () => {
  const router = useRouter();
  const [history, setHistory] = useState<RetroHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [retroParticipants, setRetroParticipants] = useState<Record<string, Array<{ nickname: string; avatarSeed: string; isAfk: boolean }>>>({});
  const [loadingRetroId, setLoadingRetroId] = useState<string | null>(null);

  const createAvatarSvg = useMemo(() => {
    const cache: Record<string, string> = {};
    return (seed: string) => {
      if (cache[seed]) return cache[seed];
      const avatar = createAvatar(avataaars, { seed, size: 32 });
      const svg = avatar.toString();
      cache[seed] = svg;
      return svg;
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const items = getRetroHistory();
    if (items.length === 0) {
      router.replace('/create/retro');
      return;
    }
    setHistory(items);

    // Validate which retros still exist on the server
    const validateRetros = async () => {
      try {
        const retroService = new RetroService(process.env.NEXT_PUBLIC_API_URL || "");
        const result = await retroService.checkRetroBatch(items.map(i => i.retroId));
        
        // Mark non-existent retros
        const validated = items.map(item => ({
          ...item,
          _exists: result.existingIds.includes(item.retroId),
        }));
        setHistory(validated as any);
        setRetroParticipants(result.participants);
      } catch {
        // If validation fails, just show all items
      } finally {
        setValidating(false);
      }
    };

    validateRetros();
  }, []);

  const handleRemove = (retroId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingId(retroId);
    setTimeout(() => {
      removeRetroFromHistory(retroId);
      // Preserve _exists state from previous validation
      setHistory(prev => prev.filter(item => item.retroId !== retroId));
      // Also clean up participants
      setRetroParticipants(prev => {
        const next = { ...prev };
        delete next[retroId];
        return next;
      });
      setRemovingId(null);
      // Check if no items left
      const remaining = getRetroHistory();
      if (remaining.length === 0) {
        router.replace('/create/retro');
      }
    }, 300);
  };

  const handleStartOrJoin = (item: RetroHistoryItem) => {
    setLoadingRetroId(item.retroId);
    markRetroStarted(item.retroId);
    router.push(`/retro/${item.retroId}`);
  };

  const formatDate = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTemplateName = (templateId?: string) => {
    if (!templateId) return 'Custom';
    return templateId.replaceAll('-', ' ').replaceAll(/\b\w/g, l => l.toUpperCase());
  };

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.templateId?.replaceAll('-', ' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <main className="retro-dashboard">
      {/* Animated background */}
      <div className="retro-dashboard__bg">
        <div className="retro-dashboard__bg-orb retro-dashboard__bg-orb--1" />
        <div className="retro-dashboard__bg-orb retro-dashboard__bg-orb--2" />
        <div className="retro-dashboard__bg-orb retro-dashboard__bg-orb--3" />
      </div>

      <div className="retro-dashboard__wrapper">
        {/* Top navigation */}
        <nav className="retro-dashboard__nav">
          <button
            className="retro-dashboard__nav-back"
            onClick={() => router.push('/')}
          >
            <IconArrowLeft size={18} />
            <span>Home</span>
          </button>
          <div className="retro-dashboard__nav-brand">
            <IconLayoutColumns size={20} />
            <span>Retro Hub</span>
          </div>
        </nav>

        {/* Header section */}
        <header className="retro-dashboard__hero">
          <div className="retro-dashboard__hero-text">
            <h1>My Retrospectives</h1>
            <p>Pick up where you left off or start something new</p>
          </div>
          <button
            className="retro-dashboard__new-btn"
            onClick={() => router.push('/create/retro')}
          >
            <IconPlus size={20} />
            <span>New Retro</span>
          </button>
        </header>

        {/* Search bar */}
        {history.length > 3 && (
          <div className="retro-dashboard__search">
            <IconSearch size={18} className="retro-dashboard__search-icon" />
            <input
              type="text"
              placeholder="Search retrospectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="retro-dashboard__search-input"
            />
          </div>
        )}

        {/* Stats bar */}
        <div className="retro-dashboard__stats">
          <div className="retro-dashboard__stat">
            <span className="retro-dashboard__stat-value">{history.length}</span>
            <span className="retro-dashboard__stat-label">Total</span>
          </div>
          <div className="retro-dashboard__stat">
            <span className="retro-dashboard__stat-value">{history.filter(h => h.started).length}</span>
            <span className="retro-dashboard__stat-label">Active</span>
          </div>
          <div className="retro-dashboard__stat">
            <span className="retro-dashboard__stat-value">{history.filter(h => !h.started).length}</span>
            <span className="retro-dashboard__stat-label">Pending</span>
          </div>
        </div>

        {/* Cards grid */}
        {filteredHistory.length === 0 && searchQuery ? (
          <div className="retro-dashboard__no-results">
            <IconMoodEmpty size={48} strokeWidth={1.5} />
            <p>No retrospectives match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <div className="retro-dashboard__grid">
            {filteredHistory.map((item: any, index: number) => {
              const style = getTemplateStyle(item.templateId);
              const isExpired = !validating && item._exists === false;
              return (
                <div
                  key={item.retroId}
                  className={`retro-dashboard__card ${removingId === item.retroId ? 'retro-dashboard__card--removing' : ''} ${isExpired ? 'retro-dashboard__card--expired' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Color accent bar */}
                  <div
                    className="retro-dashboard__card-accent"
                    style={{ background: isExpired ? '#4b5563' : style.gradient }}
                  />

                  <div className="retro-dashboard__card-body">
                    <div className="retro-dashboard__card-top">
                      <div className="retro-dashboard__card-icon" style={{ background: isExpired ? '#4b5563' : style.gradient }}>
                        {isExpired ? '⏰' : style.icon}
                      </div>
                      <div className="retro-dashboard__card-info">
                        <h3 className="retro-dashboard__card-title">{item.title}</h3>
                        <div className="retro-dashboard__card-meta">
                          <span className="retro-dashboard__card-template-badge" style={{ color: isExpired ? '#6b7280' : style.accent, backgroundColor: isExpired ? 'rgba(107,114,128,0.1)' : `${style.accent}15` }}>
                            {formatTemplateName(item.templateId)}
                          </span>
                          <span className="retro-dashboard__card-time">
                            <IconClock size={12} />
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="retro-dashboard__card-delete"
                        onClick={(e) => handleRemove(item.retroId, e)}
                        title="Remove"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>

                    {/* Active participants */}
                    {!isExpired && retroParticipants[item.retroId]?.length > 0 && (
                      <div className="retro-dashboard__card-participants">
                        <div className="retro-dashboard__card-avatars">
                          {retroParticipants[item.retroId].slice(0, 5).map((p, i) => (
                            <div
                              key={i}
                              className={`retro-dashboard__card-avatar ${p.isAfk ? 'retro-dashboard__card-avatar--afk' : ''}`}
                              title={p.nickname}
                              dangerouslySetInnerHTML={{ __html: createAvatarSvg(p.avatarSeed || p.nickname) }}
                            />
                          ))}
                          {retroParticipants[item.retroId].length > 5 && (
                            <div className="retro-dashboard__card-avatar retro-dashboard__card-avatar--more">
                              +{retroParticipants[item.retroId].length - 5}
                            </div>
                          )}
                        </div>
                        <span className="retro-dashboard__card-participants-label">
                          {retroParticipants[item.retroId].length} online
                        </span>
                      </div>
                    )}

                    <div className="retro-dashboard__card-actions">
                      {isExpired ? (
                        <span className="retro-dashboard__card-status retro-dashboard__card-status--expired">
                          Expired
                        </span>
                      ) : item.started ? (
                        <span className="retro-dashboard__card-status retro-dashboard__card-status--active">
                          <span className="retro-dashboard__card-status-dot" />
                          Active
                        </span>
                      ) : (
                        <span className="retro-dashboard__card-status retro-dashboard__card-status--pending">
                          Pending
                        </span>
                      )}
                      {isExpired ? (
                        <button
                          className="retro-dashboard__card-btn retro-dashboard__card-btn--remove"
                          onClick={(e) => handleRemove(item.retroId, e)}
                        >
                          <IconTrash size={16} />
                          Remove
                        </button>
                      ) : (
                        <button
                          className={`retro-dashboard__card-btn ${item.started ? 'retro-dashboard__card-btn--join' : 'retro-dashboard__card-btn--start'} ${loadingRetroId === item.retroId ? 'retro-dashboard__card-btn--loading' : ''}`}
                          onClick={() => handleStartOrJoin(item)}
                          disabled={loadingRetroId === item.retroId}
                        >
                          {loadingRetroId === item.retroId ? (
                            <>
                              <span className="retro-dashboard__spinner" />
                              Loading...
                            </>
                          ) : item.started ? (
                            <>
                              <IconLogin size={16} />
                              Join
                            </>
                          ) : (
                            <>
                              <IconPlayerPlay size={16} />
                              Start
                            </>
                          )}
                        </button>
                      )}
                    </div>
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

export default RetroDashboard;
