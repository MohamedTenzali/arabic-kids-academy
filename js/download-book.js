// download-book.html?boek=1|2: show only the chosen book form, with a link to
// switch to the other book without reloading. Without ?boek= both stay visible.
(function () {
  const grid = document.querySelector(".books-grid");
  if (!grid) return;

  const cards = {
    1: grid.querySelector(".book-form-card.level-1"),
    2: grid.querySelector(".book-form-card.level-2"),
  };
  if (!cards[1] || !cards[2]) return;

  const initial = new URLSearchParams(window.location.search).get("boek");
  if (initial !== "1" && initial !== "2") return;

  const switcher = document.createElement("p");
  switcher.className = "book-switch";
  const link = document.createElement("a");
  switcher.appendChild(link);
  grid.after(switcher);

  const show = (boek, moveFocus) => {
    const other = boek === "1" ? "2" : "1";
    cards[boek].hidden = false;
    cards[other].hidden = true;
    grid.classList.add("is-single");

    link.href = `?boek=${other}`;
    link.textContent = `Liever het andere boek? Kies niveau ${other}`;

    if (moveFocus) {
      const title = cards[boek].querySelector(".banner-title");
      if (title) {
        title.setAttribute("tabindex", "-1");
        title.focus();
      }
    }
  };

  link.addEventListener("click", (event) => {
    event.preventDefault();
    const next = new URL(link.href, window.location.href).searchParams.get("boek");
    const url = new URL(window.location.href);
    url.searchParams.set("boek", next);
    window.history.replaceState(null, "", url);
    show(next, true);
  });

  show(initial, false);
})();
