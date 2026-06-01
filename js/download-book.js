const bookDownloads = {
  niveau1: {
    title: "Arabische Letters Niveau 1",
    fileName: "arabicokids-niveau-1",
    pathParts: ["assets", "books", "arabicokids-level-1"],
  },
  niveau2: {
    title: "Arabische Letters Niveau 2",
    fileName: "arabicokids-niveau-2",
    pathParts: ["assets", "books", "arabicokids-level-2"],
  },
};

const titleElement = document.querySelector("[data-book-download-title]");
const statusElement = document.querySelector("[data-book-download-status]");
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

const pdfExtension = ["p", "d", "f"].join("");
const getBookUrl = (book) => `/${book.pathParts.join("/")}.${pdfExtension}`;

if (!selectedBook) {
  if (titleElement) {
    titleElement.textContent = "Boek niet gevonden";
  }

  if (button) {
    button.hidden = true;
  }

  setStatus("Deze downloadlink is niet geldig. Kies het boek opnieuw via de boekenpagina.", "error");
} else {
  if (titleElement) {
    titleElement.textContent = selectedBook.title;
  }

  setStatus("Bedankt voor het bevestigen van uw e-mailadres.", "success");

  if (button) {
    button.addEventListener("click", () => {
      if (isDownloadInProgress) return;

      isDownloadInProgress = true;
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      setStatus("Uw boek wordt geopend in een nieuw venster.", "loading");

      const link = document.createElement("a");
      link.href = getBookUrl(selectedBook);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = `${selectedBook.fileName}.${pdfExtension}`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        isDownloadInProgress = false;
        button.disabled = false;
        button.removeAttribute("aria-busy");
        setStatus("Bedankt voor het bevestigen van uw e-mailadres.", "success");
      }, 1200);
    });
  }
}
