(() => {
  const root = document.getElementById("stack-calculator");
  if (!root) return;

  const KATANA_PRICE = 39;
  const DEFAULT_USERS = 20;

  const APPS = [
    { id: "salesforce", name: "Salesforce", module: "Customers", price: 75, color: "#00A1E0", abbr: "SF" },
    { id: "hubspot", name: "HubSpot", module: "Customers", price: 45, color: "#FF7A59", abbr: "HS" },
    { id: "asana", name: "Asana", module: "Projects", price: 24, color: "#F06A6A", abbr: "As" },
    { id: "monday", name: "Monday.com", module: "Projects", price: 24, color: "#6161FF", abbr: "Mo" },
    { id: "jira", name: "Jira", module: "Projects", price: 21, color: "#0052CC", abbr: "Ji" },
    { id: "bamboo", name: "BambooHR", module: "HR", price: 12, color: "#73C41D", abbr: "BH" },
    { id: "gusto", name: "Gusto", module: "HR", price: 40, color: "#F45D48", abbr: "Gu" },
    { id: "quickbooks", name: "QuickBooks", module: "Finance", price: 30, color: "#2CA01C", abbr: "QB" },
    { id: "xero", name: "Xero", module: "Finance", price: 13, color: "#13B5EA", abbr: "Xe" },
    { id: "slack", name: "Slack", module: "Comms", price: 15, color: "#611F69", abbr: "Sl" },
    { id: "teams", name: "Microsoft Teams", module: "Comms", price: 12, color: "#6264A7", abbr: "Te" },
    { id: "zendesk", name: "Zendesk", module: "Customers", price: 49, color: "#03363D", abbr: "Ze" },
    { id: "servicetitan", name: "ServiceTitan", module: "Workforce", price: 89, color: "#0D3B66", abbr: "ST" },
    { id: "fishbowl", name: "Fishbowl", module: "Inventory", price: 50, color: "#1B75BC", abbr: "FB" },
    { id: "docusign", name: "DocuSign", module: "e-sign", price: 25, color: "#FFCC22", abbr: "DS" },
    { id: "carta", name: "Carta", module: "KYI", price: 20, color: "#111111", abbr: "Ca" },
    { id: "notion", name: "Notion", module: "Hub", price: 10, color: "#FFFFFF", abbr: "No" },
    { id: "zapier", name: "Zapier", module: "Automation", price: 20, color: "#FF4A00", abbr: "Za" },
  ];

  const DEFAULT_IDS = new Set(["asana", "salesforce", "bamboo", "quickbooks", "slack"]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const selected = new Set(DEFAULT_IDS);
  let users = DEFAULT_USERS;

  const appGrid = root.querySelector("[data-stack-apps]");
  const userInput = root.querySelector("[data-stack-users]");
  const replaceList = root.querySelector("[data-stack-replace-list]");
  const replaceTotal = root.querySelector("[data-stack-replace-total]");
  const katanaTotal = root.querySelector("[data-stack-katana-total]");
  const savingsAmount = root.querySelector("[data-stack-savings]");
  const emptyState = root.querySelector("[data-stack-empty]");

  const renderApps = () => {
    appGrid.innerHTML = APPS.map((app) => {
      const isOn = selected.has(app.id);
      const textColor = app.color === "#FFFFFF" ? "#111" : "#fff";
      return `
        <button
          class="stack-app${isOn ? " is-selected" : ""}"
          type="button"
          data-app-id="${app.id}"
          aria-pressed="${isOn ? "true" : "false"}"
        >
          <span class="stack-app__icon" style="background:${app.color};color:${textColor}">${app.abbr}</span>
          <span class="stack-app__name">${app.name}</span>
          <span class="stack-app__module">${app.module}</span>
        </button>
      `;
    }).join("");

    appGrid.querySelectorAll("[data-app-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.appId;
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        renderApps();
        renderTotals();
      });
    });
  };

  const renderTotals = () => {
    const chosen = APPS.filter((app) => selected.has(app.id));
    const monthlyPerUser = chosen.reduce((sum, app) => sum + app.price, 0);
    const fragmentedYear = monthlyPerUser * users * 12;
    const katanaYear = KATANA_PRICE * users * 12;
    const savings = Math.max(0, fragmentedYear - katanaYear);

    if (chosen.length === 0) {
      emptyState.hidden = false;
      replaceList.innerHTML = "";
      replaceTotal.textContent = formatMoney(0);
      katanaTotal.textContent = formatMoney(katanaYear);
      savingsAmount.textContent = formatMoney(0);
      return;
    }

    emptyState.hidden = true;
    replaceList.innerHTML = chosen
      .map(
        (app) => `
          <li>
            <span>${app.name}<em>${app.module}</em></span>
            <span>${formatMoney(app.price)}/user/mo</span>
          </li>
        `
      )
      .join("");

    replaceTotal.textContent = `${formatMoney(fragmentedYear)} / year`;
    katanaTotal.textContent = `${formatMoney(katanaYear)} / year`;
    savingsAmount.textContent = `${formatMoney(savings)} / year`;
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

  renderApps();
  if (userInput) userInput.value = String(users);
  renderTotals();
})();
