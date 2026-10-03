(() => {
  "use strict";

  const PROMOTIONS = {
    landing: 15,
    onepage: 20,
    institutional: 25,
    custom: 15,
    portfolio: 50
  };

  const FREE_HOSTING_SLOTS = 5;
  const USED_FREE_HOSTING_SLOTS = 0;

  const REMAINING_FREE_HOSTING_SLOTS =
    Math.max(
      FREE_HOSTING_SLOTS - USED_FREE_HOSTING_SLOTS,
      0
    );
  const TOTAL_STEPS = 5;

  const state = {
    step: 1,
    type: null,
    pages: null,
    extras: [],
    hosting: null,
    delivery: null,
    maintenance: null
  };

  const $ = (id) => document.getElementById(id);

  const elements = {
    promoBanner: $("promoBanner"),
    progressBar: $("progressBar"),
    stepLabel: $("stepLabel"),
    progressPercent: $("progressPercent"),
    finalSummary: $("finalSummary"),
    priceValue: $("priceValue"),
    sideSummary: $("sideSummary"),
    monthlyValue: $("monthlyValue"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    resetBtn: $("resetBtn"),
    pdfBtn: $("pdfBtn"),
    contactBtn: $("contactBtn"),
    whatsappBtn: $("whatsappBtn"),
    clientName: $("clientName"),
    clientBusiness: $("clientBusiness")
  };

  function money(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(value);
  }

  function getRadio(name) {
    const input = document.querySelector(
      `input[type="radio"][name="${name}"]:checked`
    );

    if (!input) {
      return null;
    }

    return {
      value: input.value,
      label: input.dataset.label || input.value,
      price: Number(input.dataset.price || 0)
    };
  }

  function getPromotion(type) {
    const percent = PROMOTIONS[type];

    if (!percent) {
      return 0;
    }

    const today = new Date();
    const end = new Date("2026-12-31T23:59:59-03:00");

    return today <= end ? percent : 0;
  }

  function calculatePricing() {
    const base = state.type?.price || 0;
    const pages = state.pages?.price || 0;

    const extras = state.extras.reduce(
      (total, extra) => total + extra.price,
      0
    );

    let hosting = state.hosting?.price || 0;

    if (
      state.hosting?.value === "managed" &&
      REMAINING_FREE_HOSTING_SLOTS > 0
    ) {
      hosting = 0;
    }

    const delivery = state.delivery?.price || 0;
    const maintenance = state.maintenance?.price || 0;

    const subtotal =
      base +
      pages +
      extras +
      hosting +
      delivery;

    const promotion = getPromotion(state.type?.value);

    const discount = Math.round(
      subtotal * (promotion / 100)
    );

    const total = subtotal - discount;

    return {
      base,
      pages,
      extras,
      hosting,
      delivery,
      maintenance,
      subtotal,
      promotion,
      discount,
      total
    };
  }

  function createRow(label, value, className = "") {
    const row = document.createElement("div");

    row.className =
      `flex justify-between gap-4 py-2 text-sm ${className}`.trim();

    const labelElement = document.createElement("span");
    labelElement.textContent = label;

    const valueElement = document.createElement("strong");
    valueElement.textContent = value;

    row.append(labelElement, valueElement);

    return row;
  }

  function renderPromoBadges() {
    Object.entries(PROMOTIONS).forEach(([type, percent]) => {
      const badge = $(`promo-${type}`);

      if (!badge) {
        return;
      }

      badge.textContent = `-${percent}%`;
      badge.classList.remove("hidden");
    });
  }

  function renderHostingPromo() {
    const badge = $("host-managed-badge");
    const price = $("price-host-managed");

    if (!badge || !price) {
      return;
    }

    if (REMAINING_FREE_HOSTING_SLOTS > 0) {
      badge.textContent =
        `Gratis · ${REMAINING_FREE_HOSTING_SLOTS} lugares`;

      price.textContent =
        "$50.000 → Gratis";
    } else {
      badge.textContent = "Recomendado";
      price.textContent = "+$50.000";
    }
  }

  function renderPromoBanner() {
    if (!elements.promoBanner) {
      return;
    }

    elements.promoBanner.replaceChildren();
    elements.promoBanner.classList.remove("hidden");

    const promotionBox = document.createElement("div");

    promotionBox.className =
      "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300";

    const title = document.createElement("strong");
    title.textContent = "🎉 Oferta de lanzamiento";

    const description = document.createElement("span");
    description.className = "ml-2";
    description.textContent =
      "El descuento se aplica sobre el subtotal final de tu configuración. Vigencia hasta el 31/12/2026.";

    promotionBox.append(title, description);
    elements.promoBanner.append(promotionBox);

    if (REMAINING_FREE_HOSTING_SLOTS > 0) {
      const hostingBox = document.createElement("div");

      hostingBox.className =
        "mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";

      hostingBox.textContent =
        `🎁 Hosting + dominio gratis para los primeros ${REMAINING_FREE_HOSTING_SLOTS} clientes.`;

      elements.promoBanner.append(hostingBox);
    }
  }

  function formatExtras(extras = state.extras) {
    if (!extras.length) {
      return "Ninguno";
    }

    return extras
      .map((extra) =>
        extra.price > 0
          ? `${extra.label} (${money(extra.price)})`
          : `${extra.label} (Consultar)`
      )
      .join(", ");
  }

  function renderPrice() {
    const pricing = calculatePricing();

    if (elements.priceValue) {
      elements.priceValue.textContent = money(pricing.total);
    }

    if (elements.monthlyValue) {
      elements.monthlyValue.textContent =
        pricing.maintenance > 0
          ? `${money(pricing.maintenance)}/mes`
          : "Sin mantenimiento";
    }

    if (!elements.sideSummary) {
      return;
    }

    elements.sideSummary.replaceChildren();

    if (state.type) {
      elements.sideSummary.append(
        createRow("Proyecto", state.type.label)
      );
    }

    if (state.pages) {
      elements.sideSummary.append(
        createRow("Páginas", state.pages.label)
      );
    }

    if (state.extras.length) {
      elements.sideSummary.append(
        createRow(
          "Extras",
          `${state.extras.length} seleccionado${state.extras.length === 1 ? "" : "s"}`
        )
      );
    }

    if (state.hosting) {
      const hostingLabel =
        state.hosting.value === "managed" &&
        REMAINING_FREE_HOSTING_SLOTS > 0
          ? "Gestión inicial · gratis"
          : state.hosting.label;

      elements.sideSummary.append(
        createRow("Hosting", hostingLabel)
      );
    }

    if (state.delivery) {
      elements.sideSummary.append(
        createRow("Entrega", state.delivery.label)
      );
    }

    if (pricing.discount > 0) {
      elements.sideSummary.append(
        createRow(
          `Descuento · ${pricing.promotion}%`,
          `-${money(pricing.discount)}`,
          "text-amber-600 dark:text-amber-400"
        )
      );
    }
  }

  function renderFinalSummary() {
    if (!elements.finalSummary) {
      return;
    }

    const pricing = calculatePricing();

    elements.finalSummary.replaceChildren();

    elements.finalSummary.append(
      createRow(
        "Proyecto",
        state.type?.label || "Sin seleccionar"
      )
    );

    elements.finalSummary.append(
      createRow(
        "Páginas",
        state.pages?.label || "Sin seleccionar"
      )
    );

    elements.finalSummary.append(
      createRow(
        "Extras",
        formatExtras()
      )
    );

    elements.finalSummary.append(
      createRow(
        "Hosting",
        state.hosting
          ? (
              state.hosting.value === "managed" &&
              REMAINING_FREE_HOSTING_SLOTS > 0
                ? `${state.hosting.label} · gratis`
                : state.hosting.label
            )
          : "Sin gestión"
      )
    );

    elements.finalSummary.append(
      createRow(
        "Entrega",
        state.delivery?.label || "Entrega estándar"
      )
    );

    elements.finalSummary.append(
      createRow(
        "Mantenimiento",
        pricing.maintenance > 0
          ? `${state.maintenance.label} · ${money(pricing.maintenance)}/mes`
          : "Sin mantenimiento"
      )
    );

    elements.finalSummary.append(
      createRow(
        "Subtotal",
        money(pricing.subtotal)
      )
    );

    elements.finalSummary.append(
      createRow(
        "Descuento",
        pricing.discount > 0
          ? `-${money(pricing.discount)} (${pricing.promotion}%)`
          : "Sin descuento",
        pricing.discount > 0
          ? "text-amber-600 dark:text-amber-400"
          : ""
      )
    );

    elements.finalSummary.append(
      createRow(
        "Precio final estimado",
        money(pricing.total),
        "border-t border-gray-200 pt-4 text-base font-bold dark:border-gray-700"
      )
    );

    updateContactLinks();
  }

  function updateProgress() {
    const percent = Math.round(
      (state.step / TOTAL_STEPS) * 100
    );

    if (elements.progressBar) {
      elements.progressBar.style.width = `${percent}%`;
    }

    if (elements.stepLabel) {
      elements.stepLabel.textContent =
        `Paso ${state.step} de ${TOTAL_STEPS}`;
    }

    if (elements.progressPercent) {
      elements.progressPercent.textContent = `${percent}%`;
    }

    if (elements.prevBtn) {
      elements.prevBtn.disabled = state.step === 1;
    }

    if (elements.nextBtn) {
      elements.nextBtn.textContent =
        state.step === TOTAL_STEPS
          ? "Volver a empezar"
          : "Continuar";
    }
  }

  function showStep() {
    document.querySelectorAll(".step").forEach((step) => {
      const stepNumber = Number(step.dataset.step);

      step.classList.toggle(
        "hidden",
        stepNumber !== state.step
      );
    });

    updateProgress();

    if (state.step === TOTAL_STEPS) {
      renderFinalSummary();
    }

    renderPrice();
  }

  function updateContactLinks() {
    const pricing = calculatePricing();

    const params = new URLSearchParams();

    if (state.type) {
      params.set("proyecto", state.type.label);
    }

    if (state.pages) {
      params.set("paginas", state.pages.label);
    }

    params.set(
      "extras",
      formatExtras()
    );

    params.set(
      "hosting",
      state.hosting?.label || ""
    );

    params.set(
      "entrega",
      state.delivery?.label || ""
    );

    params.set(
      "mantenimiento",
      state.maintenance?.label || "Sin mantenimiento"
    );

    params.set("precio", money(pricing.total));

    if (elements.contactBtn) {
      elements.contactBtn.href =
        `../index.html?${params.toString()}#contacto`;
    }

    if (elements.whatsappBtn) {
      const message =
`Hola LM Studio, quiero consultar por un proyecto web.

Proyecto: ${state.type?.label || ""}
Páginas: ${state.pages?.label || ""}
Extras: ${formatExtras()}
Hosting: ${state.hosting?.label || ""}
Entrega: ${state.delivery?.label || ""}
Mantenimiento: ${
  state.maintenance?.label || "Sin mantenimiento"
}
Precio final estimado: ${money(pricing.total)}

Quisiera consultar el presupuesto definitivo.`;

      elements.whatsappBtn.href =
        `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
  }

  function bindRadio(name, callback) {
    document
      .querySelectorAll(
        `input[type="radio"][name="${name}"]`
      )
      .forEach((input) => {
        input.addEventListener("change", () => {
          if (!input.checked) {
            return;
          }

          callback({
            value: input.value,
            label:
              input.dataset.label || input.value,
            price:
              Number(input.dataset.price || 0)
          });

          renderPrice();

          if (state.step === TOTAL_STEPS) {
            renderFinalSummary();
          }
        });
      });
  }

  function bindExtras() {
    document
      .querySelectorAll(
        'input[type="checkbox"][data-extra]'
      )
      .forEach((input) => {
        input.addEventListener("change", () => {
          const extra = {
            value: input.dataset.extra,
            label:
              input.dataset.label ||
              input.dataset.extra,
            price:
              Number(input.dataset.price || 0)
          };

          if (input.checked) {
            state.extras.push(extra);
          } else {
            state.extras = state.extras.filter(
              (item) => item.value !== extra.value
            );
          }

          renderPrice();

          if (state.step === TOTAL_STEPS) {
            renderFinalSummary();
          }
        });
      });
  }

  function bindClientFields() {
    [
      elements.clientName,
      elements.clientBusiness
    ].forEach((input) => {
      input?.addEventListener("input", () => {
        if (state.step === TOTAL_STEPS) {
          renderFinalSummary();
        } else {
          updateContactLinks();
        }
      });
    });
  }

  function resetQuote() {
    state.step = 1;
    state.extras = [];

    document
      .querySelectorAll(
        'input[type="checkbox"][data-extra]'
      )
      .forEach((input) => {
        input.checked = false;
      });

    document
      .querySelectorAll('input[type="radio"]')
      .forEach((input) => {
        input.checked = false;
      });

    const defaults = [
      "type-landing",
      "pages-small",
      "host-managed",
      "del-standard",
      "maint-none"
    ];

    defaults.forEach((id) => {
      const input = $(id);

      if (input) {
        input.checked = true;
      }
    });

    if (elements.clientName) {
      elements.clientName.value = "";
    }

    if (elements.clientBusiness) {
      elements.clientBusiness.value = "";
    }

    state.type = getRadio("type");
    state.pages = getRadio("pages");
    state.hosting = getRadio("hosting");
    state.delivery = getRadio("delivery");
    state.maintenance = getRadio("maintenance");

    renderPromoBadges();
    renderHostingPromo();
    renderPromoBanner();
    showStep();
  }

  function nextStep() {
    if (state.step === TOTAL_STEPS) {
      resetQuote();
      return;
    }

    state.step += 1;

    showStep();

    window.scrollTo({
      top: 0,
      behavior:
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth"
    });
  }

  function previousStep() {
    if (state.step <= 1) {
      return;
    }

    state.step -= 1;

    showStep();

    window.scrollTo({
      top: 0,
      behavior:
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth"
    });
  }

  function getQuoteData() {
    return {
      client:
        elements.clientName?.value.trim() ||
        "Cliente sin especificar",
      business:
        elements.clientBusiness?.value.trim() ||
        "",
      date:
        new Intl.DateTimeFormat("es-AR").format(
          new Date()
        )
    };
  }

  function generatePdf() {
    if (!window.jspdf?.jsPDF) {
      window.alert(
        "No se pudo cargar el generador de PDF."
      );
      return;
    }

    const pricing = calculatePricing();
    const quote = getQuoteData();
    const doc = new window.jspdf.jsPDF();

    const left = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("LM Studio", left, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Presupuesto de desarrollo web",
      left,
      28
    );

    doc.text(
      quote.date,
      192,
      20,
      { align: "right" }
    );

    doc.setDrawColor(220, 220, 220);
    doc.line(left, 35, 192, 35);

    let y = 47;

    doc.setFont("helvetica", "bold");
    doc.text("Cliente", left, y);

    doc.setFont("helvetica", "normal");

    y += 6;
    doc.text(quote.client, left, y);

    if (quote.business) {
      y += 6;
      doc.text(quote.business, left, y);
    }

    y += 12;

    const addPdfRow = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, left, y);

      doc.setFont("helvetica", "normal");
      doc.text(String(value), left + 50, y);

      y += 7;
    };

    addPdfRow(
      "Proyecto:",
      state.type?.label || "Sin seleccionar"
    );

    addPdfRow(
      "Páginas:",
      state.pages?.label || "Sin seleccionar"
    );

    addPdfRow(
      "Extras:",
      formatExtras()
    );

    addPdfRow(
      "Hosting:",
      state.hosting?.label || "Sin gestión"
    );

    addPdfRow(
      "Entrega:",
      state.delivery?.label || "Estándar"
    );

    addPdfRow(
      "Mantenimiento:",
      pricing.maintenance > 0
        ? `${state.maintenance.label} · ${money(pricing.maintenance)}/mes`
        : "Sin mantenimiento"
    );

    y += 5;

    doc.setDrawColor(220, 220, 220);
    doc.line(left, y, 192, y);

    y += 10;

    addPdfRow(
      "Subtotal:",
      money(pricing.subtotal)
    );

    addPdfRow(
      "Descuento:",
      pricing.discount > 0
        ? `-${money(pricing.discount)} (${pricing.promotion}%)`
        : "Sin descuento"
    );

    y += 3;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text(
      "Precio final estimado:",
      left,
      y
    );

    doc.text(
      money(pricing.total),
      192,
      y,
      { align: "right" }
    );

    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      "El mantenimiento mensual se muestra por separado",
      left,
      y
    );

    y += 5;

    doc.text(
      "y no forma parte del precio inicial.",
      left,
      y
    );

    y += 12;

    doc.setFontSize(8);

    doc.text(
      "Esta cotización es una estimación. El presupuesto definitivo",
      left,
      y
    );

    y += 4;

    doc.text(
      "puede ajustarse según el alcance y requisitos finales.",
      left,
      y
    );

    const safeName =
      quote.client
        .replace(
          /[^a-z0-9áéíóúüñ_-]+/gi,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        ) ||
      "cliente";

    doc.save(
      `Presupuesto-LM-Studio-${safeName}.pdf`
    );
  }

  function initialize() {
    bindRadio("type", (value) => {
      state.type = value;
    });

    bindRadio("pages", (value) => {
      state.pages = value;
    });

    bindRadio("hosting", (value) => {
      state.hosting = value;
    });

    bindRadio("delivery", (value) => {
      state.delivery = value;
    });

    bindRadio("maintenance", (value) => {
      state.maintenance = value;
    });

    bindExtras();
    bindClientFields();

    elements.nextBtn?.addEventListener(
      "click",
      nextStep
    );

    elements.prevBtn?.addEventListener(
      "click",
      previousStep
    );

    elements.resetBtn?.addEventListener(
      "click",
      resetQuote
    );

    elements.pdfBtn?.addEventListener(
      "click",
      generatePdf
    );

    resetQuote();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
