'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatThread } from '@/lib/storage';
import styles from './HistorySidebar.module.css';

interface Props {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistorySidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onOpenSettings,
  isOpen,
  onClose,
}: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Top Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <Image src="/logo.png" alt="LibreAI" width={28} height={28} className={styles.logo} />
            <span className={styles.brandName}>LibreAI</span>
          </div>
          <button onClick={onNewThread} className={styles.newChatBtn} title="New Chat">
            + New Chat
          </button>
        </div>

        {/* Thread History List */}
        <div className={styles.threadList}>
          <div className={styles.listSectionTitle}>CONVERSATIONS</div>

          {threads.length === 0 ? (
            <div className={styles.emptyState}>No previous conversations</div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`${styles.threadItem} ${thread.id === activeThreadId ? styles.activeThread : ''}`}
                onClick={() => {
                  onSelectThread(thread.id);
                  onClose();
                }}
              >
                <span className={styles.threadTitle}>{thread.title}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this conversation thread?')) {
                      onDeleteThread(thread.id);
                    }
                  }}
                  title="Delete Thread"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Footer */}
        <div className={styles.footer}>
          <button onClick={onOpenSettings} className={styles.footerItem}>
            <span>Settings</span>
          </button>
          <Link href="/" className={styles.footerItem}>
            <span>Homepage</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
