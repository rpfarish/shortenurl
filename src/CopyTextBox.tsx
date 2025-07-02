import { useState } from "react";
import { Copy, Check } from "lucide-react";
import "./CopyTextBox.css";

const FirebaseCopyTextBox = () => {
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const textToCopy = "firebase init hosting";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setShowSuccess(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
        setShowSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="firebase-wrapper">
      <div className="firebase-container">
        <h2 className="firebase-title">Initialize Firebase</h2>

        <div className="copy-box-container">
          {/* Success Message Overlay */}
          <div className={`success-message ${showSuccess ? "show" : "hide"}`}>
            <div className="success-badge">
              <Check className="success-icon" />
              Copied to clipboard!
            </div>
          </div>

          <div className="code-input-container">
            <code className="code-text">{textToCopy}</code>
            <button
              onClick={handleCopy}
              className={`copy-button ${copied ? "copied" : ""}`}
              aria-label="Copy to clipboard"
            >
              <div className="icon-container">
                <Copy className={`copy-icon ${copied ? "hide" : ""}`} />
                <Check className={`check-icon ${copied ? "show" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        <p className="description-text">
          Run this command in your terminal to set up Firebase hosting
        </p>
      </div>
    </div>
  );
};

export default FirebaseCopyTextBox;
