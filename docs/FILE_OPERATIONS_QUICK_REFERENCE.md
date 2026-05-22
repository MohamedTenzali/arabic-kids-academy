# Quick Reference: Download/Print/Share API

## Basic API Overview

### 1. Download a File
```javascript
FileOperations.downloadFile(url, fileName, options)
```

**Parameters:**
- `url` (string): URL to the file
- `fileName` (string): Name to save file as
- `options` (object):
  - `onStart()`: Called when download begins
  - `onComplete(result)`: Called when done
  - `onError(err)`: Called on error

**Example:**
```javascript
FileOperations.downloadFile(
  "../docs/worksheet.pdf",
  "my-worksheet.pdf",
  {
    onStart: () => button.disabled = true,
    onComplete: () => button.disabled = false,
    onError: (err) => alert("Failed: " + err.message)
  }
);
```

---

### 2. Open a File in New Tab
```javascript
FileOperations.openFile(url, options)
```

**Parameters:**
- `url` (string): URL to the file
- `options` (object):
  - `newTab` (boolean): Open in new tab? Default: true
  - `onOpen()`: Called when opened
  - `onError(err)`: Called on error

**Example:**
```javascript
FileOperations.openFile("../pdf/worksheet.pdf", {
  newTab: true,
  onOpen: () => console.log("Opened!"),
  onError: (err) => alert("Cannot open file")
});
```

---

### 3. Print a File or Element
```javascript
FileOperations.printFile(url, options)
```

**Parameters:**
- `url` (string): URL to file OR element ID (if isElementId=true)
- `options` (object):
  - `isElementId` (boolean): Is URL an element ID? Default: false
  - `onPrint()`: Called when print dialog opens
  - `onError(err)`: Called on error

**Example - Print PDF:**
```javascript
FileOperations.printFile("../pdf/worksheet.pdf", {
  isElementId: false,
  onPrint: () => console.log("Print dialog opened"),
  onError: (err) => alert("Print failed")
});
```

**Example - Print DOM Element:**
```javascript
FileOperations.printFile("worksheet-content", {
  isElementId: true,
  onPrint: () => console.log("Printing element")
});
```

---

### 4. Share a File
```javascript
FileOperations.shareFile(url, shareData, options)
```

**Parameters:**
- `url` (string): URL to the file
- `shareData` (object):
  - `title` (string): Share title
  - `text` (string): Share message
  - `fileName` (string): File name for share
  - `mimeType` (string): Optional MIME type
- `options` (object):
  - `onShare(result)`: Called on successful share
  - `onError(err)`: Called on error
  - `onFallback(result)`: Called if using fallback

**Example:**
```javascript
FileOperations.shareFile(
  "../pdf/worksheet.pdf",
  {
    title: "Arabic Worksheet",
    text: "Practice writing letters!",
    fileName: "worksheet.pdf"
  },
  {
    onShare: (result) => alert("Shared via " + result.method),
    onError: (err) => alert("Share failed: " + err.message),
    onFallback: (result) => {
      if (result.method === "clipboard") {
        alert("Link copied to clipboard!");
      }
    }
  }
);
```

---

### 5. Create Download/Print/Share Buttons
```javascript
FileOperations.createFileActionButtons(url, options)
```

**Parameters:**
- `url` (string): URL to the file
- `options` (object):
  - `fileName` (string): File name
  - `layout` (string): "horizontal" or "vertical"
  - `className` (string): Extra CSS classes

**Returns:** HTMLElement with three buttons

**Example:**
```javascript
const buttons = FileOperations.createFileActionButtons(
  "../pdf/worksheet.pdf",
  {
    fileName: "worksheet.pdf",
    layout: "horizontal"
  }
);

document.getElementById("action-container").appendChild(buttons);
```

---

### 6. Bypass Service Worker Cache
```javascript
FileOperations.bypassServiceWorkerCache(url)
```

**Returns:** URL with cache-busting query parameter

**Example:**
```javascript
const freshUrl = FileOperations.bypassServiceWorkerCache(
  "../pdf/worksheet.pdf"
);
// Result: "../pdf/worksheet.pdf?v=1234567890"
```

---

## Complete Example: Worksheet Page

```html
<!-- HTML -->
<div id="worksheet-actions"></div>

<script>
// Create buttons when page loads
document.addEventListener("DOMContentLoaded", () => {
  const worksheetUrl = "../docs/letter-worksheets/alif.pdf";
  const fileName = "alif-oefenblad.pdf";
  
  // Create buttons
  const buttons = FileOperations.createFileActionButtons(
    worksheetUrl,
    {
      fileName: fileName,
      layout: "horizontal"
    }
  );
  
  // Add to page
  document.getElementById("worksheet-actions").appendChild(buttons);
});
</script>
```

---

## HTML Button Styling Reference

### Download Button
```html
<button class="file-action-btn file-action-download">
  <span class="file-action-icon">⬇️</span>
  <span class="file-action-label">Download</span>
</button>
```
Color: Brand blue (`#6b3bf5`)

### Print Button
```html
<button class="file-action-btn file-action-print">
  <span class="file-action-icon">🖨️</span>
  <span class="file-action-label">Print</span>
</button>
```
Color: Coral orange (`#ffc83d` to `#ff6fae`)

### Share Button
```html
<button class="file-action-btn file-action-share">
  <span class="file-action-icon">📤</span>
  <span class="file-action-label">Share</span>
</button>
```
Color: Leaf green (`#8bc34a`)

---

## Error Handling Patterns

### Pattern 1: User Feedback
```javascript
FileOperations.downloadFile(url, fileName, {
  onError: (err) => {
    const message = err.message === "HTTP 404"
      ? "File not found. Please try again."
      : "Download failed. Check your connection.";
    alert(message);
  }
});
```

### Pattern 2: Loading Indicator
```javascript
FileOperations.downloadFile(url, fileName, {
  onStart: () => {
    button.disabled = true;
    button.textContent = "Downloading...";
  },
  onComplete: () => {
    button.disabled = false;
    button.textContent = "Download Complete!";
    setTimeout(() => {
      button.textContent = "Download";
    }, 2000);
  }
});
```

### Pattern 3: Try/Catch Alternative
```javascript
async function safeDownload(url, fileName) {
  try {
    await new Promise((resolve, reject) => {
      FileOperations.downloadFile(url, fileName, {
        onComplete: resolve,
        onError: reject
      });
    });
  } catch (err) {
    console.error("Download error:", err);
  }
}
```

---

## Browser Compatibility

| Browser | Download | Print | Share | Clipboard |
|---------|----------|-------|-------|-----------|
| Chrome 60+ | ✅ | ✅ | ✅ | ✅ |
| Firefox 55+ | ✅ | ✅ | ⚠️ | ✅ |
| Safari 11+ | ✅ | ✅ | ✅ | ✅ |
| iOS Safari 11+ | ✅ | ✅ | ✅ | ✅ (13.3+) |
| Android Chrome | ✅ | ✅ | ✅ | ✅ |
| iPhone PWA | ✅ | ✅ | ✅ | ✅ |
| Edge 79+ | ✅ | ✅ | ✅ | ✅ |

---

## Common Mistakes to Avoid

❌ **Wrong:** Using blob URLs
```javascript
// Don't do this:
const blob = new Blob([content]);
const url = URL.createObjectURL(blob);
```

✅ **Right:** Use real file URLs
```javascript
// Do this:
FileOperations.downloadFile("../pdf/file.pdf", "file.pdf");
```

---

❌ **Wrong:** Simple download links on iPhone PWA
```html
<!-- Don't use on PWA: -->
<a href="file.pdf" download>Download</a>
```

✅ **Right:** Use FileOperations
```javascript
// Use this:
FileOperations.downloadFile("../pdf/file.pdf", "file.pdf");
```

---

❌ **Wrong:** No error handling
```javascript
FileOperations.downloadFile(url, fileName); // No options!
```

✅ **Right:** Handle errors
```javascript
FileOperations.downloadFile(url, fileName, {
  onError: (err) => alert("Error: " + err.message)
});
```

---

## Debug Mode

Enable debug logging by modifying `file-operations.js`:

```javascript
const DEBUG = true;  // Change from false to true
```

This will log all operations to console:
```
[FileOps] Downloading: ../pdf/file.pdf as file.pdf
[FileOps] Download completed: file.pdf
```

---

## Tips & Tricks

### Tip 1: Generate Dynamic Filenames
```javascript
const date = new Date().toISOString().split('T')[0];
const fileName = `worksheet-${date}.pdf`;

FileOperations.downloadFile(url, fileName);
```

### Tip 2: Chain Multiple Downloads
```javascript
async function downloadAll(files) {
  for (const file of files) {
    await new Promise(resolve => {
      FileOperations.downloadFile(file.url, file.name, {
        onComplete: resolve
      });
    });
  }
}

downloadAll([
  { url: "../pdf/alif.pdf", name: "alif.pdf" },
  { url: "../pdf/baa.pdf", name: "baa.pdf" }
]);
```

### Tip 3: Check Browser Support
```javascript
const supportsDownload = 'download' in document.createElement('a');
const supportsShare = !!navigator.share;
const supportsClipboard = !!navigator.clipboard;

console.log({ supportsDownload, supportsShare, supportsClipboard });
```

---

## See Also

- Full guide: [DOWNLOAD_PRINT_SHARE_GUIDE.md](docs/DOWNLOAD_PRINT_SHARE_GUIDE.md)
- Implementation: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- Source code: [js/file-operations.js](js/file-operations.js)
