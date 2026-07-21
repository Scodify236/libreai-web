'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';

import {
  AppSettings,
  ChatMessage,
  ChatThread,
  DEFAULT_SETTINGS,
  clearAllData,
  isOnboardingComplete,
  loadSettings,
  loadThreads,
  saveSettings,
  saveThreads,
  setOnboardingComplete,
} from '@/lib/storage';
import { getModelById, isVisionModel, textModels } from '@/lib/models';
import HistorySidebar from '@/components/HistorySidebar';
import SettingsModal from '@/components/SettingsModal';
import OnboardingModal from '@/components/OnboardingModal';
import styles from './web.module.css';

export default function WebChatApp() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial setup & loading from localStorage
  useEffect(() => {
    const onboarded = isOnboardingComplete();
    const loadedSets = loadSettings();
    const loadedThrs = loadThreads();

    setSettings(loadedSets);
    setThreads(loadedThrs);

    // Apply saved theme mode to html data-theme
    applyThemeMode(loadedSets.themeMode);

    if (!onboarded || !loadedSets.cfAccountId || !loadedSets.cfApiToken) {
      setShowOnboarding(true);
    }

    if (loadedThrs.length > 0) {
      setActiveThreadId(loadedThrs[0].id);
    }
  }, []);

  const applyThemeMode = (mode: string) => {
    const root = document.documentElement;
    if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isSystemDark ? 'dark' : 'light');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threads, activeThreadId, isGenerating]);

  // Current Thread
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const currentTextModel = getModelById(settings.selectedTextModel);
  const isCurrentModelVision = isVisionModel(settings.selectedTextModel);

  // Save changes helper
  const updateAndSaveThreads = (newThreads: ChatThread[]) => {
    setThreads(newThreads);
    saveThreads(newThreads);
  };

  const handleOnboardingComplete = (data: { userName: string; cfAccountId: string; cfApiToken: string }) => {
    const updated = {
      ...settings,
      userName: data.userName || settings.userName,
      cfAccountId: data.cfAccountId || settings.cfAccountId,
      cfApiToken: data.cfApiToken || settings.cfApiToken,
    };
    setSettings(updated);
    saveSettings(updated);
    setOnboardingComplete();
    setShowOnboarding(false);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    applyThemeMode(newSettings.themeMode);
  };

  const handleClearAllData = () => {
    clearAllData();
    setSettings(DEFAULT_SETTINGS);
    setThreads([]);
    setActiveThreadId(null);
    setShowSettings(false);
    setShowOnboarding(true);
  };

  const handleNewThread = () => {
    setActiveThreadId(null);
    setInputMessage('');
    setAttachedImageBase64(null);
  };

  const handleDeleteThread = (threadId: string) => {
    const filtered = threads.filter((t) => t.id !== threadId);
    updateAndSaveThreads(filtered);
    if (activeThreadId === threadId) {
      setActiveThreadId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  // Attach Image File
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCurrentModelVision) {
      setImageError(`Selected model (${currentTextModel?.name || 'current model'}) is text-only. Switch to a vision model like Kimi K2.7 or Llama 3.2 Vision in the top bar to analyze images.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Attach Image via URL
  const handleImageUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImageError(null);
    const url = imageUrlInput.trim();
    if (!url) return;

    if (!isCurrentModelVision) {
      setImageError(`Selected model (${currentTextModel?.name || 'current model'}) is text-only. Switch to a vision model like Kimi K2.7 or Llama 3.2 Vision in the top bar to analyze images.`);
      setShowUrlModal(false);
      return;
    }

    setAttachedImageBase64(url);
    setImageUrlInput('');
    setShowUrlModal(false);
  };

  // Send Message Logic
  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !attachedImageBase64) || isGenerating) return;

    if (!settings.cfAccountId || !settings.cfApiToken) {
      setShowOnboarding(true);
      return;
    }

    const userText = inputMessage.trim();
    const userImage = attachedImageBase64;

    setInputMessage('');
    setAttachedImageBase64(null);
    setImageError(null);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userText,
      imageBase64: userImage || undefined,
      timestamp: Date.now(),
    };

    let targetThreadId = activeThreadId;
    let currentThreads = [...threads];

    if (!targetThreadId) {
      const newThread: ChatThread = {
        id: uuidv4(),
        title: userText.slice(0, 25) || 'Image Analysis',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage],
      };
      currentThreads = [newThread, ...currentThreads];
      targetThreadId = newThread.id;
      setActiveThreadId(targetThreadId);
    } else {
      currentThreads = currentThreads.map((t) =>
        t.id === targetThreadId
          ? { ...t, updatedAt: Date.now(), messages: [...t.messages, userMessage] }
          : t
      );
    }

    updateAndSaveThreads(currentThreads);
    setIsGenerating(true);

    const assistantMessageId = uuidv4();
    let assistantContent = '';

    const activeMsgList = currentThreads.find((t) => t.id === targetThreadId)?.messages || [];

    const formattedMessages = activeMsgList.map((m) => {
      if (m.imageBase64) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content || 'Please analyze this image.' },
            { type: 'image_url', image_url: { url: m.imageBase64 } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    formattedMessages.unshift({
      role: 'system',
      content: settings.systemPrompt,
    });

    // Direct User Image Generation Tag Detection (e.g. user typed or submitted [GENERATE_IMAGE: ...])
    const directTagMatch = userText.match(/\[GENERATE_IMAGE:\s*(.*?)\]/i);
    if (directTagMatch && directTagMatch[1]) {
      const imagePrompt = directTagMatch[1].trim();
      triggerImageGenModel(targetThreadId, assistantMessageId, imagePrompt);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: settings.cfAccountId,
          apiToken: settings.cfApiToken,
          model: settings.selectedTextModel,
          messages: formattedMessages,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const jsonRes = await response.json();
        if (jsonRes.type === 'image') {
          const finalImageMsg: ChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: 'Here is your generated image:',
            generatedImageBase64: `data:image/png;base64,${jsonRes.data}`,
            timestamp: Date.now(),
          };

          const updatedWithImg = currentThreads.map((t) =>
            t.id === targetThreadId
              ? { ...t, updatedAt: Date.now(), messages: [...t.messages, finalImageMsg] }
              : t
          );
          updateAndSaveThreads(updatedWithImg);
          setIsGenerating(false);
          return;
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('No stream reader available');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              const chunk =
                parsed.response ||
                parsed.response_text ||
                parsed.choices?.[0]?.delta?.content ||
                (parsed.choices?.[0]?.delta?.reasoning_content ? '' : '');

              assistantContent += chunk;

              // Detect any image generation tool invocation in stream (tag, function call, or json)
              const imgTriggerMatch = assistantContent.match(/(?:\[GENERATE_IMAGE:\s*|generate_image\s*[:(]\s*|"?prompt"?\s*:\s*")(.*?)(?:\]|\)|"|\n|$)/i);
              if (imgTriggerMatch && imgTriggerMatch[1] && imgTriggerMatch[1].trim().length > 3) {
                const imagePrompt = imgTriggerMatch[1].trim();
                triggerImageGenModel(targetThreadId, assistantMessageId, imagePrompt);
              }

              // Strip all tool name references, JSON tool tags, and raw prompt calls from display text
              const displayContent = assistantContent
                .replace(/\[GENERATE_IMAGE:\s*.*?\]/gi, '')
                .replace(/generate_image\s*\([^)]*\)/gi, '')
                .replace(/\{\s*"name"\s*:\s*"generate_image".*?\}/gi, '')
                .trim();

              const streamingMsg: ChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: displayContent,
                modelName: currentTextModel?.name || 'LibreAI Assistant',
                isGeneratingImage: imageTriggeredRef.current[`${targetThreadId}_${assistantMessageId}`] || false,
                timestamp: Date.now(),
              };

              setThreads((prevThreads) => {
                const updatedThreads = prevThreads.map((t) => {
                  if (t.id !== targetThreadId) return t;
                  const existingMsgs = t.messages.filter((m) => m.id !== assistantMessageId);
                  return { ...t, messages: [...existingMsgs, streamingMsg] };
                });
                saveThreads(updatedThreads);
                return updatedThreads;
              });
            } catch {}
          }
        }
      }

      const cleanFinalContent = assistantContent
        .replace(/\[GENERATE_IMAGE:\s*.*?\]/gi, '')
        .replace(/generate_image\s*\([^)]*\)/gi, '')
        .replace(/\{\s*"name"\s*:\s*"generate_image".*?\}/gi, '')
        .trim();

      const finalMsg: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: cleanFinalContent,
        modelName: currentTextModel?.name || 'LibreAI Assistant',
        isGeneratingImage: imageTriggeredRef.current[`${targetThreadId}_${assistantMessageId}`] || false,
        timestamp: Date.now(),
      };
      setThreads((prevThreads) => {
        const finalThreads = prevThreads.map((t) => {
          if (t.id !== targetThreadId) return t;
          const existingMsgs = t.messages.filter((m) => m.id !== assistantMessageId);
          return { ...t, messages: [...existingMsgs, finalMsg] };
        });
        saveThreads(finalThreads);
        return finalThreads;
      });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: err?.message || 'An unexpected error occurred while processing your request.',
        timestamp: Date.now(),
      };
      setThreads((prevThreads) => {
        const updated = prevThreads.map((t) =>
          t.id === targetThreadId
            ? { ...t, messages: [...t.messages.filter((m) => m.id !== assistantMessageId), errorMsg] }
            : t
        );
        saveThreads(updated);
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const imageTriggeredRef = useRef<Record<string, boolean>>({});

  const triggerImageGenModel = async (threadId: string, messageId: string, imagePrompt: string) => {
    // Prevent duplicate 4x parallel image requests
    const triggerKey = `${threadId}_${messageId}`;
    if (imageTriggeredRef.current[triggerKey]) return;
    imageTriggeredRef.current[triggerKey] = true;

    // Detect aspect ratio from image prompt keywords (e.g. 16:9, 9:16, 4:3, 21:9, 1:1, widescreen, portrait, banner)
    let detectedAspectRatio = '1 / 1';
    if (/16:9|widescreen|banner|cinematic/i.test(imagePrompt)) {
      detectedAspectRatio = '16 / 9';
    } else if (/9:16|portrait|vertical|story/i.test(imagePrompt)) {
      detectedAspectRatio = '9 / 16';
    } else if (/4:3/i.test(imagePrompt)) {
      detectedAspectRatio = '4 / 3';
    } else if (/21:9|ultrawide/i.test(imagePrompt)) {
      detectedAspectRatio = '21 / 9';
    }

    // Show image generation skeleton loader container
    setThreads((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          messages: t.messages.map((m) =>
            m.id === messageId
              ? { ...m, isGeneratingImage: true, imageAspectRatio: detectedAspectRatio }
              : m
          ),
        };
      });
      saveThreads(updated);
      return updated;
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: settings.cfAccountId,
          apiToken: settings.cfApiToken,
          model: settings.selectedImageModel,
          messages: [{ role: 'user', content: imagePrompt }],
        }),
      });

      if (!res.ok) {
        setThreads((prev) => {
          const updated = prev.map((t) => {
            if (t.id !== threadId) return t;
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === messageId ? { ...m, isGeneratingImage: false } : m
              ),
            };
          });
          saveThreads(updated);
          return updated;
        });
        return;
      }

      const json = await res.json();
      if (json.type === 'image') {
        setThreads((prev) => {
          const updated = prev.map((t) => {
            if (t.id !== threadId) return t;
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      isGeneratingImage: false,
                      generatedImageBase64: `data:image/png;base64,${json.data}`,
                    }
                  : m
              ),
            };
          });
          saveThreads(updated);
          return updated;
        });
      }
    } catch {
      setThreads((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === messageId ? { ...m, isGeneratingImage: false } : m
            ),
          };
        });
        saveThreads(updated);
        return updated;
      });
    }
  };

  return (
    <div className={styles.appContainer}>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
          onRestoreDefaults={() => {
            setSettings(DEFAULT_SETTINGS);
            saveSettings(DEFAULT_SETTINGS);
          }}
          onClearAllData={handleClearAllData}
        />
      )}

      <HistorySidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => setActiveThreadId(id)}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
        onOpenSettings={() => setShowSettings(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className={styles.mainArea}>
        {/* Top Navigation Bar */}
        <header className={styles.topBar}>
          {/* Left: sidebar toggle + new thread */}
          <div className={styles.topLeft}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={styles.topIconBtn} title="Toggle History">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
            <button onClick={handleNewThread} className={styles.topIconBtn} title="New Thread">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Center: wordmark + model chip */}
          <div className={styles.topCenter}>
            <span className={styles.topWordmark}>
              <span className={styles.topWordmarkLibre}>Libre</span>
              <span className={styles.topWordmarkAI}>AI</span>
            </span>
            <div className={styles.activeModelChip}>
              <span className={styles.modelDot} />
              <span className={styles.activeModelName}>{currentTextModel?.name}</span>
              {isCurrentModelVision && <span className={styles.visionTag}>Vision</span>}
            </div>
          </div>

          {/* Right: theme toggle + settings */}
          <div className={styles.topRight}>
            <button
              className={styles.topIconBtn}
              title="Toggle Theme"
              onClick={() => {
                const newMode: 'system' | 'light' | 'dark' = settings.themeMode === 'dark' ? 'light' : 'dark';
                const updated = { ...settings, themeMode: newMode };
                setSettings(updated);
                saveSettings(updated);
                applyThemeMode(newMode);
              }}
            >
              {settings.themeMode === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button onClick={() => setShowSettings(true)} className={styles.topIconBtn} title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className={styles.workspaceBody}>
          {!activeThread || activeThread.messages.length === 0 ? (
            <div className={styles.emptyWorkspace}>
              <div className={styles.emptyLogoWrapper}>
                <Image src="/logo.png" alt="LibreAI Logo" width={56} height={56} className={styles.emptyLogo} />
              </div>
              <h2 className={styles.emptyTitle}>LibreAI Workspace</h2>
              <p className={styles.emptySubtitle}>
                Active model: <strong>{currentTextModel?.name}</strong>{' '}
                {isCurrentModelVision && <span className={styles.visionBadge}>[Vision Enabled]</span>}
              </p>

              <div className={styles.suggestionGrid}>
                <button
                  onClick={() => setInputMessage('Write a high-performance Python script to solve the N-Queens problem.')}
                  className={styles.suggestionCard}
                >
                  <span className={styles.suggestionLabel}>CODE</span>
                  <span>Write a Python N-Queens solver</span>
                </button>

                <button
                  onClick={() => setInputMessage('Explain quantum computing principles in simple terms.')}
                  className={styles.suggestionCard}
                >
                  <span className={styles.suggestionLabel}>EXPLAIN</span>
                  <span>Explain quantum computing principles</span>
                </button>

                <button
                  onClick={() => setInputMessage('Draw a futuristic cyberpunk neon city at night.')}
                  className={styles.suggestionCard}
                >
                  <span className={styles.suggestionLabel}>IMAGE</span>
                  <span>Generate cyberpunk city artwork</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.messageList}>
              {activeThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.assistantRow}`}
                >
                  <div className={styles.messageBubble}>
                    {msg.role === 'assistant' && (
                      <div className={styles.assistantHeader}>
                        <span className={styles.modelTag}>{msg.modelName || currentTextModel?.name}</span>
                      </div>
                    )}

                    {msg.imageBase64 && (
                      <div className={styles.msgImageContainer}>
                        <img src={msg.imageBase64} alt="User Attachment" className={styles.msgImage} />
                      </div>
                    )}

                    {msg.isGeneratingImage && (
                      <div
                        className={styles.imageSkeletonContainer}
                        style={{ aspectRatio: msg.imageAspectRatio || '1 / 1' }}
                      >
                        <div className={styles.imageSkeletonBadge}>
                          Generating image...
                        </div>
                        <div className={styles.imageSkeletonLoader}>
                          <div className={styles.dotsVertical}>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.generatedImageBase64 && (
                      <div
                        className={styles.msgImageContainer}
                        style={{ aspectRatio: msg.imageAspectRatio || '1 / 1' }}
                      >
                        <img src={msg.generatedImageBase64} alt="AI Generated" className={styles.msgImage} />
                      </div>
                    )}

                    {msg.content && msg.content.trim().length > 0 && (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className={`${styles.messageRow} ${styles.assistantRow}`}>
                  <div className={styles.messageBubble}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className={styles.inputBarContainer}>
          {imageError && <div className={styles.imageErrorBanner}>{imageError}</div>}

          {attachedImageBase64 && (
            <div className={styles.attachedPreview}>
              <img src={attachedImageBase64} alt="Attachment" />
              <button onClick={() => setAttachedImageBase64(null)} className={styles.removeAttachBtn}>&times;</button>
            </div>
          )}

          <div className={styles.inputBox}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
            />

            <div className={styles.attachButtonGroup}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${styles.attachBtn} ${attachedImageBase64 ? styles.attachBtnActive : ''}`}
                title={isCurrentModelVision ? 'Upload Image File' : 'Select a vision model to attach images'}
              >
                Upload File
              </button>

              <button
                onClick={() => {
                  if (!isCurrentModelVision) {
                    setImageError(`Selected model (${currentTextModel?.name || 'current model'}) is text-only. Switch to a vision model like Kimi K2.7 or Llama 3.2 Vision in the top bar to analyze images.`);
                    return;
                  }
                  setShowUrlModal(true);
                }}
                className={styles.attachBtn}
                title="Paste Image URL"
              >
                Image URL
              </button>
            </div>

            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isCurrentModelVision
                  ? 'Message LibreAI (Vision enabled)...'
                  : 'Message LibreAI...'
              }
              className={styles.textInput}
            />

            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !attachedImageBase64) || isGenerating}
              className={styles.sendBtn}
            >
              Send
            </button>
          </div>

          <div className={styles.inputFooterText}>
            Cloudflare Workers AI • 100% Local Storage • Zero Telemetry
          </div>
        </div>

        {/* Image URL Modal */}
        {showUrlModal && (
          <div className={styles.urlModalOverlay} onClick={() => setShowUrlModal(false)}>
            <div className={styles.urlModal} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.urlModalTitle}>Attach Image via URL</h3>
              <p className={styles.urlModalSubtitle}>Paste a public direct link to an image (HTTP/HTTPS) for vision analysis.</p>
              <form onSubmit={handleImageUrlSubmit} className={styles.urlForm}>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className={styles.urlInput}
                  autoFocus
                  required
                />
                <div className={styles.urlModalActions}>
                  <button type="button" onClick={() => setShowUrlModal(false)} className={styles.cancelUrlBtn}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitUrlBtn}>
                    Attach Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
