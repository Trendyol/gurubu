import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { toast, ToastPosition } from "react-hot-toast";
import { IconX } from "@tabler/icons-react";

const ToastContext = createContext<any>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const showSuccessToast = useCallback((title: string, description: string, position: ToastPosition) => {
    toast.success(
      <div className="toaster">
        <span className="Toastify__toast-icon" />
        <div>
          <h4 className="toaster-title">{title}</h4>
          <p className="toaster-description">{description}</p>
        </div>
        <button
          className="toaster-close"
          onClick={() => toast.dismiss()}
        >
          <IconX />
        </button>
      </div>,
      {
        position,
        duration: 5000,
      }
    );
  }, []);

  const showFailureToast = useCallback((title: string, description: string, position: ToastPosition) => {
    toast.error(
      <div className="toaster">
        <span className="Toastify__toast-icon" />
        <div>
          <h4 className="toaster-title">{title}</h4>
          <p className="toaster-description">{description}</p>
        </div>
        <button
          className="toaster-close"
          onClick={() => toast.dismiss()}
        >
          <IconX />
        </button>
      </div>,
      {
        position,
        duration: 5000,
      }
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccessToast, showFailureToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
