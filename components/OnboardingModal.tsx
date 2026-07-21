'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './OnboardingModal.module.css';

interface Props {
  onComplete: (data: { userName: string; cfAccountId: string; cfApiToken: string }) => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [userName, setUserName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [obscureToken, setObscureToken] = useState(true);

  const handleFinish = () => {
    onComplete({
      userName: userName.trim(),
      cfAccountId: accountId.trim(),
      cfApiToken: apiToken.trim(),
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header Branding matching Flutter Onboarding Header */}
        <div className={styles.header}>
          <div className={styles.brandGroup}>
            <div className={styles.logoWrapper}>
              <Image src="/logo.png" alt="LibreAI" width={36} height={36} className={styles.logo} />
            </div>
            <div>
              <h2 className={styles.headerTitle}>LibreAI</h2>
              <p className={styles.headerBy}>Developed by CodErbauer</p>
            </div>
          </div>
          {currentPage < 2 && (
            <button onClick={handleFinish} className={styles.skipBtn}>
              Skip
            </button>
          )}
        </div>

        {/* Page Dots */}
        <div className={styles.dotsRow}>
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className={`${styles.dot} ${currentPage === idx ? styles.activeDot : ''}`}
            />
          ))}
        </div>

        {/* Slide 1: Welcome Overview */}
        {currentPage === 0 && (
          <div className={styles.slideBody}>
            <div className={styles.iconCircle}>
              <span className={styles.iconSymbol}>GEAR</span>
            </div>
            <h3 className={styles.slideTitle}>Welcome to LibreAI</h3>
            <p className={styles.slideSubtitle}>
              Unrestricted access to Cloudflare Workers AI. Run DeepSeek, Kimi K2.7, Llama 3.3, and Flux 2 Klein image generation seamlessly.
            </p>

            <a
              href="https://www.youtube.com/watch?v=k1oGhb50qA4"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.videoPill}
            >
              Watch Video Setup Guide
            </a>

            <div className={styles.authorBadge}>
              Created by CodErbauer
            </div>
          </div>
        )}

        {/* Slide 2: Privacy Guarantee */}
        {currentPage === 1 && (
          <div className={styles.slideBody}>
            <div className={styles.iconCircle}>
              <span className={styles.iconSymbol}>SHIELD</span>
            </div>
            <h3 className={styles.slideTitle}>Your Data Never Leaves<br />Your Device</h3>

            <div className={styles.featureList}>
              <div className={styles.featureRow}>
                <strong>100% Local Storage</strong>
                <p>Chat threads, API keys, and credentials are strictly saved on your local storage.</p>
              </div>
              <div className={styles.featureRow}>
                <strong>Zero Tracking or Telemetry</strong>
                <p>No middleman servers, no user analytics, and no third-party data tracking.</p>
              </div>
              <div className={styles.featureRow}>
                <strong>Direct API Connections</strong>
                <p>LibreAI communicates directly with Cloudflare Workers AI using your own keys.</p>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Personal Setup (Name & Optional Cloudflare Keys) */}
        {currentPage === 2 && (
          <div className={styles.slideBodyLeft}>
            <h3 className={styles.slideTitleCenter}>Personal Setup</h3>
            <p className={styles.slideSubtitleCenter}>
              Configure your profile & optional Cloudflare keys
            </p>

            <div className={styles.formGroup}>
              <div className={styles.field}>
                <label>YOUR NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Shashwat"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>CLOUDFLARE ACCOUNT ID (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="Paste your Account ID here"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>CLOUDFLARE API TOKEN (OPTIONAL)</label>
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

              <p className={styles.fieldNotice}>
                *(You can also set or change your keys anytime in Settings).*
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Button matching Flutter CupertinoButton */}
        <div className={styles.footer}>
          <button
            onClick={() => {
              if (currentPage < 2) {
                setCurrentPage(currentPage + 1);
              } else {
                handleFinish();
              }
            }}
            className={styles.continueBtn}
          >
            {currentPage === 2 ? 'Get Started' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
