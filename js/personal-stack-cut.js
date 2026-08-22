(() => {
  /**
   * Katana Personal Stack Cut — fragmented life apps vs Personal Free / Plus.
   * Money: public US list rates (prefer annual effective $/mo when published).
   * Time: estimated daily admin / context-switch minutes (not the workout or habit itself).
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
          minutesPerDay: 8,
          source: "todoist.com · $5/mo billed annually",
        },
        {
          id: "ticktick",
          name: "TickTick",
          plan: "Premium",
          model: "flat",
          price: 2.99,
          minutesPerDay: 8,
          source: "Published Premium list · monthly",
        },
        {
          id: "reminders-diy",
          name: "Reminders / Notes",
          plan: "Free DIY",
          model: "flat",
          price: 0,
          minutesPerDay: 12,
          source: "Built-in free lists · higher switch cost",
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
          minutesPerDay: 12,
          source: "notion.com/pricing · $10/member/mo",
        },
        {
          id: "evernote",
          name: "Evernote",
          plan: "Personal",
          model: "flat",
          price: 14.99,
          minutesPerDay: 10,
          source: "Published Personal list · monthly",
        },
        {
          id: "notes-diy",
          name: "Apple Notes / Docs",
          plan: "Free DIY",
          model: "flat",
          price: 0,
          minutesPerDay: 14,
          source: "Free notes · plans live elsewhere",
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
          minutesPerDay: 15,
          source: "openai.com · ChatGPT Plus $20/mo",
        },
        {
          id: "claude",
          name: "Claude",
          plan: "Pro",
          model: "flat",
          price: 20,
          minutesPerDay: 15,
          source: "claude.ai · Pro $20/mo",
        },
        {
          id: "chat-diy",
          name: "Free chat / journal",
          plan: "Free DIY",
          model: "flat",
          price: 0,
          minutesPerDay: 22,
          source: "Re-explain your day each time · no shared context",
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
          minutesPerDay: 6,
          source: "finchcare.com · Plus $9.99/mo",
        },
        {
          id: "habitica",
          name: "Habitica",
          plan: "Subscription",
          model: "flat",
          price: 4.99,
          minutesPerDay: 7,
          source: "Published subscription list · monthly",
        },
        {
          id: "habits-diy",
          name: "Paper / spreadsheet",
          plan: "Free DIY",
          model: "flat",
          price: 0,
          minutesPerDay: 9,
          source: "Free tracking · easy to abandon",
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
          minutesPerDay: 5,
          source: "Published Premium list · ~$4.99/mo",
        },
        {
          id: "hevy",
          name: "Hevy",
          plan: "Pro",
          model: "flat",
          price: 2.99,
          minutesPerDay: 5,
          source: "Published Pro list · monthly",
        },
        {
          id: "fitness-diy",
          name: "Notes / Sheets log",
          plan: "Free DIY",
          model: "flat",
          price: 0,
          minutesPerDay: 8,
          source: "Free workout notes · no day link",
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
          minutesPerDay: 10,
          source: "Annual Premium effective ~$6.67/mo ($79.99/yr)",
        },
        {
          id: "calm",
          name: "Calm",
          plan: "Premium",
          model: "flat",
          price: 14.99,
          minutesPerDay: 6,
          source: "Published Premium list · monthly",
        },
        {
          id: "wellness-diy",
          name: "Free food / water log",
          plan: "Free DIY",
          model: "flat",
          price: 0,
          minutesPerDay: 12,
          source: "Free logging · another app to open",
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
          minutesPerDay: 6,
          source: "Published Bee Plus list · from ~$8/mo",
        },
        {
          id: "focusmate",
          name: "Focusmate",
          plan: "Plus",
          model: "flat",
          price: 6.99,
          minutesPerDay: 5,
          source: "Published Plus list · monthly",
        },
        {
          id: "together-diy",
          name: "Group chat",
          plan: "Free DIY",
          model: "flat",
          price: 0,
          minutesPerDay: 10,
          source: "iMessage / Discord · wins get buried",
        },
      ],
    },
  ];

  const TIERS = [
    {
      id: "free",
      name: "Free",
      price: 0,
      minutesPerDay: 12,
      note: "Full private day loop",
    },
    {
      id: "plus",
      name: "Plus",
      price: 9.99,
      minutesPerDay: 10,
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

  const formatHours = (hours) => {
    const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: rounded % 1 === 0 ? 0 : 1,
    }).format(rounded);
  };

  const monthlyCost = (tool) => tool.price;
  const dailyMinutes = (tool) => tool.minutesPerDay || 0;
  const rateLabel = (tool) => (tool.price === 0 ? "Free" : `${formatMoney(tool.price)}/mo`);
  const timeLabel = (tool) => `~${dailyMinutes(tool)}m/day`;

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
    const timeScatter = root.querySelector("[data-stack-time-scatter]");
    const timeScatterSub = root.querySelector("[data-stack-time-scatter-sub]");
    const timeKatana = root.querySelector("[data-stack-time-katana]");
    const timeKatanaSub = root.querySelector("[data-stack-time-katana-sub]");
    const timeSavings = root.querySelector("[data-stack-time-savings]");
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
                      <span class="stack-cut__row-model">${timeLabel(tool)}</span>
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
      const scatterMinutes = chosen.reduce((sum, tool) => sum + dailyMinutes(tool), 0);
      const tier = activeTier();
      const fragmentedYear = monthlyTotal * 12;
      const katanaMonthVal = tier.price;
      const katanaYear = katanaMonthVal * 12;
      const savings = Math.max(0, fragmentedYear - katanaYear);
      const savingsPercent = monthlyTotal > 0 ? Math.round((savings / fragmentedYear) * 100) : 0;
      const katanaMinutes = tier.minutesPerDay;
      const minutesSavedPerDay = Math.max(0, scatterMinutes - katanaMinutes);
      const hoursSavedPerYear = (minutesSavedPerDay * 365) / 60;
      const hoursScatteredPerWeek = (scatterMinutes * 7) / 60;

      if (katanaTierName) katanaTierName.textContent = `Personal ${tier.name}`;
      if (katanaTierPrice) {
        katanaTierPrice.textContent =
          tier.price === 0
            ? `$0/mo · ~${katanaMinutes}m/day loop`
            : `${formatMoneyExact(tier.price)}/mo · ~${katanaMinutes}m/day`;
      }
      if (toolCountEl) toolCountEl.textContent = String(chosen.length);

      if (timeKatana) timeKatana.textContent = `${katanaMinutes} min / day`;
      if (timeKatanaSub) {
        timeKatanaSub.textContent =
          tier.id === "plus" ? "One loop · Ask already has context" : "One calm day loop";
      }

      if (chosen.length === 0) {
        if (emptyState) emptyState.hidden = false;
        replaceList.innerHTML = "";
        if (replaceMonth) replaceMonth.textContent = formatMoneyExact(0);
        replaceTotal.textContent = `${formatMoneyExact(0)} / year`;
        katanaTotal.textContent = `${formatMoneyExact(katanaYear)} / year`;
        savingsAmount.textContent = formatMoneyExact(0);
        if (timeScatter) timeScatter.textContent = "0 min / day";
        if (timeScatterSub) timeScatterSub.textContent = "Select apps or free DIY";
        if (timeSavings) timeSavings.textContent = "0";
        if (savingsPct) savingsPct.textContent = "Select apps — paid or free — to see money and time.";
        return;
      }

      if (emptyState) emptyState.hidden = true;
      replaceList.innerHTML = chosen
        .map((tool) => {
          const month = monthlyCost(tool);
          const mins = dailyMinutes(tool);
          return `
            <li>
              <span>
                <strong>${tool.name}</strong>
                <em>${tool.plan} · ~${mins}m/day · ${tool.source}</em>
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
      if (timeScatter) timeScatter.textContent = `${scatterMinutes} min / day`;
      if (timeScatterSub) {
        timeScatterSub.textContent = `${formatHours(hoursScatteredPerWeek)} hrs/week across ${chosen.length} places`;
      }
      if (timeSavings) timeSavings.textContent = formatHours(hoursSavedPerYear);

      if (savingsPct) {
        const moneyBit =
          monthlyTotal > 0 && savingsPercent > 0
            ? `${savingsPercent}% less money`
            : monthlyTotal === 0
              ? "No subscription cost"
              : "Lean on money";
        const timeBit =
          minutesSavedPerDay > 0
            ? `${minutesSavedPerDay} min/day back (~${formatHours(hoursSavedPerYear)} hrs/yr)`
            : "time already close";
        savingsPct.textContent = `${moneyBit} · ${timeBit} — one daily OS instead of ${chosen.length} switches.`;
      }
    };

    renderTabs();
    renderTools();
    renderTiers();
    renderTotals();
  };

  document.querySelectorAll('[data-stack-cut="personal"]').forEach(init);
})();
