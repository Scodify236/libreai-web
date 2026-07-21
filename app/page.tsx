'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loadSettings, saveSettings, ThemeMode } from '@/lib/storage';
import styles from './page.module.css';

export default function HomePage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');

  useEffect(() => {
    const settings = loadSettings();
    setThemeMode(settings.themeMode);
    applyThemeMode(settings.themeMode);
  }, []);

  const applyThemeMode = (mode: ThemeMode) => {
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

  const handleThemeChange = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    applyThemeMode(newMode);
    const settings = loadSettings();
    saveSettings({ ...settings, themeMode: newMode });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={styles.page}>
      {/* Top Navigation Bar */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <Image src="/logo.png" alt="LibreAI Logo" width={32} height={32} className={styles.logo} />
            <span className={styles.brandTitle}>LibreAI</span>
          </div>

          <nav className={styles.desktopNav}>
            <a href="#overview" className={styles.navLink}>Overview</a>
            <a href="#video-guide" className={styles.navLink}>Video Setup Guide</a>
            <a href="#models" className={styles.navLink}>Model Catalog</a>
          </nav>

          <div className={styles.headerRight}>
            {/* Theme Toggle Capsule */}
            <div className={styles.themeToggleCapsule}>
              {(['auto', 'dark', 'light'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.themeBtn} ${themeMode === mode ? styles.themeBtnActive : ''}`}
                  onClick={() => handleThemeChange(mode)}
                >
                  {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>

            <Link href="/web" className={styles.launchBtn}>
              Launch App
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.mobileMenuToggle}
              aria-label="Toggle menu"
            >
              Menu
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileDropdown}>
            <a href="#overview" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavLink}>
              Overview
            </a>
            <a href="#video-guide" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavLink}>
              Video Setup Guide
            </a>
            <a href="#models" onClick={() => setMobileMenuOpen(false)} className={styles.mobileNavLink}>
              Model Catalog
            </a>
            <div className={styles.mobileThemeRow}>
              <span>Theme:</span>
              {(['auto', 'dark', 'light'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.themeBtn} ${themeMode === mode ? styles.themeBtnActive : ''}`}
                  onClick={() => {
                    handleThemeChange(mode);
                    setMobileMenuOpen(false);
                  }}
                >
                  {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section styled like App Workspace Header */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot}></span>
            Cloudflare Workers AI Edge Infrastructure
          </div>

          <h1 className={styles.heroTitle}>
            Unrestricted Frontier AI.<br />
            <span className={styles.heroAccent}>Your Keys. Your Device.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            LibreAI is a privacy-first client built with Anthropic Dark Obsidian & Warm Cream design principles. Experience 100% on-device local data storage, custom system prompt personas, multimodal image vision analysis, and FLUX image generation.
          </p>

          <div className={styles.heroActions}>
            <Link href="/web" className="btn-primary">
              Launch Web App Workspace
            </Link>
            <a
              href="https://github.com/Shashwat-CODING/LibreAI/releases/tag/v1.0"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Download Native Releases (Android / macOS)
            </a>
          </div>

          {/* Code & App Preview Container styled like Chat Workspace */}
          <div className={styles.heroMockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <span className={styles.dotRed}></span>
                <span className={styles.dotYellow}></span>
                <span className={styles.dotGreen}></span>
              </div>
              <div className={styles.mockupTitle}>LibreAI Workspace — Live Preview</div>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupMessageUser}>
                <span>Analyze quantum computing principles and render a high-resolution visual artwork of a quantum processor.</span>
              </div>
              <div className={styles.mockupMessageAssistant}>
                <div className={styles.assistantBadge}>Kimi K2.7 Code • Moonshot AI</div>
                <p>Quantum computing leverages fundamental principles of quantum mechanics, specifically superposition and entanglement, to execute calculations exponentially faster than classical binary systems...</p>
                <div className={styles.mockupImageGen}>
                  <div className={styles.mockupImageTag}>[FLUX.2 Klein 4B] Generating Artwork Render...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Setup Guide Section */}
      <section id="video-guide" className={`${styles.section} ${styles.altBg}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Interactive Video Setup Guide</h2>
            <p className={styles.sectionSubtitle}>Watch the comprehensive walkthrough to configure your free Cloudflare Workers AI API credentials in under two minutes.</p>
          </div>

          <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/k1oGhb50qA4"
                title="LibreAI Setup Guide Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.videoIframe}
              ></iframe>
            </div>
            <div className={styles.videoMeta}>
              <h3>Setup Steps Covered in the Video:</h3>
              <ol className={styles.videoStepsList}>
                <li><strong>Creating a Cloudflare Account:</strong> Sign up free at dash.cloudflare.com to access your 10,000 free daily AI neurons.</li>
                <li><strong>Locating Account ID:</strong> Copy your unique Account ID from the Workers AI section.</li>
                <li><strong>Generating API Token:</strong> Navigate to User API Tokens and select the Workers AI Read/Write permission template.</li>
                <li><strong>Initializing LibreAI:</strong> Paste credentials into LibreAI settings. Your keys are immediately encrypted and stored locally in browser storage.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* App Architecture & Core Capabilities */}
      <section id="overview" className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Engineered for Full Autonomy</h2>
            <p className={styles.sectionSubtitle}>Detailed technical overview of LibreAI&apos;s client architecture and security design.</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHeaderTag}>SECURITY</div>
              <h3>100% Local Storage</h3>
              <p>All chat threads, custom system prompt personas, credentials, and settings are retained strictly in your local device storage. Zero external database dependencies.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeaderTag}>INFRASTRUCTURE</div>
              <h3>Cloudflare Workers AI Proxy</h3>
              <p>Direct integration with Cloudflare serverless edge infrastructure. Handles Server-Sent Events (SSE) streaming and image generation binary buffers seamlessly.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeaderTag}>MULTIMODAL</div>
              <h3>Vision & Image Analysis</h3>
              <p>Attach high-resolution images to chat prompts when utilizing vision-capable models such as Kimi K2.7 Code, Llama 4 Scout, or Llama 3.2 Vision.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeaderTag}>AESTHETICS</div>
              <h3>Anthropic Design Language</h3>
              <p>Crafted using Anthropic design principles with Dark Obsidian and Warm Cream themes, Newsreader serif display typography, and Terracotta Clay accents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Model Catalog Section */}
      <section id="models" className={`${styles.section} ${styles.altBg}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Supported Frontier Model Catalog</h2>
            <p className={styles.sectionSubtitle}>Complete breakdown of open models available out of the box in LibreAI.</p>
          </div>

          <div className={styles.modelTableWrapper}>
            <table className={styles.modelTable}>
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Provider</th>
                  <th>Category</th>
                  <th>Technical Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Kimi K2.7 Code</strong></td>
                  <td>Moonshot AI</td>
                  <td>Vision & Agentic Code</td>
                  <td>1 Trillion parameter frontier model supporting high-level reasoning, vision analysis, and complex code generation.</td>
                </tr>
                <tr>
                  <td><strong>Llama 4 Scout 17B</strong></td>
                  <td>Meta</td>
                  <td>Vision / Multimodal</td>
                  <td>Meta Llama 4 natively multimodal text and image understanding model.</td>
                </tr>
                <tr>
                  <td><strong>Llama 3.2 11B Vision</strong></td>
                  <td>Meta</td>
                  <td>Vision / Multimodal</td>
                  <td>Instruction-tuned vision model optimized for fast document parsing and image analysis.</td>
                </tr>
                <tr>
                  <td><strong>Mistral Small 3.1 24B</strong></td>
                  <td>Mistral AI</td>
                  <td>Vision / Multimodal</td>
                  <td>State-of-the-art vision understanding model with a massive 128k context window.</td>
                </tr>
                <tr>
                  <td><strong>Llama 3.3 70B</strong></td>
                  <td>Meta</td>
                  <td>Text & Reasoning</td>
                  <td>Meta flagship open-weights model. Industry benchmark for deep reasoning, math, and software engineering.</td>
                </tr>
                <tr>
                  <td><strong>DeepSeek R1 32B</strong></td>
                  <td>DeepSeek</td>
                  <td>Step-by-Step Thinking</td>
                  <td>Distilled Qwen model featuring transparent chain-of-thought step-by-step reasoning logs.</td>
                </tr>
                <tr>
                  <td><strong>FLUX.2 Klein 4B</strong></td>
                  <td>Black Forest Labs</td>
                  <td>Image Generation</td>
                  <td>Ultra-fast distilled text-to-image generator producing 1024x1024 renders.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerContainer}`}>
          <div>
            <div className={styles.brand}>
              <Image src="/logo.png" alt="LibreAI Logo" width={24} height={24} className={styles.logo} />
              <span className={styles.brandTitle}>LibreAI</span>
            </div>
            <p className={styles.footerText}>Developed by <strong>CodErbauer</strong>. Built for privacy, performance, and complete user control.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/web">Launch Web App</Link>
            <a href="https://github.com/Shashwat-CODING/LibreAI" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
            <a href="https://www.youtube.com/watch?v=k1oGhb50qA4" target="_blank" rel="noopener noreferrer">Video Guide</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
