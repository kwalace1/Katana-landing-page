(() => {
  /**
   * Katana Personal Stack Cut — fragmented life apps vs Personal Free / Plus.
   * Prices are public US list rates (prefer annual effective $/mo when published).
   */
  const TOOL_GROUPS = [
    {
      moduleId: "today",
      moduleName: "Today & tasks",
      tools: [
        {
          id: "todoist",
          name: "Todoist",
          plan: "Pro",
          model: "flat",
          price: 5,
          source: "todoist.com · $5/mo billed annually",
        },
        {
          id: "ticktick",
          name: "TickTick",
          plan: "Premium",
          model: "flat",
          price: 2.99,
          source: "Published Premium list · monthly",
        },
        {
          id: "microsoft-todo",
          name: "Microsoft To Do",
          plan: "Free",
          model: "flat",
          price: 0,
          source: "Free tier · limited vs Pro stacks",
        },
      ],
    },
    {
      moduleId: "notes",
      moduleName: "Notes & plans",
      tools: [
        {
          id: "notion",
          name: "Notion",
          plan: "Plus",
          model: "flat",
          price: 10,
          source: "notion.com/pricing · $10/member/mo",
        },
        {
          id: "evernote",
          name: "Evernote",
          plan: "Personal",
          model: "flat",
          price: 14.99,
          source: "Published Personal list · monthly",
        },
        {
          id: "obsidian-sync",
          name: "Obsidian Sync",
          plan: "Sync",
          model: "flat",
          price: 4,
          source: "obsidian.md · Sync ~$4/mo billed annually",
        },
      ],
    },
    {
      moduleId: "ask",
      moduleName: "Ask / AI guide",
      tools: [
        {
          id: "chatgpt",
          name: "ChatGPT",
          plan: "Plus",
          model: "flat",
          price: 20,
          source: "openai.com · ChatGPT Plus $20/mo",
        },
        {
          id: "claude",
          name: "Claude",
          plan: "Pro",
          model: "flat",
          price: 20,
          source: "claude.ai · Pro $20/mo",
        },
        {
          id: "gemini",
          name: "Google Gemini",
          plan: "Google AI Pro",
          model: "flat",
          price: 19.99,
          source: "Published Google AI Pro list · monthly",
        },
      ],
    },
    {
      moduleId: "habits",
      moduleName: "Habits",
      tools: [
        {
          id: "finch",
          name: "Finch",
          plan: "Plus",
          model: "flat",
          price: 9.99,
          source: "finchcare.com · Plus $9.99/mo",
        },
        {
          id: "habitica",
          name: "Habitica",
          plan: "Subscription",
          model: "flat",
          price: 4.99,
          source: "Published subscription list · monthly",
        },
        {
          id: "streaks",
          name: "Streaks",
          plan: "App Store",
          model: "flat",
          price: 4.99,
          source: "One-time app price shown as month-1 estimate",
        },
      ],
    },
    {
      moduleId: "fitness",
      moduleName: "Fitness",
      tools: [
        {
          id: "strong",
          name: "Strong",
          plan: "Premium",
          model: "flat",
          price: 4.99,
          source: "Published Premium list · ~$4.99/mo",
        },
        {
          id: "hevy",
          name: "Hevy",
          plan: "Pro",
          model: "flat",
          price: 2.99,
          source: "Published Pro list · monthly",
        },
        {
          id: "fitbod",
          name: "Fitbod",
          plan: "Premium",
          model: "flat",
          price: 12.99,
          source: "Published Premium list · monthly",
        },
      ],
    },
    {
      moduleId: "wellness",
      moduleName: "Wellness",
      tools: [
        {
          id: "mfp",
          name: "MyFitnessPal",
          plan: "Premium",
          model: "flat",
          price: 6.67,
          source: "Annual Premium effective ~$6.67/mo ($79.99/yr)",
        },
        {
          id: "calm",
          name: "Calm",
          plan: "Premium",
          model: "flat",
          price: 14.99,
          source: "Published Premium list · monthly",
        },
        {
          id: "headspace",
          name: "Headspace",
          plan: "Premium",
          model: "flat",
          price: 12.99,
          source: "Published Premium list · monthly",
        },
      ],
    },
    {
      moduleId: "together",
      moduleName: "Together",
      tools: [
        {
          id: "beeminder",
          name: "Beeminder",
          plan: "Bee Plus",
          model: "flat",
          price: 8,
          source: "Published Bee Plus list · from ~$8/mo",
        },
        {
          id: "focusmate",
          name: "Focusmate",
          plan: "Plus",
          model: "flat",
          price: 6.99,
          source: "Published Plus list · monthly",
        },
        {
          id: "stickk",
          name: "StickK",
          plan: "Commitment",
          model: "flat",
          price: 0,
          source: "Free stakes product · $0 list (stakes optional)",
        },
      ],
    },
  ];

  const TIERS = [
    {
      id: "free",
      name: "Free",
      price: 0,
      note: "Full private day loop",
    },
    {
      id: "plus",
      name: "Plus",
      price: 9.99,
      note: "Accountability pack · early-access list estimate",
    },
  ];

  const DEFAULT_TOOL_IDS = ["todoist", "notion", "chatgpt", "finch", "strong", "mfp", "beeminder"];

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

  const monthlyCost = (tool) => (tool.model === "flat" ? tool.price : tool.price);
  const modelLabel = () => "Per person / mo";
  const rateLabel = (tool) =>
    tool.price === 0 ? "Free" : `${formatMoney(tool.price)}/mo`;

  const allTools = () =>
    TOOL_GROUPS.flatMap((group) =>
      group.tools.map((tool) => ({
        ...tool,
        moduleId: group.moduleId,
        moduleName: group.moduleName,
      }))
    );

  const init = (root) => {
    const selected = new Set(DEFAULT_TOOL_IDS);
    let tierId = "free";
    let activeModule = TOOL_GROUPS[0].moduleId;
    const ctaHref = root.dataset.stackCta || "#join";

    const toolList = root.querySelector("[data-stack-tools]");
    const tabList = root.querySelector("[data-stack-tabs]");
    const tierPicker = root.querySelector("[data-stack-tiers]");
    const replaceList = root.querySelector("[data-stack-replace-list]");
    const replaceTotal = root.querySelector("[data-stack-replace-total]");
    const replaceMonth = root.querySelector("[data-stack-replace-month]");
    const katanaTotal = root.querySelector("[data-stack-katana-total]");
    const katanaTierName = root.querySelector("[data-stack-katana-tier]");
    const katanaTierPrice = root.querySelector("[data-stack-katana-price]");
    const savingsAmount = root.querySelector("[data-stack-savings]");
    const savingsPct = root.querySelector("[data-stack-savings-pct]");
    const emptyState = root.querySelector("[data-stack-empty]");
    const toolCountEl = root.querySelector("[data-stack-tool-count]");
    const cta = root.querySelector("[data-stack-cta-link]");

    if (cta) cta.setAttribute("href", ctaHref);

    const activeTier = () => TIERS.find((tier) => tier.id === tierId) || TIERS[0];

    const selectedInModule = (moduleId) =>
      TOOL_GROUPS.find((group) => group.moduleId === moduleId).tools.filter((tool) =>
        selected.has(tool.id)
      ).length;

    const renderTabs = () => {
      if (!tabList) return;
      tabList.innerHTML = TOOL_GROUPS.map((group) => {
        const count = selectedInModule(group.moduleId);
        const isOn = group.moduleId === activeModule;
        return `
          <button
            class="stack-cut__tab${isOn ? " is-on" : ""}"
            type="button"
            role="tab"
            aria-selected="${isOn ? "true" : "false"}"
            data-module-tab="${group.moduleId}"
          >
            ${group.moduleName}${count ? `<em>${count}</em>` : ""}
          </button>
        `;
      }).join("");

      tabList.querySelectorAll("[data-module-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeModule = btn.dataset.moduleTab;
          renderTabs();
          renderTools();
        });
      });
    };

    const renderTools = () => {
      const group = TOOL_GROUPS.find((item) => item.moduleId === activeModule) || TOOL_GROUPS[0];
      toolList.innerHTML = `
        <div class="stack-cut__module">
          <div class="stack-cut__rows">
            ${group.tools
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
                      <span class="stack-cut__row-model">${modelLabel()}</span>
                    </span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      `;

      toolList.querySelectorAll("[data-tool-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.toolId;
          if (selected.has(id)) selected.delete(id);
          else selected.add(id);
          renderTabs();
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
            title="${tier.note}"
          >
            <span>${tier.name}</span>
            <strong>${tier.price === 0 ? "Free" : formatMoney(tier.price)}</strong>
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
      const monthlyTotal = chosen.reduce((sum, tool) => sum + monthlyCost(tool), 0);
      const tier = activeTier();
      const fragmentedYear = monthlyTotal * 12;
      const katanaMonthVal = tier.price;
      const katanaYear = katanaMonthVal * 12;
      const savings = Math.max(0, fragmentedYear - katanaYear);
      const savingsPercent = monthlyTotal > 0 ? Math.round((savings / fragmentedYear) * 100) : 0;

      if (katanaTierName) katanaTierName.textContent = `Personal ${tier.name}`;
      if (katanaTierPrice) {
        katanaTierPrice.textContent =
          tier.price === 0 ? "$0/mo · full day loop" : `${formatMoneyExact(tier.price)}/mo · Accountability pack`;
      }
      if (toolCountEl) toolCountEl.textContent = String(chosen.length);

      if (chosen.length === 0) {
        if (emptyState) emptyState.hidden = false;
        replaceList.innerHTML = "";
        if (replaceMonth) replaceMonth.textContent = formatMoneyExact(0);
        replaceTotal.textContent = `${formatMoneyExact(0)} / year`;
        katanaTotal.textContent = `${formatMoneyExact(katanaYear)} / year`;
        savingsAmount.textContent = formatMoneyExact(0);
        if (savingsPct) savingsPct.textContent = "Select apps to see the cut.";
        return;
      }

      if (emptyState) emptyState.hidden = true;
      replaceList.innerHTML = chosen
        .map((tool) => {
          const month = monthlyCost(tool);
          return `
            <li>
              <span>
                <strong>${tool.name}</strong>
                <em>${tool.plan} · ${tool.source}</em>
              </span>
              <span>${month === 0 ? "Free" : `${formatMoneyExact(month)}/mo`}</span>
            </li>
          `;
        })
        .join("");

      if (replaceMonth) replaceMonth.textContent = formatMoneyExact(monthlyTotal);
      replaceTotal.textContent = `${formatMoneyExact(fragmentedYear)} / year`;
      katanaTotal.textContent = `${formatMoneyExact(katanaYear)} / year`;
      savingsAmount.textContent = formatMoneyExact(savings);
      if (savingsPct) {
        savingsPct.textContent =
          savingsPercent > 0
            ? `${savingsPercent}% less than ${chosen.length} separate life apps — one calm daily OS.`
            : "Your stack is already lean.";
      }
    };

    renderTabs();
    renderTools();
    renderTiers();
    renderTotals();
  };

  document.querySelectorAll('[data-stack-cut="personal"]').forEach(init);
})();
