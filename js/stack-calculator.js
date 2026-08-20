(() => {
  const root = document.getElementById("stack-calculator");
  if (!root) return;

  const DEFAULT_USERS = 20;

  const MODULES = {
    projects: { name: "Projects", price: 17.5 },
    inventory: { name: "Inventory", price: 48.41 },
    hr: { name: "HR", price: 13.25 },
    workforce: { name: "Workforce", price: 52.25 },
    customers: { name: "Customers", price: 70.6 },
    finance: { name: "Finance", price: 65.32 },
  };

  const TOOL_GROUPS = [
    {
      moduleId: "projects",
      tools: [
        { id: "asana", name: "Asana", color: "#F06A6A", abbr: "As" },
        { id: "clickup", name: "ClickUp", color: "#7B68EE", abbr: "Cu" },
        { id: "smartsheet", name: "Smartsheet", color: "#0073E6", abbr: "Sm" },
        { id: "monday", name: "Monday", color: "#6161FF", abbr: "Mo" },
        { id: "jira", name: "Jira", color: "#0052CC", abbr: "Ji" },
      ],
    },
    {
      moduleId: "inventory",
      tools: [
        { id: "cin7", name: "Cin7", color: "#E31837", abbr: "C7" },
        { id: "fishbowl", name: "Fishbowl", color: "#1B75BC", abbr: "FB" },
        { id: "sortly", name: "Sortly", color: "#FF6B35", abbr: "So" },
        { id: "inflow", name: "inFlow", color: "#00AEEF", abbr: "iF" },
      ],
    },
    {
      moduleId: "hr",
      tools: [
        { id: "bamboo", name: "BambooHR", color: "#73C41D", abbr: "BH" },
        { id: "gusto", name: "Gusto", color: "#F45D48", abbr: "Gu" },
        { id: "factorial", name: "Factorial", color: "#FF4F00", abbr: "Fa" },
      ],
    },
    {
      moduleId: "workforce",
      tools: [
        { id: "homebase", name: "Homebase", color: "#7C3AED", abbr: "Hb" },
        { id: "deputy", name: "Deputy", color: "#6366F1", abbr: "De" },
        { id: "connecteam", name: "Connecteam", color: "#2563EB", abbr: "Ct" },
        { id: "servicetitan", name: "ServiceTitan", color: "#0D3B66", abbr: "ST" },
      ],
    },
    {
      moduleId: "customers",
      tools: [
        { id: "salesforce", name: "Salesforce", color: "#00A1E0", abbr: "SF" },
        { id: "hubspot", name: "HubSpot", color: "#FF7A59", abbr: "HS" },
        { id: "pipedrive", name: "Pipedrive", color: "#017737", abbr: "Pd" },
        { id: "zendesk", name: "Zendesk", color: "#03363D", abbr: "Ze" },
      ],
    },
    {
      moduleId: "finance",
      tools: [
        { id: "quickbooks", name: "QuickBooks", color: "#2CA01C", abbr: "QB" },
        { id: "xero", name: "Xero", color: "#13B5EA", abbr: "Xe" },
        { id: "freshbooks", name: "FreshBooks", color: "#0075DD", abbr: "FB" },
        { id: "sage", name: "Sage", color: "#00D639", abbr: "Sa" },
      ],
    },
  ];

  const TIERS = [
    { id: "core", name: "Core Ops", price: 59, note: "Entry" },
    { id: "growth", name: "Growth", price: 89, note: "SMB default" },
    { id: "operator", name: "Operator", price: 119, note: "Full platform" },
  ];

  const DEFAULT_TOOL_IDS = new Set(["asana", "salesforce", "bamboo", "quickbooks", "fishbowl", "deputy"]);
  let tierId = "operator";

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const allTools = () =>
    TOOL_GROUPS.flatMap((group) =>
      group.tools.map((tool) => ({ ...tool, moduleId: group.moduleId }))
    );

  const selected = new Set(DEFAULT_TOOL_IDS);
  let users = DEFAULT_USERS;

  const toolGrid = root.querySelector("[data-stack-tools]");
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
  const moduleCountEl = root.querySelector("[data-stack-module-count]");

  const activeTier = () => TIERS.find((tier) => tier.id === tierId) || TIERS[2];

  const activeModules = () => {
    const moduleIds = new Set();
    allTools()
      .filter((tool) => selected.has(tool.id))
      .forEach((tool) => moduleIds.add(tool.moduleId));
    return [...moduleIds];
  };

  const renderTools = () => {
    toolGrid.innerHTML = TOOL_GROUPS.map((group) => {
      const module = MODULES[group.moduleId];
      const tiles = group.tools
        .map((tool) => {
          const isOn = selected.has(tool.id);
          return `
            <button
              class="stack-tool${isOn ? " is-selected" : ""}"
              type="button"
              data-tool-id="${tool.id}"
              aria-pressed="${isOn ? "true" : "false"}"
              title="${tool.name} · ${module.name}"
            >
              <span class="stack-tool__icon" style="background:${tool.color}">${tool.abbr}</span>
              <span class="stack-tool__name">${tool.name}</span>
            </button>
          `;
        })
        .join("");

      return `
        <div class="stack-calc__group">
          <p class="stack-calc__group-label">${module.name}</p>
          <div class="stack-calc__group-grid">${tiles}</div>
        </div>
      `;
    }).join("");

    toolGrid.querySelectorAll("[data-tool-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toolId;
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        renderTools();
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
          <span class="stack-tier__price">${formatMoney(tier.price)}</span>
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
    const moduleIds = activeModules();
    const chosenTools = allTools().filter((tool) => selected.has(tool.id));
    const monthlyPerUser = moduleIds.reduce((sum, id) => sum + MODULES[id].price, 0);
    const tier = activeTier();
    const fragmentedYear = monthlyPerUser * users * 12;
    const katanaYear = tier.price * users * 12;
    const savings = Math.max(0, fragmentedYear - katanaYear);
    const savingsPercent = monthlyPerUser > 0 ? Math.round((savings / fragmentedYear) * 100) : 0;

    katanaTierName.textContent = tier.name;
    katanaTierPrice.textContent = `${formatMoney(tier.price)}/user/mo`;
    if (moduleCountEl) moduleCountEl.textContent = String(moduleIds.length);

    if (moduleIds.length === 0) {
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
    replaceList.innerHTML = moduleIds
      .map((moduleId) => {
        const module = MODULES[moduleId];
        const tools = chosenTools
          .filter((tool) => tool.moduleId === moduleId)
          .map((tool) => tool.name)
          .join(", ");
        return `
          <li>
            <span>${tools}<em>${module.name} module avg.</em></span>
            <span>${formatMoney(module.price)}/user/mo</span>
          </li>
        `;
      })
      .join("");

    replacePerUser.textContent = `${formatMoney(monthlyPerUser)}/user/mo`;
    replaceTotal.textContent = `${formatMoney(fragmentedYear)} / year`;
    katanaTotal.textContent = `${formatMoney(katanaYear)} / year`;
    savingsAmount.textContent = `${formatMoney(savings)} / year`;
    savingsPct.textContent =
      savingsPercent > 0
        ? `${savingsPercent}% less per year — one workspace instead of ${moduleIds.length} separate stacks.`
        : "";
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

  renderTools();
  renderTiers();
  if (userInput) userInput.value = String(users);
  renderTotals();
})();
