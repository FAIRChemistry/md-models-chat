import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { checkPassword } from "@/utils/requests";

interface PasswordModalProps {
  onClose?: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Refs for focusable elements
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.body;
    if (isOpen) {
      body.style.overflow = "hidden";
      body.style.height = "100vh";

      // Set initial focus to password input when modal opens
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    } else {
      body.style.overflow = "";
      body.style.height = "";
    }

    return () => {
      body.style.overflow = "";
      body.style.height = "";
    };
  }, [isOpen]);

  // Focus trap logic
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = [passwordInputRef.current, submitButtonRef.current].filter(Boolean);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: moving backwards
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: moving forwards
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }

      // Close modal on Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        // Don't allow closing with Escape for now since this is a required auth modal
        // If you want to allow Escape to close: setIsOpen(false);
      }
    };

    // Add event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await checkPassword(password)) {
      setIsOpen(false);
      // Call the onClose callback if provided
      onClose?.();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
      // Refocus the input after error
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle backdrop click - prevent closing
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't close modal on backdrop click since this is required auth
    // Optionally, you could focus back to the input
    passwordInputRef.current?.focus();
  };

  // Handle modal content click - prevent event bubbling
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0d1117]"
      onClick={handleBackdropClick}
    >
      {/* Background gradient effects - same as Dashboard */}
      <div className="overflow-hidden absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-40 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="overflow-y-auto fixed inset-0">
        <div className="flex justify-center items-center p-4 min-h-full text-center">
          <div
            ref={modalRef}
            className="w-full max-w-md transform overflow-hidden rounded-lg bg-[#161b22] border border-[#30363d] text-left align-middle shadow-xl transition-all relative z-10"
            onClick={handleModalClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div className="px-6 py-5 border-b border-[#30363d]">
              <h3
                className="text-lg font-semibold leading-6 text-white"
                id="modal-title"
              >
                Authentication required
              </h3>
              <p id="modal-description" className="mt-2 text-sm text-[#7d8590]">
                Please enter your password to continue
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4">
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#c9d1d9]"
                >
                  Password
                </Label>
                <div className="mt-1">
                  <Input
                    ref={passwordInputRef}
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-[#30363d] bg-[#0d1117] shadow-sm focus:border-[#2f81f7] focus:ring focus:ring-[#2f81f7] focus:ring-opacity-50 sm:text-sm text-white"
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <div className="mt-2 flex items-center text-sm text-[#f85149]">
                    <AlertCircle className="mr-2 w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-[#161b22] border-t border-[#30363d]">
                <Button
                  ref={submitButtonRef}
                  type="submit"
                  className="w-full justify-center rounded-md border border-transparent bg-[#238636] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:ring-offset-2"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
