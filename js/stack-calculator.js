(() => {
  const root = document.getElementById("stack-calculator");
  if (!root) return;

  const DEFAULT_USERS = 20;

  const MODULES = [
    {
      id: "projects",
      name: "Projects",
      price: 17.5,
      examples: "Asana, ClickUp, Smartsheet",
      color: "#F06A6A",
      abbr: "PM",
    },
    {
      id: "inventory",
      name: "Inventory",
      price: 48.41,
      examples: "Cin7, Fishbowl, Sortly",
      color: "#1B75BC",
      abbr: "Inv",
    },
    {
      id: "hr",
      name: "HR",
      price: 13.25,
      examples: "BambooHR, Gusto, Factorial",
      color: "#73C41D",
      abbr: "HR",
    },
    {
      id: "workforce",
      name: "Workforce",
      price: 52.25,
      examples: "Homebase, Deputy, Connecteam",
      color: "#0D3B66",
      abbr: "WF",
    },
    {
      id: "customers",
      name: "Customers",
      price: 70.6,
      examples: "Salesforce, HubSpot, Pipedrive",
      color: "#00A1E0",
      abbr: "CRM",
    },
    {
      id: "finance",
      name: "Finance",
      price: 65.32,
      examples: "QuickBooks, Xero, FreshBooks",
      color: "#2CA01C",
      abbr: "Fin",
    },
  ];

  const TIERS = [
    { id: "core", name: "Core Ops", price: 59, note: "Entry plan" },
    { id: "growth", name: "Growth", price: 89, note: "Default SMB plan" },
    { id: "operator", name: "Operator", price: 119, note: "Full-platform plan" },
  ];

  const DEFAULT_MODULE_IDS = new Set(MODULES.map((module) => module.id));
  let tierId = "operator";

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const selected = new Set(DEFAULT_MODULE_IDS);
  let users = DEFAULT_USERS;

  const moduleGrid = root.querySelector("[data-stack-modules]");
  const tierPicker = root.querySelector("[data-stack-tiers]");
  const userInput = root.querySelector("[data-stack-users]");
  const replaceList = root.querySelector("[data-stack-replace-list]");
  const replaceTotal = root.querySelector("[data-stack-replace-total]");
  const replacePerUser = root.querySelector("[data-stack-replace-per-user]");
  const katanaTotal = root.querySelector("[data-stack-katana-total]");
  const katanaTierName = root.querySelector("[data-stack-katana-tier]");
  const katanaTierPrice = root.querySelector("[data-stack-katana-price]");
  const savingsAmount = root.querySelector("[data-stack-savings]");
  const savingsPct = root.querySelector("[data-stack-savings-pct]");
  const emptyState = root.querySelector("[data-stack-empty]");

  const activeTier = () => TIERS.find((tier) => tier.id === tierId) || TIERS[2];

  const renderModules = () => {
    moduleGrid.innerHTML = MODULES.map((module) => {
      const isOn = selected.has(module.id);
      return `
        <button
          class="stack-app${isOn ? " is-selected" : ""}"
          type="button"
          data-module-id="${module.id}"
          aria-pressed="${isOn ? "true" : "false"}"
        >
          <span class="stack-app__icon" style="background:${module.color}">${module.abbr}</span>
          <span class="stack-app__name">${module.name}</span>
          <span class="stack-app__module">${formatMoney(module.price)}/user/mo avg.</span>
          <span class="stack-app__examples">${module.examples}</span>
        </button>
      `;
    }).join("");

    moduleGrid.querySelectorAll("[data-module-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.moduleId;
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        renderModules();
        renderTotals();
      });
    });
  };

  const renderTiers = () => {
    tierPicker.innerHTML = TIERS.map((tier) => {
      const isOn = tier.id === tierId;
      return `
        <button
          class="stack-tier${isOn ? " is-selected" : ""}"
          type="button"
          data-tier-id="${tier.id}"
          aria-pressed="${isOn ? "true" : "false"}"
        >
          <span class="stack-tier__name">${tier.name}</span>
          <span class="stack-tier__price">${formatMoney(tier.price)}/user/mo</span>
          <span class="stack-tier__note">${tier.note}</span>
        </button>
      `;
    }).join("");

    tierPicker.querySelectorAll("[data-tier-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        tierId = btn.dataset.tierId;
        renderTiers();
        renderTotals();
      });
    });
  };

  const renderTotals = () => {
    const chosen = MODULES.filter((module) => selected.has(module.id));
    const monthlyPerUser = chosen.reduce((sum, module) => sum + module.price, 0);
    const tier = activeTier();
    const fragmentedYear = monthlyPerUser * users * 12;
    const katanaYear = tier.price * users * 12;
    const savings = Math.max(0, fragmentedYear - katanaYear);
    const savingsPercent = monthlyPerUser > 0 ? Math.round((savings / fragmentedYear) * 100) : 0;

    katanaTierName.textContent = tier.name;
    katanaTierPrice.textContent = `${formatMoney(tier.price)}/user/mo`;

    if (chosen.length === 0) {
      emptyState.hidden = false;
      replaceList.innerHTML = "";
      replacePerUser.textContent = formatMoney(0);
      replaceTotal.textContent = `${formatMoney(0)} / year`;
      katanaTotal.textContent = `${formatMoney(katanaYear)} / year`;
      savingsAmount.textContent = `${formatMoney(0)} / year`;
      savingsPct.textContent = "";
      return;
    }

    emptyState.hidden = true;
    replaceList.innerHTML = chosen
      .map(
        (module) => `
          <li>
            <span>${module.name}<em>${module.examples}</em></span>
            <span>${formatMoney(module.price)}/user/mo</span>
          </li>
        `
      )
      .join("");

    replacePerUser.textContent = `${formatMoney(monthlyPerUser)}/user/mo`;
    replaceTotal.textContent = `${formatMoney(fragmentedYear)} / year`;
    katanaTotal.textContent = `${formatMoney(katanaYear)} / year`;
    savingsAmount.textContent = `${formatMoney(savings)} / year`;
    savingsPct.textContent =
      savingsPercent > 0 ? `That is about ${savingsPercent}% less — with one login instead of ${chosen.length}.` : "";
  };

  root.querySelectorAll("[data-stack-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = Number.parseInt(btn.dataset.stackStep, 10);
      users = Math.min(500, Math.max(1, users + delta));
      if (userInput) userInput.value = String(users);
      renderTotals();
    });
  });

  if (userInput) {
    userInput.addEventListener("change", () => {
      const next = Number.parseInt(userInput.value, 10);
      users = Number.isFinite(next) ? Math.min(500, Math.max(1, next)) : DEFAULT_USERS;
      userInput.value = String(users);
      renderTotals();
    });
    userInput.addEventListener("input", () => {
      const next = Number.parseInt(userInput.value, 10);
      if (!Number.isFinite(next)) return;
      users = Math.min(500, Math.max(1, next));
      renderTotals();
    });
  }

  renderModules();
  renderTiers();
  if (userInput) userInput.value = String(users);
  renderTotals();
})();
