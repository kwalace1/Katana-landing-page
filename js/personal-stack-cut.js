(() => {
  /**
   * Katana Personal Stack Cut — fragmented life apps vs Personal Free / Plus.
   * Money: public US list rates (prefer annual effective $/mo when published).
   * Time: category averages from published research + a multi-app switch tax
   *        capped to Qatalog/Cornell daily switching figures. See SOURCES.
   */
  const SOURCES = [
    {
      id: "hbr-toggle",
      title: "Harvard Business Review (2022)",
      detail:
        "Workplace study: digital workers toggled apps ~1,200×/day; just under 4 hours/week reorienting (~34 min/day). Used only to inform our switch-model cap — not a Katana result.",
      url: "https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications",
    },
    {
      id: "qatalog",
      title: "Qatalog × Cornell Workgeist (2021)",
      detail:
        "Workplace survey reporting: ~36 min/day switching between apps and ~59 min/day searching across tools. Informs our 36 min/day switch-model cap — not an endorsement.",
      url: "https://venturebeat.com/business/qatalog-people-waste-59-minutes-every-day-trying-to-find-data-in-apps",
    },
    {
      id: "harvey-food",
      title: "Harvey et al., Obesity (2019)",
      detail:
        "Weight-loss program food diaries: 23.2 min/day in month 1, 14.6 min/day by month 6 (UVM / South Carolina). We use ~15 min for Wellness logging.",
      url: "https://doi.org/10.1002/oby.22382",
    },
    {
      id: "semrush-gpt",
      title: "Semrush (ChatGPT visit duration)",
      detail:
        "Reported average ChatGPT web visit ~12–15 minutes. We use 13 min for an Ask/AI category session. Secondary summary linked; figures are traffic analytics, not a Katana study.",
      url: "https://explodingtopics.com/blog/chatgpt-users",
    },
    {
      id: "chi-tasks",
      title: "ACM CHI task-management survey (2024)",
      detail:
        "Most respondents track tasks 2–3×/day. We model ~3–4 min per check-in ≈ 10 min/day for Today & tasks.",
      url: "https://doi.org/10.1145/3663384.3663402",
    },
    {
      id: "chi-social",
      title: "ACM CHI Social Journal study",
      detail:
        "Study participants spent ~8.4 min/day in a social journaling / check-in app. Applied to Habits and Together categories.",
      url: "https://doi.org/10.1145/3613904.3642411",
    },
    {
      id: "journal-range",
      title: "Journaling session norms",
      detail:
        "Industry summaries often place written journaling in a 10–20 min session range; we use 12 min for Notes & plans. Not a controlled trial of Katana.",
      url: "https://getdailyvox.com/voice-journaling-statistics",
    },
    {
      id: "fitness-est",
      title: "Fitness logging estimate (Katana model)",
      detail:
        "Peer-reviewed daily averages for lift-logging apps are scarce. We use ~6 min (about 1 min × 5–6 exercises between sets) as our own estimate — not a published study average.",
      url: null,
    },
  ];

  /** Research-backed minutes for each Personal category (in-app activity, not the workout itself). */
  const CATEGORY_TIME = {
    today: { minutes: 10, sourceId: "chi-tasks", label: "Task check-ins" },
    notes: { minutes: 12, sourceId: "journal-range", label: "Notes & planning" },
    ask: { minutes: 13, sourceId: "semrush-gpt", label: "AI / Ask session" },
    habits: { minutes: 8, sourceId: "chi-social", label: "Habit check-ins" },
    fitness: { minutes: 6, sourceId: "fitness-est", label: "Workout logging" },
    wellness: { minutes: 15, sourceId: "harvey-food", label: "Food / wellness logging" },
    together: { minutes: 8, sourceId: "chi-social", label: "Social / accountability" },
  };

  /**
   * Multi-app switch model: 5 min per extra app, capped at 36 min/day.
   * Cap informed by Qatalog (~36 min/day switching) and HBR (~34 min/day reorientation)
   * workplace findings — adapted into this calculator; not those studies' conclusions about Katana.
   */
  const SWITCH_TAX = {
    minutesPerExtraApp: 5,
    capMinutes: 36,
    sourceIds: ["hbr-toggle", "qatalog"],
  };

  const DIY_TIME_FACTOR = 1.25;

  const TOOL_GROUPS = [
    {
      moduleId: "today",
      moduleName: "Today & tasks",
      tools: [
        {
          id: "todoist",
          name: "Todoist",
          plan: "Pro",
          price: 5,
          source: "todoist.com · $5/mo billed annually",
        },
        {
          id: "ticktick",
          name: "TickTick",
          plan: "Premium",
          price: 2.99,
          source: "Published Premium list · monthly",
        },
        {
          id: "reminders-diy",
          name: "Reminders / Notes",
          plan: "Free DIY",
          price: 0,
          diy: true,
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
          price: 10,
          source: "notion.com/pricing · $10/member/mo",
        },
        {
          id: "evernote",
          name: "Evernote",
          plan: "Personal",
          price: 14.99,
          source: "Published Personal list · monthly",
        },
        {
          id: "notes-diy",
          name: "Apple Notes / Docs",
          plan: "Free DIY",
          price: 0,
          diy: true,
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
          price: 20,
          source: "openai.com · ChatGPT Plus $20/mo",
        },
        {
          id: "claude",
          name: "Claude",
          plan: "Pro",
          price: 20,
          source: "claude.ai · Pro $20/mo",
        },
        {
          id: "chat-diy",
          name: "Free chat / journal",
          plan: "Free DIY",
          price: 0,
          diy: true,
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
          price: 9.99,
          source: "finchcare.com · Plus $9.99/mo",
        },
        {
          id: "habitica",
          name: "Habitica",
          plan: "Subscription",
          price: 4.99,
          source: "Published subscription list · monthly",
        },
        {
          id: "habits-diy",
          name: "Paper / spreadsheet",
          plan: "Free DIY",
          price: 0,
          diy: true,
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
          price: 4.99,
          source: "Published Premium list · ~$4.99/mo",
        },
        {
          id: "hevy",
          name: "Hevy",
          plan: "Pro",
          price: 2.99,
          source: "Published Pro list · monthly",
        },
        {
          id: "fitness-diy",
          name: "Notes / Sheets log",
          plan: "Free DIY",
          price: 0,
          diy: true,
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
          price: 6.67,
          source: "Annual Premium effective ~$6.67/mo ($79.99/yr)",
        },
        {
          id: "calm",
          name: "Calm",
          plan: "Premium",
          price: 14.99,
          source: "Published Premium list · monthly",
        },
        {
          id: "wellness-diy",
          name: "Free food / water log",
          plan: "Free DIY",
          price: 0,
          diy: true,
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
          price: 8,
          source: "Published Bee Plus list · from ~$8/mo",
        },
        {
          id: "focusmate",
          name: "Focusmate",
          plan: "Plus",
          price: 6.99,
          source: "Published Plus list · monthly",
        },
        {
          id: "together-diy",
          name: "Group chat",
          plan: "Free DIY",
          price: 0,
          diy: true,
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
      note: "Full private day loop · one app, no switch tax",
    },
    {
      id: "plus",
      name: "Plus",
      price: 39.99,
      period: "year",
      minutesPerDay: 10,
      note: "Accountability pack · $39.99/year on the App Store",
    },
  ];

  const DEFAULT_TOOL_IDS = ["todoist", "notion", "chatgpt", "finch", "strong", "mfp", "beeminder"];

  const sourceById = (id) => SOURCES.find((item) => item.id === id);

  const categoryMinutesForTool = (tool, moduleId) => {
    const base = CATEGORY_TIME[moduleId]?.minutes || 0;
    return tool.diy ? Math.round(base * DIY_TIME_FACTOR) : base;
  };

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

  const allTools = () =>
    TOOL_GROUPS.flatMap((group) =>
      group.tools.map((tool) => ({
        ...tool,
        moduleId: group.moduleId,
        moduleName: group.moduleName,
        minutesPerDay: categoryMinutesForTool(tool, group.moduleId),
        timeSourceId: CATEGORY_TIME[group.moduleId]?.sourceId,
      }))
    );

  /** Activity minutes counted once per category (highest DIY/paid pick in that category). */
  const activityMinutesByCategory = (chosen) => {
    const byModule = new Map();
    chosen.forEach((tool) => {
      const prev = byModule.get(tool.moduleId) || 0;
      byModule.set(tool.moduleId, Math.max(prev, tool.minutesPerDay));
    });
    return byModule;
  };

  const switchTaxMinutes = (appCount) =>
    Math.min(SWITCH_TAX.capMinutes, Math.max(0, appCount - 1) * SWITCH_TAX.minutesPerExtraApp);

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
    const sourcesList = root.querySelector("[data-stack-sources]");

    if (cta) {
      cta.setAttribute("href", ctaHref);
      if (/^https?:\/\//i.test(ctaHref)) {
        cta.setAttribute("target", "_blank");
        cta.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (sourcesList) {
      sourcesList.innerHTML = SOURCES.map((source) => {
        const link = source.url
          ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}</a>`
          : `<span>${source.title}</span>`;
        return `<li><strong>${link}</strong> — ${source.detail}</li>`;
      }).join("");
    }

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
      const cat = CATEGORY_TIME[group.moduleId];
      const src = sourceById(cat?.sourceId);
      toolList.innerHTML = `
        <div class="stack-cut__module">
          <p class="stack-cut__time-basis">
            Est. time basis: ~${cat.minutes}m/day for ${cat.label}
            ${src ? ` · adapted from ${src.title}` : ""}
            ${group.tools.some((t) => t.diy) ? ` · Free DIY uses ${Math.round(DIY_TIME_FACTOR * 100 - 100)}% more` : ""}
            · illustrative, not proven
          </p>
          <div class="stack-cut__rows">
            ${group.tools
              .map((tool) => {
                const isOn = selected.has(tool.id);
                const mins = categoryMinutesForTool(tool, group.moduleId);
                return `
                  <button
                    class="stack-cut__row${isOn ? " is-on" : ""}"
                    type="button"
                    data-tool-id="${tool.id}"
                    aria-pressed="${isOn ? "true" : "false"}"
                    title="${tool.source}${src ? ` · Time: ${src.title}` : ""}"
                  >
                    <span class="stack-cut__check" aria-hidden="true"></span>
                    <span class="stack-cut__row-main">
                      <span class="stack-cut__row-name">${tool.name}</span>
                      <span class="stack-cut__row-plan">${tool.plan}</span>
                    </span>
                    <span class="stack-cut__row-meta">
                      <span class="stack-cut__row-rate">${tool.price === 0 ? "Free" : `${formatMoney(tool.price)}/mo`}</span>
                      <span class="stack-cut__row-model">~${mins}m/day</span>
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
            <strong>${tier.price === 0 ? "Free" : tier.period === "year" ? `${formatMoney(tier.price)}/yr` : formatMoney(tier.price)}</strong>
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
      const monthlyTotal = chosen.reduce((sum, tool) => sum + tool.price, 0);
      const activityByCat = activityMinutesByCategory(chosen);
      const activityMinutes = [...activityByCat.values()].reduce((sum, n) => sum + n, 0);
      const switchMinutes = switchTaxMinutes(chosen.length);
      const scatterMinutes = activityMinutes + switchMinutes;
      const tier = activeTier();
      const fragmentedYear = monthlyTotal * 12;
      const katanaYear = tier.period === "year" ? tier.price : tier.price * 12;
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
            : tier.period === "year"
              ? `${formatMoneyExact(tier.price)}/yr · ~${katanaMinutes}m/day`
              : `${formatMoneyExact(tier.price)}/mo · ~${katanaMinutes}m/day`;
      }
      if (toolCountEl) toolCountEl.textContent = String(chosen.length);

      if (timeKatana) timeKatana.textContent = `~${katanaMinutes} min / day`;
      if (timeKatanaSub) {
        timeKatanaSub.textContent =
          tier.id === "plus"
            ? "Model: one app · Ask has context · est."
            : "Model: one app · no switch add-on · est.";
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
        if (savingsPct) {
          savingsPct.textContent = "Select apps — paid or free — for an illustrative comparison.";
        }
        return;
      }

      if (emptyState) emptyState.hidden = true;

      const categoryRows = [...activityByCat.entries()].map(([moduleId, mins]) => {
        const group = TOOL_GROUPS.find((item) => item.moduleId === moduleId);
        const cat = CATEGORY_TIME[moduleId];
        const src = sourceById(cat.sourceId);
        const picks = chosen.filter((tool) => tool.moduleId === moduleId).map((tool) => tool.name);
        return `
          <li>
            <span>
              <strong>${group.moduleName}</strong>
              <em>${cat.label} · ${picks.join(", ")} · adapted from ${src ? src.title : "Katana estimate"}</em>
            </span>
            <span>~${mins}m/day est.</span>
          </li>
        `;
      });

      const moneyRows = chosen.map((tool) => {
        return `
          <li>
            <span>
              <strong>${tool.name}</strong>
              <em>${tool.plan} · ${tool.source}</em>
            </span>
            <span>${tool.price === 0 ? "Free" : `${formatMoneyExact(tool.price)}/mo`}</span>
          </li>
        `;
      });

      replaceList.innerHTML = `
        ${moneyRows.join("")}
        <li class="stack-cut__ledger-rule">
          <span><strong>Est. activity time</strong><em>Category averages adapted from published studies (once per category)</em></span>
          <span>~${activityMinutes}m</span>
        </li>
        ${categoryRows.join("")}
        <li>
          <span>
            <strong>Est. multi-app switch add-on</strong>
            <em>${SWITCH_TAX.minutesPerExtraApp}m × ${Math.max(0, chosen.length - 1)} extra apps · capped at ${SWITCH_TAX.capMinutes}m · model informed by workplace switching research (see sources) — not a proven Katana result</em>
          </span>
          <span>~${switchMinutes}m</span>
        </li>
      `;

      if (replaceMonth) replaceMonth.textContent = formatMoneyExact(monthlyTotal);
      replaceTotal.textContent = `${formatMoneyExact(fragmentedYear)} / year`;
      katanaTotal.textContent = `${formatMoneyExact(katanaYear)} / year`;
      savingsAmount.textContent = formatMoneyExact(savings);
      if (timeScatter) timeScatter.textContent = `~${scatterMinutes} min / day`;
      if (timeScatterSub) {
        timeScatterSub.textContent = `~${activityMinutes}m activity + ~${switchMinutes}m switching · ~${formatHours(hoursScatteredPerWeek)} hrs/week est.`;
      }
      if (timeSavings) timeSavings.textContent = formatHours(hoursSavedPerYear);

      if (savingsPct) {
        const moneyBit =
          monthlyTotal > 0 && savingsPercent > 0
            ? `~${savingsPercent}% less money on list prices`
            : monthlyTotal === 0
              ? "No subscription cost on this stack"
              : "Lean on money";
        const timeBit =
          minutesSavedPerDay > 0
            ? `~${minutesSavedPerDay} min/day less in this model (~${formatHours(hoursSavedPerYear)} hrs/yr est.)`
            : "time already close in this model";
        savingsPct.textContent = `${moneyBit} · ${timeBit}. Illustrative estimate only — not proven savings; sources do not endorse Katana.`;
      }
    };

    renderTabs();
    renderTools();
    renderTiers();
    renderTotals();
  };

  document.querySelectorAll('[data-stack-cut="personal"]').forEach(init);
})();
