'use client';

import React, { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, ThemeMode } from '@/lib/storage';
import { availableModels, textModels, visionModels, imageGenModels, AIModel } from '@/lib/models';
import styles from './SettingsModal.module.css';

interface Props {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
  onRestoreDefaults: () => void;
  onClearAllData: () => void;
}

export default function SettingsModal({
  settings,
  onSave,
  onClose,
  onRestoreDefaults,
  onClearAllData,
}: Props) {
  const [accountId, setAccountId] = useState(settings.cfAccountId);
  const [apiToken, setApiToken] = useState(settings.cfApiToken);
  const [textModel, setTextModel] = useState(settings.selectedTextModel);
  const [imageModel, setImageModel] = useState(settings.selectedImageModel);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [themeMode, setThemeMode] = useState<ThemeMode>(settings.themeMode);
  const [obscureToken, setObscureToken] = useState(true);

  const handleSave = () => {
    onSave({
      ...settings,
      cfAccountId: accountId.trim(),
      cfApiToken: apiToken.trim(),
      selectedTextModel: textModel,
      selectedImageModel: imageModel,
      systemPrompt,
      themeMode,
    });
    onClose();
  };

  const renderModelGroup = (models: AIModel[], currentSelected: string, onSelect: (id: string) => void) => (
    <div className={styles.modelGroupList}>
      {models.map((m) => {
        const isSelected = m.id === currentSelected;
        return (
          <div
            key={m.id}
            className={`${styles.modelCard} ${isSelected ? styles.modelCardSelected : ''}`}
            onClick={() => onSelect(m.id)}
          >
            <div className={styles.modelRadio}>
              <div className={`${styles.radioDot} ${isSelected ? styles.radioDotActive : ''}`} />
            </div>
            <div className={styles.modelInfo}>
              <div className={styles.modelHeaderRow}>
                <span className={styles.modelName}>{m.name}</span>
                <span className={styles.modelProvider}>{m.provider}</span>
              </div>
              <p className={styles.modelDesc}>{m.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Modal Handle */}
        <div className={styles.dragHandle} />

        {/* Modal Header */}
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>Settings & AI Model Selection</h3>
          <button onClick={handleSave} className={styles.saveBtn}>
            Save
          </button>
        </div>

        {/* Scrollable Content mirroring SettingsModal.dart */}
        <div className={styles.body}>
          {/* Section 1: App Theme Mode */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>1. APP THEME MODE</div>
            <div className={styles.sectionDesc}>Choose Light, Dark, or System Auto Default theme.</div>
            <div className={styles.segmentedControl}>
              {(['auto', 'light', 'dark'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.segmentBtn} ${themeMode === mode ? styles.segmentBtnActive : ''}`}
                  onClick={() => setThemeMode(mode)}
                >
                  {mode === 'auto' ? 'Auto System' : mode === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: LLM Text & Vision Models */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>2. SELECT CHAT & REASONING MODEL (LLM)</div>
            <div className={styles.sectionDesc}>Pick 1 primary LLM model to handle all conversation & reasoning.</div>

            <div className={styles.subCategoryTitle}>Multimodal Vision Models</div>
            {renderModelGroup(visionModels, textModel, setTextModel)}

            <div className={styles.subCategoryTitle}>Text & Code Reasoning Models</div>
            {renderModelGroup(textModels, textModel, setTextModel)}
          </div>

          {/* Section 3: Image Generation Model */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>3. SELECT IMAGE GENERATION MODEL</div>
            <div className={styles.sectionDesc}>Pick 1 dedicated image model used whenever drawing or generating art.</div>
            {renderModelGroup(imageGenModels, imageModel, setImageModel)}
          </div>

          {/* Section 4: Cloudflare Credentials */}
          <div className={styles.section}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.sectionTitle}>4. CLOUDFLARE CREDENTIALS</div>
              <a
                href="https://www.youtube.com/watch?v=k1oGhb50qA4"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoLink}
              >
                Watch Setup Video Guide
              </a>
            </div>
            <div className={styles.sectionDesc}>
              Enter your Cloudflare Account ID and Workers AI API Token. Required to perform API requests.
            </div>

            <div className={styles.formFields}>
              <div className={styles.field}>
                <label>CLOUDFLARE ACCOUNT ID</label>
                <input
                  type="text"
                  placeholder="Paste your Account ID here"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>CLOUDFLARE API TOKEN</label>
                <div className={styles.inputWithSuffix}>
                  <input
                    type={obscureToken ? 'password' : 'text'}
                    placeholder="Paste your API Token here"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setObscureToken(!obscureToken)}
                    className={styles.suffixBtn}
                  >
                    {obscureToken ? 'SHOW' : 'HIDE'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: System Persona & Prompt */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>5. SYSTEM PERSONA & PROMPT</div>
            <div className={styles.sectionDesc}>Customize LibreAI&apos;s base instructions and behavioral persona.</div>
            <textarea
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className={styles.systemPromptTextarea}
            />
          </div>

          {/* Actions: Reset & Clear Data */}
          <div className={styles.actionSection}>
            <button
              type="button"
              onClick={() => {
                onRestoreDefaults();
                setSystemPrompt(DEFAULT_SETTINGS.systemPrompt);
                setTextModel(DEFAULT_SETTINGS.selectedTextModel);
                setImageModel(DEFAULT_SETTINGS.selectedImageModel);
              }}
              className={styles.restoreBtn}
            >
              Restore Default Settings
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all data and reset to onboarding?')) {
                  onClearAllData();
                }
              }}
              className={styles.clearAllBtn}
            >
              Clear Cache & Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
