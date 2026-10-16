// ============================================================
// ОСНОВНА ЛОГІКА САЙТУ
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // ---------------- Мобільне меню ----------------
  const menu = document.querySelector(".menu");
  const links = document.querySelector(".navlinks");
  if (menu && links) {
    menu.setAttribute("aria-expanded", "false");

    const closeMobileMenu = () => {
      links.classList.remove("mobile-open");
      menu.setAttribute("aria-expanded", "false");
    };

    menu.addEventListener("click", () => {
      const isOpen = links.classList.toggle("mobile-open");
      menu.setAttribute("aria-expanded", String(isOpen));
    });

    // Закриваємо меню після вибору пункту навігації.
    links.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMobileMenu);
    });

    // Закриваємо меню клавішею Escape.
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMobileMenu();
    });
  }

  // ---------------- Вкладка «Зворотний зв'язок» ----------------
  const tab = document.querySelector(".feedback-tab");
  const panel = document.querySelector(".feedback-panel");
  const close = document.querySelector(".feedback-close");

  const openFeedback = () => {
    if (!panel) return;
    panel.classList.add("open");
    const firstInput = panel.querySelector('input[name="name"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  };

  const closeFeedback = () => {
    if (panel) panel.classList.remove("open");
  };

  if (tab) tab.addEventListener("click", openFeedback);
  if (close) close.addEventListener("click", closeFeedback);

  // ---------------- ВСІ кнопки замовлення ----------------
  // Будь-яке посилання з data-feedback відкриває одну й ту саму форму.
  document.querySelectorAll("[data-feedback]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openFeedback();
    });
  });

  // ---------------- Відправка заявки в Telegram через Cloudflare Pages Function ----------------
  document.querySelectorAll(".feedback-form").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();

      const success = form.querySelector(".success");
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : "";

      if (success) {
        success.style.display = "none";
        success.textContent = "";
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Надсилання...";
      }

      const formData = new FormData(form);
      const order = {
        name: String(formData.get("name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        product: String(formData.get("product") || "").trim(),
        message: String(formData.get("message") || "").trim()
      };

      try {
        const response = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order)
        });

        let result = {};
        try {
          result = await response.json();
        } catch (_) {
          result = {};
        }

        if (!response.ok) {
          throw new Error(result.message || "Не вдалося надіслати заявку. Спробуйте пізніше.");
        }

        if (success) {
          success.textContent = "Дякуємо! Заявку успішно надіслано. Ми зв'яжемося з вами.";
          success.style.display = "block";
        }
        form.reset();
      } catch (error) {
        if (success) {
          success.textContent = error.message || "Помилка зв'язку. Спробуйте пізніше або зателефонуйте +380 98 935 05 00.";
          success.style.display = "block";
        } else {
          alert(error.message || "Не вдалося надіслати заявку. Спробуйте пізніше.");
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  });
});
