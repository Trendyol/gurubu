"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal } from "@/components/common/modal";

export interface ModalConfig {
  title?: string;
  content: React.ReactNode | ((close: () => void) => React.ReactNode);
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
}

interface ModalContextValues {
  isOpen: boolean;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValues | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ModalConfig | null>(null);

  const openModal = useCallback((nextConfig: ModalConfig) => {
    setConfig(nextConfig);
  }, []);

  const closeModal = useCallback(() => {
    setConfig(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen: config !== null,
      openModal,
      closeModal,
    }),
    [config, openModal, closeModal]
  );

  const resolvedContent = config
    ? typeof config.content === "function"
      ? config.content(closeModal)
      : config.content
    : null;

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        isOpen={config !== null}
        onClose={closeModal}
        title={config?.title}
        confirmText={config?.confirmText}
        onConfirm={config?.onConfirm}
        cancelText={config?.cancelText}
        onCancel={config?.onCancel}
      >
        {resolvedContent}
      </Modal>
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
};
