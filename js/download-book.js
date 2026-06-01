const bookDownloads = {
  niveau1: {
    title: "Arabische Letters Niveau 1",
    level: "Niveau 1",
    fileName: "arabicokids-niveau-1",
    pdfPath: "/pdf/mijn-arabische-letters-boekje.pdf.pdf",
    cover: "/assets/book-covers/arabicokids-level-1-cover.webp",
  },
  niveau2: {
    title: "Arabische Letters Niveau 2",
    level: "Niveau 2",
    fileName: "arabicokids-niveau-2",
    pdfPath: "/pdf/mijn-arabische-letters-boekje-niveau 2.pdf.pdf",
    cover: "/assets/book-covers/arabicokids-level-2-cover.webp",
  },
};

const titleElement = document.querySelector("[data-book-download-title]");
const statusElement = document.querySelector("[data-book-download-status]");
const levelElement = document.querySelector("[data-book-download-level]");
const coverElement = document.querySelector("[data-book-download-cover]");
const button = document.querySelector("[data-book-download-button]");
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");
const selectedBook = bookDownloads[bookId];
let isDownloadInProgress = false;

const setStatus = (message, type = "") => {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.dataset.state = type;
};

const getBookUrl = (book) => encodeURI(book.pdfPath);

if (!selectedBook) {
  if (titleElement) {
    titleElement.textContent = "Boek niet gevonden";
  }

  if (levelElement) {
    levelElement.textContent = "Controleer de link";
  }

  if (coverElement) {
    coverElement.hidden = true;
  }

  if (button) {
    button.hidden = true;
  }

  setStatus("Boek niet gevonden", "error");
} else {
  if (titleElement) {
    titleElement.textContent = selectedBook.title;
  }

  if (levelElement) {
    levelElement.textContent = selectedBook.level;
  }

  if (coverElement) {
    coverElement.src = selectedBook.cover;
    coverElement.alt = `Cover van ${selectedBook.title}`;
    coverElement.hidden = false;
  }

  setStatus("Uw gratis werkboek staat klaar om te downloaden.", "success");

  if (button) {
    const bookUrl = getBookUrl(selectedBook);

    if (button instanceof HTMLAnchorElement) {
      button.href = bookUrl;
      button.download = `${selectedBook.fileName}.pdf`;
      button.addEventListener("click", () => {
        if (isDownloadInProgress) return;

        isDownloadInProgress = true;
        button.setAttribute("aria-busy", "true");
        window.setTimeout(() => {
          isDownloadInProgress = false;
          button.removeAttribute("aria-busy");
        }, 1200);
      });
    } else {
      button.addEventListener("click", () => {
        if (isDownloadInProgress) return;

        isDownloadInProgress = true;
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        setStatus("Uw werkboek wordt klaargezet.", "loading");

        const link = document.createElement("a");
        link.href = bookUrl;
        link.download = `${selectedBook.fileName}.pdf`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
          isDownloadInProgress = false;
          button.disabled = false;
          button.removeAttribute("aria-busy");
          setStatus("Uw gratis werkboek staat klaar om te downloaden.", "success");
        }, 1200);
      });
    }
  }
}
