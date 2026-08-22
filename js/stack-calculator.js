(() => {
  const TOOL_GROUPS = [
    {
      moduleId: "projects",
      moduleName: "Projects",
      tools: [
        {
          id: "asana",
          name: "Asana",
          plan: "Advanced",
          model: "per_seat",
          price: 24.99,
          color: "#F06A6A",
          abbr: "As",
          source: "asana.com/pricing · billed annually",
        },
        {
          id: "clickup",
          name: "ClickUp",
          plan: "Business",
          model: "per_seat",
          price: 12,
          color: "#7B68EE",
          abbr: "Cu",
          source: "clickup.com/pricing · billed annually",
        },
        {
          id: "smartsheet",
          name: "Smartsheet",
          plan: "Business",
          model: "per_seat",
          price: 32,
          color: "#0073E6",
          abbr: "Sm",
          source: "Published Business list · billed annually",
        },
        {
          id: "trello",
          name: "Trello",
          plan: "Premium",
          model: "per_seat",
          price: 10,
          color: "#0052CC",
          abbr: "Tr",
          source: "trello.com/pricing · billed annually",
        },
        {
          id: "zoho-projects",
          name: "Zoho Projects",
          plan: "Enterprise",
          model: "per_seat",
          price: 10,
          color: "#E42527",
          abbr: "ZP",
          source: "zoho.com/projects/pricing · billed annually",
        },
      ],
    },
    {
      moduleId: "inventory",
      moduleName: "Inventory",
      tools: [
        {
          id: "cin7",
          name: "Cin7 Core",
          plan: "Standard → Advanced",
          model: "tiered_flat",
          tiers: [
            { maxUsers: 5, price: 349, label: "Standard" },
            { maxUsers: 10, price: 599, label: "Pro" },
            { maxUsers: Infinity, price: 999, label: "Advanced" },
          ],
          color: "#E31837",
          abbr: "C7",
          source: "cin7.com/pricing · org monthly",
        },
        {
          id: "inflow",
          name: "inFlow",
          plan: "Entrepreneur → Mid-Size",
          model: "tiered_flat",
          tiers: [
            { maxUsers: 2, price: 129, label: "Entrepreneur" },
            { maxUsers: 5, price: 349, label: "Small Business" },
            { maxUsers: Infinity, price: 699, label: "Mid-Size" },
          ],
          color: "#00AEEF",
          abbr: "iF",
          source: "inflowinventory.com · billed annually",
        },
        {
          id: "sortly",
          name: "Sortly",
          plan: "Advanced",
          model: "flat",
          price: 49,
          color: "#FF6B35",
          abbr: "So",
          source: "sortly.com/pricing · org monthly",
        },
        {
          id: "fishbowl",
          name: "Fishbowl",
          plan: "Essentials → Scale",
          model: "tiered_flat",
          tiers: [
            { maxUsers: 2, price: 229, label: "Essentials" },
            { maxUsers: 5, price: 429, label: "Growth" },
            { maxUsers: Infinity, price: 729, label: "Scale" },
          ],
          color: "#1B75BC",
          abbr: "FB",
          source: "fishbowlinventory.com/pricing · billed annually",
        },
        {
          id: "zoho-inventory",
          name: "Zoho Inventory",
          plan: "Professional",
          model: "flat",
          price: 79,
          color: "#E42527",
          abbr: "ZI",
          source: "zoho.com/inventory/pricing · org monthly",
        },
      ],
    },
    {
      moduleId: "hr",
      moduleName: "HR",
      tools: [
        {
          id: "bamboo",
          name: "BambooHR",
          plan: "Elite",
          model: "per_seat",
          price: 25,
          color: "#73C41D",
          abbr: "BH",
          source: "bamboohr.com/pricing · per employee",
        },
        {
          id: "gusto",
          name: "Gusto",
          plan: "Plus",
          model: "base_plus_seat",
          base: 80,
          perSeat: 12,
          color: "#F45D48",
          abbr: "Gu",
          source: "gusto.com/product/pricing · base + per employee",
        },
        {
          id: "factorial",
          name: "Factorial",
          plan: "Core",
          model: "per_seat",
          price: 8,
          color: "#FF4F00",
          abbr: "Fa",
          source: "Published Core list · per user",
        },
        {
          id: "zoho-people",
          name: "Zoho People",
          plan: "Enterprise",
          model: "per_seat",
          price: 7,
          color: "#E42527",
          abbr: "ZP",
          source: "zoho.com/people/pricing · billed annually",
        },
      ],
    },
    {
      moduleId: "workforce",
      moduleName: "Workforce",
      tools: [
        {
          id: "homebase",
          name: "Homebase",
          plan: "All-in-One",
          model: "per_location",
          price: 96,
          color: "#7C3AED",
          abbr: "Hb",
          source: "homebase.com/pricing · per location (assumes 1)",
        },
        {
          id: "deputy",
          name: "Deputy",
          plan: "Pro",
          model: "per_seat",
          price: 9,
          color: "#6366F1",
          abbr: "De",
          source: "deputy.com/pricing · per user",
        },
        {
          id: "connecteam",
          name: "Connecteam",
          plan: "Operations Expert",
          model: "flat",
          price: 99,
          color: "#2563EB",
          abbr: "Ct",
          source: "Published Expert hub list · flat for first ~30 users",
        },
        {
          id: "eni-work",
          name: "ENI Work",
          plan: "Listed rate",
          model: "per_seat",
          price: 5,
          color: "#0D3B66",
          abbr: "EN",
          source: "Benchmark listed rate · verify with vendor",
        },
      ],
    },
    {
      moduleId: "customers",
      moduleName: "Customers",
      tools: [
        {
          id: "hubspot",
          name: "HubSpot Sales Hub",
          plan: "Professional",
          model: "per_seat",
          price: 90,
          color: "#FF7A59",
          abbr: "HS",
          source: "hubspot.com/pricing/sales · billed annually",
        },
        {
          id: "salesforce",
          name: "Salesforce",
          plan: "Sales Cloud Pro Suite",
          model: "per_seat",
          price: 100,
          color: "#00A1E0",
          abbr: "SF",
          source: "salesforce.com/pricing · billed annually",
        },
        {
          id: "pipedrive",
          name: "Pipedrive",
          plan: "Premium",
          model: "per_seat",
          price: 59,
          color: "#017737",
          abbr: "Pd",
          source: "pipedrive.com/pricing · billed annually",
        },
        {
          id: "freshsales",
          name: "Freshsales",
          plan: "Enterprise",
          model: "per_seat",
          price: 59,
          color: "#E9773A",
          abbr: "Fr",
          source: "freshworks.com/freshsales · billed annually",
        },
        {
          id: "zoho-crm",
          name: "Zoho CRM",
          plan: "Enterprise",
          model: "per_seat",
          price: 40,
          color: "#E42527",
          abbr: "ZC",
          source: "zoho.com/crm/pricing · billed annually",
        },
      ],
    },
    {
      moduleId: "finance",
      moduleName: "Finance",
      tools: [
        {
          id: "quickbooks",
          name: "QuickBooks Online",
          plan: "Simple Start → Advanced",
          model: "tiered_flat",
          tiers: [
            { maxUsers: 1, price: 38, label: "Simple Start" },
            { maxUsers: 3, price: 75, label: "Essentials" },
            { maxUsers: 5, price: 115, label: "Plus" },
            { maxUsers: Infinity, price: 275, label: "Advanced" },
          ],
          color: "#2CA01C",
          abbr: "QB",
          source: "quickbooks.intuit.com/pricing · org monthly",
        },
        {
          id: "xero",
          name: "Xero",
          plan: "Established",
          model: "flat",
          price: 90,
          color: "#13B5EA",
          abbr: "Xe",
          source: "xero.com/us/pricing-plans · unlimited users",
        },
        {
          id: "freshbooks",
          name: "FreshBooks",
          plan: "Premium",
          model: "base_plus_seat",
          base: 70,
          perSeat: 11,
          seatOffset: 1,
          color: "#0075DD",
          abbr: "Fr",
          source: "freshbooks.com/pricing · base + extra team members",
        },
        {
          id: "sage",
          name: "Sage Accounting",
          plan: "Standard (list)",
          model: "flat",
          price: 45,
          color: "#00D639",
          abbr: "Sa",
          source: "Published cloud Standard list · org monthly (region varies)",
        },
        {
          id: "zoho-books",
          name: "Zoho Books",
          plan: "Professional",
          model: "flat",
          price: 50,
          color: "#E42527",
          abbr: "ZB",
          source: "zoho.com/books/pricing · org monthly",
        },
      ],
    },
  ];

  const TIERS = [
    { id: "core", name: "Core Ops", price: 59 },
    { id: "growth", name: "Growth", price: 89 },
    { id: "operator", name: "Operator", price: 119 },
  ];

  const DEFAULT_TOOL_IDS = ["asana", "salesforce", "bamboo", "quickbooks", "fishbowl", "deputy"];
  const DEFAULT_USERS = 20;

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatMoneyExact = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const pickTier = (tool, users) => {
    if (!tool.tiers) return null;
    return tool.tiers.find((tier) => users <= tier.maxUsers) || tool.tiers[tool.tiers.length - 1];
  };

  const monthlyCost = (tool, users) => {
    switch (tool.model) {
      case "per_seat":
        return tool.price * users;
      case "flat":
      case "per_location":
        return tool.price;
      case "base_plus_seat": {
        const offset = tool.seatOffset || 0;
        return tool.base + tool.perSeat * Math.max(0, users - offset);
      }
      case "tiered_flat": {
        const tier = pickTier(tool, users);
        return tier ? tier.price : 0;
      }
      default:
        return 0;
    }
  };

  const modelLabel = (tool) => {
    switch (tool.model) {
      case "per_seat":
        return "Per seat";
      case "flat":
        return "Flat monthly";
      case "per_location":
        return "Per location";
      case "base_plus_seat":
        return "Base + per seat";
      case "tiered_flat":
        return "Org plan (by seats)";
      default:
        return "Listed";
    }
  };

  const rateLabel = (tool) => {
    switch (tool.model) {
      case "per_seat":
        return `${formatMoney(tool.price)}/seat`;
      case "flat":
        return `${formatMoney(tool.price)}/mo`;
      case "per_location":
        return `${formatMoney(tool.price)}/location`;
      case "base_plus_seat":
        return `${formatMoney(tool.base)} + ${formatMoney(tool.perSeat)}/seat`;
      case "tiered_flat":
        return `from ${formatMoney(tool.tiers[0].price)}/mo`;
      default:
        return "";
    }
  };

  const lineRateLabel = (tool, users) => {
    switch (tool.model) {
      case "per_seat":
        return `${formatMoney(tool.price)} × ${users} seats`;
      case "flat":
        return `${formatMoney(tool.price)}/mo flat`;
      case "per_location":
        return `${formatMoney(tool.price)}/mo · 1 location`;
      case "base_plus_seat": {
        const seats = Math.max(0, users - (tool.seatOffset || 0));
        return `${formatMoney(tool.base)} + ${formatMoney(tool.perSeat)} × ${seats}`;
      }
      case "tiered_flat": {
        const tier = pickTier(tool, users);
        return `${tier.label} · ${formatMoney(tier.price)}/mo`;
      }
      default:
        return "";
    }
  };

  const allTools = () =>
    TOOL_GROUPS.flatMap((group) =>
      group.tools.map((tool) => ({
        ...tool,
        moduleId: group.moduleId,
        moduleName: group.moduleName,
      }))
    );

  const initStackCut = (root) => {
    const selected = new Set(DEFAULT_TOOL_IDS);
    let users = DEFAULT_USERS;
    let tierId = "operator";
    const ctaHref = root.dataset.stackCta || "/products/business#join";

    const toolList = root.querySelector("[data-stack-tools]");
    const tierPicker = root.querySelector("[data-stack-tiers]");
    const userInput = root.querySelector("[data-stack-users]");
    const replaceList = root.querySelector("[data-stack-replace-list]");
    const replaceTotal = root.querySelector("[data-stack-replace-total]");
    const replaceMonth = root.querySelector("[data-stack-replace-month]");
    const katanaTotal = root.querySelector("[data-stack-katana-total]");
    const katanaMonth = root.querySelector("[data-stack-katana-month]");
    const katanaTierName = root.querySelector("[data-stack-katana-tier]");
    const katanaTierPrice = root.querySelector("[data-stack-katana-price]");
    const savingsAmount = root.querySelector("[data-stack-savings]");
    const savingsPct = root.querySelector("[data-stack-savings-pct]");
    const emptyState = root.querySelector("[data-stack-empty]");
    const toolCountEl = root.querySelector("[data-stack-tool-count]");
    const cta = root.querySelector("[data-stack-cta-link]");

    if (cta) cta.setAttribute("href", ctaHref);

    const activeTier = () => TIERS.find((tier) => tier.id === tierId) || TIERS[2];

    const renderTools = () => {
      toolList.innerHTML = TOOL_GROUPS.map((group) => {
        const rows = group.tools
          .map((tool) => {
            const isOn = selected.has(tool.id);
            return `
              <button
                class="stack-cut__row${isOn ? " is-on" : ""}"
                type="button"
                data-tool-id="${tool.id}"
                aria-pressed="${isOn ? "true" : "false"}"
                title="${tool.source}"
              >
                <span class="stack-cut__check" aria-hidden="true"></span>
                <span class="stack-cut__row-main">
                  <span class="stack-cut__row-name">${tool.name}</span>
                  <span class="stack-cut__row-plan">${tool.plan}</span>
                </span>
                <span class="stack-cut__row-meta">
                  <span class="stack-cut__row-rate">${rateLabel(tool)}</span>
                  <span class="stack-cut__row-model">${modelLabel(tool)}</span>
                </span>
              </button>
            `;
          })
          .join("");

        return `
          <div class="stack-cut__module">
            <div class="stack-cut__module-head">
              <span class="stack-cut__module-mark"></span>
              <h3>${group.moduleName}</h3>
            </div>
            <div class="stack-cut__rows">${rows}</div>
          </div>
        `;
      }).join("");

      toolList.querySelectorAll("[data-tool-id]").forEach((btn) => {
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
            class="stack-cut__tier${isOn ? " is-on" : ""}"
            type="button"
            data-tier-id="${tier.id}"
            aria-pressed="${isOn ? "true" : "false"}"
          >
            <span>${tier.name}</span>
            <strong>${formatMoney(tier.price)}</strong>
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
      const chosen = allTools().filter((tool) => selected.has(tool.id));
      const monthlyTotal = chosen.reduce((sum, tool) => sum + monthlyCost(tool, users), 0);
      const tier = activeTier();
      const fragmentedYear = monthlyTotal * 12;
      const katanaMonthVal = tier.price * users;
      const katanaYear = katanaMonthVal * 12;
      const savings = Math.max(0, fragmentedYear - katanaYear);
      const savingsPercent = monthlyTotal > 0 ? Math.round((savings / fragmentedYear) * 100) : 0;

      if (katanaTierName) katanaTierName.textContent = tier.name;
      if (katanaTierPrice) katanaTierPrice.textContent = `${formatMoneyExact(tier.price)}/seat/mo`;
      if (toolCountEl) toolCountEl.textContent = String(chosen.length);

      if (chosen.length === 0) {
        if (emptyState) emptyState.hidden = false;
        replaceList.innerHTML = "";
        if (replaceMonth) replaceMonth.textContent = formatMoneyExact(0);
        replaceTotal.textContent = `${formatMoneyExact(0)} / year`;
        if (katanaMonth) katanaMonth.textContent = formatMoneyExact(katanaMonthVal);
        katanaTotal.textContent = `${formatMoneyExact(katanaYear)} / year`;
        savingsAmount.textContent = formatMoneyExact(0);
        if (savingsPct) savingsPct.textContent = "Select tools to see the cut.";
        return;
      }

      if (emptyState) emptyState.hidden = true;
      replaceList.innerHTML = chosen
        .map((tool) => {
          const month = monthlyCost(tool, users);
          return `
            <li>
              <span>
                <strong>${tool.name}</strong>
                <em>${tool.plan} · ${lineRateLabel(tool, users)}</em>
              </span>
              <span>${formatMoneyExact(month)}/mo</span>
            </li>
          `;
        })
        .join("");

      if (replaceMonth) replaceMonth.textContent = formatMoneyExact(monthlyTotal);
      replaceTotal.textContent = `${formatMoneyExact(fragmentedYear)} / year`;
      if (katanaMonth) katanaMonth.textContent = formatMoneyExact(katanaMonthVal);
      katanaTotal.textContent = `${formatMoneyExact(katanaYear)} / year`;
      savingsAmount.textContent = formatMoneyExact(savings);
      if (savingsPct) {
        savingsPct.textContent =
          savingsPercent > 0
            ? `${savingsPercent}% less than ${chosen.length} separate subscriptions — for one connected Katana workspace.`
            : "Your stack is already lean at this seat count.";
      }
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
      userInput.value = String(users);
    }

    renderTools();
    renderTiers();
    renderTotals();
  };

  document.querySelectorAll("[data-stack-cut]").forEach(initStackCut);
})();
