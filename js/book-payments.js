(() => {
  const cards = [...document.querySelectorAll("[data-book-card]")];
  const emailInput = document.querySelector("[data-book-email]");
  const globalStatus = document.querySelector("[data-book-global-status]");

  if (!cards.length || !emailInput) {
    return;
  }

  const storageKey = "arabicoKidsBuyerEmail";
  const apiBase = window.location.origin;
  const bookState = new Map();

  const setGlobalStatus = (message, isError = false) => {
    if (!globalStatus) {
      return;
    }

    globalStatus.textContent = message;
    globalStatus.classList.toggle("is-error", isError);
  };

  const getEmail = () => emailInput.value.trim().toLowerCase();

  const setButtonBusy = (button, isBusy) => {
    button.disabled = isBusy;
    button.setAttribute("aria-busy", isBusy ? "true" : "false");
  };

  const setCardState = (card, order) => {
    const button = card.querySelector("[data-book-action]");
    const status = card.querySelector("[data-book-status]");

    if (!button || !status) {
      return;
    }

    button.classList.add("book-download-locked");
    button.classList.remove("book-download-ready");
    button.disabled = false;
    button.removeAttribute("aria-disabled");
    button.removeAttribute("aria-busy");

    if (!order) {
      status.textContent = "Nog niet betaald. Rond eerst de testbetaling van 5 euro af.";
      button.textContent = "Testbetaling - 5 euro";
      button.dataset.bookMode = "pay";
      return;
    }

    if (order.downloadUsed) {
      status.textContent = "Deze betaling is al gebruikt voor 1 download. Voor opnieuw downloaden is een nieuwe betaling nodig.";
      button.textContent = "Opnieuw testbetalen - 5 euro";
      button.dataset.bookMode = "pay";
      return;
    }

    status.textContent = "Testbetaling gelukt. Je mag dit boek nu 1 keer downloaden.";
    button.textContent = "Download boek";
    button.dataset.bookMode = "download";
    button.classList.remove("book-download-locked");
    button.classList.add("book-download-ready");
  };

  const refreshStatus = async () => {
    const email = getEmail();

    if (!email) {
      cards.forEach((card) => setCardState(card, null));
      setGlobalStatus("Vul een test e-mail in om de betaalstatus te controleren.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/book-orders?email=${encodeURIComponent(email)}`, {
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("status_failed");
      }

      const data = await response.json();
      bookState.clear();

      cards.forEach((card) => {
        const order = data.orders?.[card.dataset.bookId] || null;
        bookState.set(card.dataset.bookId, order);
        setCardState(card, order);
      });

      setGlobalStatus("Testserver verbonden. Je kunt een testbetaling doen.");
    } catch {
      cards.forEach((card) => {
        const button = card.querySelector("[data-book-action]");
        const status = card.querySelector("[data-book-status]");

        if (button) {
          button.disabled = true;
          button.setAttribute("aria-disabled", "true");
          button.textContent = "Testserver niet actief";
        }

        if (status) {
          status.textContent = "Start eerst de lokale mock payment server om deze flow te testen.";
        }
      });

      setGlobalStatus("Testserver niet actief. Start scripts/mock-payment-server.mjs.", true);
    }
  };

  const createTestPayment = async (bookId, button) => {
    const email = getEmail();

    if (!email || !email.includes("@")) {
      setGlobalStatus("Vul eerst een geldig test e-mailadres in.", true);
      emailInput.focus();
      return;
    }

    setButtonBusy(button, true);
    button.textContent = "Betaling verwerken...";

    try {
      const response = await fetch(`${apiBase}/api/test-pay`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ bookId, email }),
      });

      if (!response.ok) {
        throw new Error("payment_failed");
      }

      localStorage.setItem(storageKey, email);
      setGlobalStatus("Testbetaling gelukt. De downloadknop is nu actief.");
      await refreshStatus();
    } catch {
      setGlobalStatus("Testbetaling is mislukt. Controleer of de mock server draait.", true);
      await refreshStatus();
    }
  };

  const downloadBook = async (bookId, button) => {
    const order = bookState.get(bookId);

    if (!order?.token) {
      setGlobalStatus("Geen geldige downloadlink gevonden. Doe eerst een testbetaling.", true);
      await refreshStatus();
      return;
    }

    setButtonBusy(button, true);
    button.textContent = "Download starten...";

    try {
      const response = await fetch(`${apiBase}/api/download/${order.token}`);

      if (!response.ok) {
        throw new Error("download_failed");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${bookId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setGlobalStatus("Download gestart. Deze betaling is nu gebruikt.");
      await refreshStatus();
    } catch {
      setGlobalStatus("Download niet beschikbaar of al gebruikt.", true);
      await refreshStatus();
    }
  };

  emailInput.value = localStorage.getItem(storageKey) || "";
  emailInput.addEventListener("change", () => {
    localStorage.setItem(storageKey, getEmail());
    refreshStatus();
  });

  emailInput.addEventListener("input", () => {
    setGlobalStatus("E-mail aangepast. De status wordt zo opnieuw gecontroleerd.");
  });

  cards.forEach((card) => {
    const button = card.querySelector("[data-book-action]");

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      if (button.dataset.bookMode === "download") {
        downloadBook(card.dataset.bookId, button);
        return;
      }

      createTestPayment(card.dataset.bookId, button);
    });
  });

  refreshStatus();
})();
