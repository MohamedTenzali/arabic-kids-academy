/**
 * File Operations Module
 * Handles download, print, and share operations for PDFs and images
 * Optimized for iPhone PWA and Safari compatibility
 */

const FileOperations = (() => {
  const DEBUG = false;

  const log = (...args) => {
    if (DEBUG) console.log("[FileOps]", ...args);
  };

  const error = (...args) => {
    console.error("[FileOps]", ...args);
  };

  /**
   * Download a file
   * @param {string} fileUrl - URL to the file
   * @param {string} fileName - Name for the downloaded file
   * @param {object} options - { mimeType, onStart, onComplete, onError }
   */
  const downloadFile = async (fileUrl, fileName, options = {}) => {
    const { mimeType = "application/octet-stream", onStart, onComplete, onError } = options;

    try {
      onStart?.();
      log("Downloading:", fileUrl, "as", fileName);

      // Fetch the file
      const response = await fetch(fileUrl, {
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create download link
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      log("Download completed:", fileName);
      onComplete?.({ fileName, success: true });
    } catch (err) {
      error("Download failed:", err);
      onError?.({ error: err, message: err.message });
    }
  };

  /**
   * Open a file in a new tab for viewing/printing
   * @param {string} fileUrl - URL to the file
   * @param {object} options - { newTab, onOpen, onError }
   */
  const openFile = async (fileUrl, options = {}) => {
    const { newTab = true, onOpen, onError } = options;

    try {
      log("Opening file:", fileUrl);

      if (newTab) {
        const win = window.open(fileUrl, "_blank");
        if (!win) {
          throw new Error("Failed to open file - popup may be blocked");
        }
        onOpen?.({ success: true });
      } else {
        window.location.href = fileUrl;
      }
    } catch (err) {
      error("Open file failed:", err);
      onError?.({ error: err, message: err.message });
    }
  };

  /**
   * Print a file or document
   * @param {string} fileUrl - URL to the file or element ID to print
   * @param {object} options - { isElementId, onPrint, onError }
   */
  const printFile = async (fileUrl, options = {}) => {
    const { isElementId = false, onPrint, onError } = options;

    try {
      log("Printing:", fileUrl);

      if (isElementId) {
        // Print a specific DOM element
        const element = document.getElementById(fileUrl);
        if (!element) {
          throw new Error(`Element with id "${fileUrl}" not found`);
        }

        const printWindow = window.open("", "", "height=600,width=800");
        printWindow.document.write("<html><head><title>Print</title>");
        printWindow.document.write(
          `<link rel="stylesheet" href="${document.location.origin}/css/main.css">`,
        );
        printWindow.document.write("</head><body>");
        printWindow.document.write(element.innerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();

        setTimeout(() => {
          printWindow.print();
          onPrint?.({ success: true });
        }, 250);
      } else {
        // Open file in new tab and trigger print
        const printWindow = window.open(fileUrl, "_blank");
        if (!printWindow) {
          throw new Error("Failed to open file - popup may be blocked");
        }

        // Delay print to ensure file loads
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            onPrint?.({ success: true });
          }, 500);
        };
      }
    } catch (err) {
      error("Print failed:", err);
      onError?.({ error: err, message: err.message });
    }
  };

  /**
   * Share a file using Web Share API or fallback
   * @param {string} fileUrl - URL to the file
   * @param {object} shareData - { title, text, fileName, mimeType }
   * @param {object} options - { onShare, onError, onFallback }
   */
  const shareFile = async (fileUrl, shareData = {}, options = {}) => {
    const { title, text, fileName } = shareData;
    const { onShare, onError, onFallback } = options;

    try {
      log("Sharing file:", fileUrl);

      // Check if Web Share API is available
      if (navigator.share) {
        try {
          // Try to fetch and create a File object for better sharing
          const response = await fetch(fileUrl, { credentials: "same-origin" });
          const blob = await response.blob();

          // Determine MIME type
          let mimeType = blob.type;
          if (fileUrl.endsWith(".pdf")) {
            mimeType = "application/pdf";
          } else if (fileUrl.endsWith(".png")) {
            mimeType = "image/png";
          } else if (fileUrl.endsWith(".jpg") || fileUrl.endsWith(".jpeg")) {
            mimeType = "image/jpeg";
          }

          // Create File object
          const file = new File([blob], fileName || "file", { type: mimeType });

          // Build share data
          const data = {
            title: title || "Arabic Kids Academy",
            text: text || "Check this out!",
            files: [file],
          };

          // Check if files can be shared
          if (navigator.canShare && !navigator.canShare(data)) {
            log("Cannot share files, falling back to URL-only share");
            delete data.files;
          }

          await navigator.share(data);
          log("Share successful");
          onShare?.({ success: true, method: "native" });
        } catch (err) {
          if (err.name === "AbortError") {
            log("User cancelled share");
            return;
          }
          throw err;
        }
      } else {
        // Fallback to copy link to clipboard or open share dialog
        log("Web Share API not available, using fallback");
        fallbackShare(fileUrl, shareData, onFallback);
      }
    } catch (err) {
      error("Share failed:", err);
      onError?.({ error: err, message: err.message });
    }
  };

  /**
   * Fallback share: Copy link or offer download
   * @private
   */
  const fallbackShare = (fileUrl, shareData, onFallback) => {
    try {
      // Try to copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fileUrl);
        onFallback?.({
          method: "clipboard",
          message: "Link copied to clipboard",
        });
      } else {
        // Last resort: show the URL in an alert (poor UX but works)
        onFallback?.({
          method: "alert",
          message: "Please share this link manually",
          url: fileUrl,
        });
      }
    } catch (err) {
      error("Fallback share failed:", err);
      onFallback?.({
        method: "error",
        message: "Could not share file",
      });
    }
  };

  /**
   * Create action buttons for a file
   * @param {string} fileUrl - URL to the file
   * @param {object} options - { fileName, className, layout }
   * @returns {HTMLElement}
   */
  const createFileActionButtons = (fileUrl, options = {}) => {
    const { fileName = "file", className = "", layout = "horizontal" } = options;

    const container = document.createElement("div");
    container.className = `file-action-buttons file-action-buttons-${layout} ${className}`;

    // Download button
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "file-action-btn file-action-download";
    downloadBtn.setAttribute("aria-label", `Download ${fileName}`);
    downloadBtn.innerHTML = `
      <span class="file-action-icon" aria-hidden="true">⬇️</span>
      <span class="file-action-label">Download</span>
    `;
    downloadBtn.addEventListener("click", () => {
      downloadFile(fileUrl, fileName, {
        onStart: () => downloadBtn.setAttribute("aria-busy", "true"),
        onComplete: () => downloadBtn.removeAttribute("aria-busy"),
        onError: (err) => alert("Download failed: " + err.message),
      });
    });

    // Print button
    const printBtn = document.createElement("button");
    printBtn.className = "file-action-btn file-action-print";
    printBtn.setAttribute("aria-label", `Print ${fileName}`);
    printBtn.innerHTML = `
      <span class="file-action-icon" aria-hidden="true">🖨️</span>
      <span class="file-action-label">Print</span>
    `;
    printBtn.addEventListener("click", () => {
      printFile(fileUrl, {
        onPrint: () => printBtn.removeAttribute("aria-busy"),
        onError: (err) => alert("Print failed: " + err.message),
      });
    });

    // Share button
    const shareBtn = document.createElement("button");
    shareBtn.className = "file-action-btn file-action-share";
    shareBtn.setAttribute("aria-label", `Share ${fileName}`);
    shareBtn.innerHTML = `
      <span class="file-action-icon" aria-hidden="true">📤</span>
      <span class="file-action-label">Share</span>
    `;
    shareBtn.addEventListener("click", () => {
      shareFile(
        fileUrl,
        {
          title: "Arabic Kids Academy",
          text: "Check out this worksheet from Arabic Kids Academy!",
          fileName: fileName,
        },
        {
          onShare: () => shareBtn.removeAttribute("aria-busy"),
          onError: (err) => alert("Share failed: " + err.message),
          onFallback: (result) => {
            if (result.method === "clipboard") {
              alert("Link copied! You can now share it.");
            } else if (result.method === "alert") {
              alert("Share this link: " + result.url);
            }
          },
        },
      );
      shareBtn.setAttribute("aria-busy", "true");
    });

    // Add buttons based on capabilities
    container.appendChild(downloadBtn);
    container.appendChild(printBtn);

    // Only add share button if sharing is supported or clipboard is available
    if (navigator.share || navigator.clipboard) {
      container.appendChild(shareBtn);
    }

    return container;
  };

  /**
   * Initialize event delegation for download links
   * Converts href-based downloads to use our system
   * @param {string} selector - Selector for download links/buttons
   */
  const initializeDownloadLinks = (selector = ".worksheet-download-button") => {
    document.addEventListener("click", (event) => {
      const link = event.target.closest(selector);
      if (!link || link.dataset.fileOpsInitialized) return;

      const url = link.getAttribute("href");
      const fileName = link.getAttribute("data-filename") || "download";

      // Prevent default download
      event.preventDefault();

      // Add loading state
      link.classList.add("is-downloading");
      link.setAttribute("aria-busy", "true");

      // Use our download function
      downloadFile(url, fileName, {
        onComplete: () => {
          link.classList.remove("is-downloading");
          link.removeAttribute("aria-busy");
        },
        onError: (err) => {
          link.classList.remove("is-downloading");
          link.removeAttribute("aria-busy");
          console.error("Download error:", err);
        },
      });
    });
  };

  /**
   * Service Worker cache bypass for PDFs
   * Adds cache-busting parameter to PDF URLs
   * @param {string} url - URL to bypass cache
   * @returns {string}
   */
  const bypassServiceWorkerCache = (url) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${Date.now()}`;
  };

  // Public API
  return {
    downloadFile,
    openFile,
    printFile,
    shareFile,
    createFileActionButtons,
    initializeDownloadLinks,
    bypassServiceWorkerCache,
  };
})();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FileOperations;
}
