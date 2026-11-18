(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      collector: "Kabir Sen",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the screening kit. The film starts at 4 pm.",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "Partial return",
      text: "Kabir brings back the projector and speaker. Leela Das has the adapter and will bring it tomorrow at 9 am.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "Leela is at the counter with an adapter. Match it to the open loan.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const dueTimes = ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"];
  const equipmentIcons = {
    "HDMI projector": "screening",
    "Portable speaker": "speaker",
    "USB-C → HDMI adapter": "adapter",
    "Wireless microphone": "microphone",
    "Digital camera": "camera",
  };
  const requestIcons = ["screening", "microphone", "camera"];
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    notice: "Fictional sample shift",
  });
  let s = original();
  let handoverLoan = null;
  let returningLoan = null;
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const available = (a) => !a.repair && !out(a.id);
  const loanType = (l) => getAsset(l.asset).type;
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, selected) =>
    list
      .map(([v, t]) => '<option value="' + esc(v) + '"' +
        (v === selected ? " selected" : "") + ">" + esc(t) + "</option>")
      .join("");
  const icon = (name) => '<svg aria-hidden="true" class="store-icon"><use href="#icon-' +
    name + '"></use></svg>';
  const stamp = (name) => '<span class="row-icon">' + icon(name) + '</span>';
  const btn = (label, act, val = "", style = "", symbol = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) + (symbol ? icon(symbol) : "") +
    "</button>";
  const head = (title, sub = "", control = "") =>
    '<div class="sectionhead"><div><h2 tabindex="-1">' + esc(title) + '</h2>' +
    (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + control + '</div>';
  const row = (symbol, label, sub, right, style = "") =>
    '<div class="row ' + style + '">' + stamp(symbol) +
    '<div class="row-main"><strong>' + esc(label) + '</strong><small>' + esc(sub) +
    '</small></div><div class="row-action">' + right + '</div></div>';
  const badge = (text, style = "neutral") =>
    '<span class="tag ' + style + '">' + esc(text) + '</span>';
  const assetOptions = (units) => units.map((a) => [a.id, a.id + " · " + a.model + " · " + a.bin]);
  const personOptions = people.map((p) => [p, p]);
  const select = (label, name, choices, selected = "", attrs = "") =>
    '<label><span>' + esc(label) + '</span><select name="' + name + '" required ' + attrs + '>' +
    opts([["", "Select…"], ...choices], selected) + '</select></label>';
  const formError = '<p class="form-error" role="alert" hidden></p>';

  function checklist(request) {
    const slips = s.loans.filter((l) => l.req === request.id);
    return request.items.map((type) => ({
      type,
      loan: slips.find((l) => loanType(l) === type && !l.back) ??
        slips.findLast((l) => loanType(l) === type),
      choices: assets.filter((a) => a.type === type && available(a)),
    }));
  }

  function requestStatus(kit) {
    if (kit.some(({ loan }) => loan) && kit.some(({ loan }) => !loan)) {
      return badge("Kit incomplete", "warn");
    }
    if (kit.some(({ loan }) => loan && !loan.back)) {
      return kit.some(({ loan }) => loan?.back)
        ? badge("Partial return", "warn") : badge("On loan", "warn");
    }
    if (kit.every(({ loan }) => loan?.back)) return badge("Returned", "good");
    return badge("Approved");
  }

  function requestPage() {
    if (s.selected) return requestDetail(getReq(s.selected));
    return head("Approved requests") + '<div class="queue">' + requests.map((r, index) => {
      const priority = index === 0;
      return row(requestIcons[index], r.event, r.club + " · " + r.id + returnProgress(checklist(r)),
        requestStatus(checklist(r)) + btn("Open request", "request", r.id, priority ? "primary" : "", "arrow"),
        priority ? "priority" : "");
    }).join("") + '</div>';
  }

  function returnProgress(kit) {
    if (!kit.every(({ loan }) => loan)) return "";
    return " · " + kit.filter(({ loan }) => loan.back).length + " of " + kit.length + " returned";
  }

  function requestDetail(r) {
    const kit = checklist(r);
    const needsIssue = kit.some(({ loan }) => !loan);
    const ready = kit.every(({ loan, choices }) => loan || choices.length);
    const rows = kit.map((entry, index) => ({ entry, index }));
    // Keep outstanding equipment above completed returns without changing form field names.
    rows.sort((a, b) => Number(Boolean(a.entry.loan?.back)) - Number(Boolean(b.entry.loan?.back)));
    let html = '<div class="detail-top">' + btn("← All requests", "close", "", "text-button") +
      requestStatus(kit) + '</div>' + head(r.event, r.club + " · " + r.id + returnProgress(kit)) +
      '<div class="detail-meta"><span>Filed by <strong>' + esc(r.owner) +
      '</strong></span><span>Return by <strong>' + esc(r.due) + '</strong></span></div>' +
      (needsIssue ? '<p class="record">' + esc(r.note) + '</p>' : '') +
      '<div class="kit-grid"><h3>Equipment checklist</h3>' +
      rows.map(({ entry, index }) => kitLine(entry, index, ready)).join("") + '</div>';
    if (needsIssue && !ready) {
      return html + '<p class="empty">A kit item is unavailable. Use the loan register to issue items individually.</p>';
    }
    if (needsIssue) {
      html += '<form class="checkout" id="kit-issue" data-kit-issue><div class="form">' +
        select("Collected by", "who", personOptions, r.collector) + '</div>' +
        (r.collector ? '<small>' + esc(r.owner) + ' confirmed that ' + esc(r.collector) +
          ' can collect the kit.</small>' : '') + '<div class="checkout-actions">' + formError +
        '<button type="submit" class="primary">Issue equipment' + icon("arrow") + '</button></div></form>';
    }
    return html;
  }

  function kitLine({ type, loan, choices }, index, ready) {
    const unit = loan && getAsset(loan.asset);
    let action;
    if (loan) action = returnAction(loan, "primary");
    else if (ready) action = select("Unit for " + type, "kit-" + index, assetOptions(choices),
      choices.length === 1 ? choices[0].id : "", 'form="kit-issue"');
    else action = choices.length ? badge("On shelf", "good") : badge("Unavailable", "warn");
    return '<div class="kit-item" data-kit-type="' + esc(type) + '">' + stamp(equipmentIcons[type]) +
      '<div class="row-main"><strong>' + esc(type) + '</strong>' +
      (unit ? '<small>' + esc(unit.id + " · " + unit.model) + '</small>' : '') +
      '</div><div class="row-action">' + action + '</div>' +
      (loan && !loan.back ? loanDetails(loan) : '') + '</div>';
  }

  function returnAction(l, style = "") {
    return l.back ? badge("Returned", "good") : btn("Record return", "return", l.num, style);
  }

  function loanDetails(l) {
    if (l.back) return '<div class="kit-extra"><small>' +
      (l.returnedAt ? 'Returned ' + esc(l.returnedAt) + ' · Received from ' + esc(l.returnedBy) :
        'Returned · Return time was not recorded') + '</small></div>';
    const summary = l.handover && !l.back ? '<p class="handover-summary"><strong>Handover</strong> ' +
      esc(l.handover.contact) + ' · Expected ' + esc(l.handover.expected) + '</p>' : '';
    return '<div class="kit-extra"><small>Collected by ' + esc(l.who) + ' · Due ' + esc(l.due) +
      '</small>' + summary + (returningLoan === l.num ? returnForm(l) : handoverLoan === l.num ? handoverForm(l) :
        btn(l.handover ? "Edit handover" : "Add handover", "handover", l.num, "text-button")) + '</div>';
  }

  function returnForm(l) {
    return '<form class="return-form" data-return="' + l.num + '"><div class="form">' +
      '<label><span>Unit ID on the equipment</span><input name="unit" required maxlength="20" ' +
      'placeholder="Read or scan the label" autocomplete="off" autocapitalize="characters" value="' +
      '"></label>' +
      '<label><span>Returned by</span><input name="returnedBy" required maxlength="60" value="' +
      esc(l.handover?.contact ?? l.who) + '"></label></div>' + formError +
      '<div class="checkout-actions">' + btn('Cancel', 'cancel-return', l.num, 'text-button') +
      '<button type="submit" class="primary">Confirm return</button></div></form>';
  }

  function handoverForm(l) {
    return '<form class="handover" data-handover="' + l.num + '"><div class="form">' +
      '<label><span>Returning with this unit</span><input name="contact" maxlength="60" required value="' +
      esc(l.handover?.contact ?? "") + '"></label>' +
      '<label><span>Expected at the counter</span><input name="expected" maxlength="60" required value="' +
      esc(l.handover?.expected ?? "") + '"></label></div>' + formError +
      '<div class="checkout-actions">' + btn("Cancel", "cancel-handover", l.num, "text-button") +
      '<button type="submit" class="primary">Save handover</button></div></form>';
  }
  function inventory() {
    const filter = '<label class="buttons">Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label>";
    let html = head("Inventory", "", filter) + '<div class="queue">';
    let hasItems = false;
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      hasItems = true;
      html += row(
        equipmentIcons[a.type], a.type, a.id + " · " + a.model + " · " + a.bin,
        badge(status, status === "On shelf" ? "good" : "warn"),
      );
    }
    return html + (hasItems ? '' : '<p class="empty">No items match this filter.</p>') + '</div>';
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit.",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      return (
        html +
        '<form class="checkout" data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          assets.filter(available).map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          personOptions,
        ) +
        select(
          "Return by",
          "due",
          dueTimes.map((d) => [d, d]),
        ) +
        '</div>' + formError + '<button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) return html + '<p class="empty">No outstanding slips.</p>';
    return html + '<div class="kit-grid">' + shown.map((l) => {
      const a = getAsset(l.asset);
      return '<div class="kit-item">' + stamp(equipmentIcons[a.type]) +
        '<div class="row-main"><strong>' + esc(a.type) + '</strong><small>' +
        esc(a.id + ' · L-' + l.num + ' · ' + getReq(l.req).club) + '</small></div>' +
        '<div class="row-action">' + returnAction(l) + '</div>' + loanDetails(l) + '</div>';
    }).join('') + '</div>';
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Club messages and general shift notes.",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    html += '<div class="message-list">';
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '</div><form class="checkout" data-note><div class="form"><label class="full"><span>General handover note</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div>' + formError + '<button type="submit">Add note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    q("[data-advance-label]").textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '">' +
          '<svg aria-hidden="true" class="store-icon"><use href="#icon-' + icon + '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
    q('[data-action="undo-return"]').hidden = !s.lastReturn ||
      !s.loans.some((l) => l.num === s.lastReturn && l.back && !out(l.asset));
  }
  function commit(msg, focus) {
    if (msg) s.notice = msg;
    paint();
    if (focus) (q(focus) || q('[data-page] h2'))?.focus();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  const actionSelector = (act, val) => '[data-action="' + act + '"][data-val="' + CSS.escape(String(val)) + '"]';
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    let focus = v === undefined ? "" : actionSelector(b.dataset.action, v);
    switch (b.dataset.action) {
      case "restart":
        s = original();
        handoverLoan = null;
        returningLoan = null;
        focus = '[data-page] h2';
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        returningLoan = null;
        if (!shifts[s.phase].next) focus = '[data-shift-title]';
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        handoverLoan = null;
        returningLoan = null;
        break;
      case "close":
        focus = actionSelector("request", s.selected);
        s.selected = "";
        handoverLoan = null;
        returningLoan = null;
        break;
      case "request":
        s.selected = v;
        focus = '[data-page] h2';
        break;
      case "new":
        s.editing = true;
        focus = '[data-issue] select';
        break;
      case "cancel":
        s.editing = false;
        focus = actionSelector("new", "");
        break;
      case "scope":
        s.onlyOpen = v === "0";
        handoverLoan = null;
        returningLoan = null;
        break;
      case "handover":
        returningLoan = null;
        handoverLoan = Number(v);
        focus = '[data-handover] input';
        break;
      case "cancel-handover":
        handoverLoan = null;
        focus = actionSelector("handover", v);
        break;
      case "return": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        returningLoan = l.num;
        handoverLoan = null;
        focus = '[data-return] input';
        break;
      }
      case "cancel-return":
        returningLoan = null;
        focus = actionSelector("return", v);
        break;
      case "undo-return": {
        const loan = s.loans.find((l) => l.num === s.lastReturn && l.back);
        if (!loan || out(loan.asset)) return;
        loan.back = false;
        delete loan.returnedAt;
        delete loan.returnedBy;
        s.lastReturn = null;
        s.notice = loan.asset + " return undone. Loan is open again.";
        focus = '[data-page] h2';
        break;
      }
      default:
        return;
    }
    commit("", focus);
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit("", "[data-filter]");
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return showFormError(f, "Enter a note before saving.");
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.", "[data-note] textarea");
      return;
    }
    if (f.matches("[data-return]")) {
      const loan = s.loans.find((l) => l.num === Number(f.dataset.return) && !l.back);
      if (!loan) return showFormError(f, "This loan is already closed.");
      const unit = String(form.get("unit") ?? "").trim().toUpperCase().replace(/\s+/g, "");
      const returnedBy = String(form.get("returnedBy") ?? "").trim();
      if (unit !== loan.asset) {
        return showFormError(f, "The label must match " + loan.asset + ". This loan is still open.");
      }
      if (!returnedBy || returnedBy.length > 60) {
        return showFormError(f, "Enter who brought this unit back, up to 60 characters.");
      }
      loan.back = true;
      loan.returnedAt = shifts[s.phase].time;
      loan.returnedBy = returnedBy;
      s.lastReturn = loan.num;
      returningLoan = null;
      commit(loan.asset + " returned to shelf " + getAsset(loan.asset).bin + ".", "[data-page] h2");
      return;
    }
    if (f.matches("[data-handover]")) {
      const loan = s.loans.find((l) => l.num === Number(f.dataset.handover) && !l.back);
      if (!loan) return showFormError(f, "This unit is no longer on loan.");
      const contact = String(form.get("contact") ?? "").trim();
      const expected = String(form.get("expected") ?? "").trim();
      if (!contact || !expected || contact.length > 60 || expected.length > 60) {
        return showFormError(f, "Enter a name and expected return time, up to 60 characters each.");
      }
      loan.handover = { contact, expected };
      handoverLoan = null;
      commit("Handover saved for " + loan.asset + ".", actionSelector("handover", loan.num));
      return;
    }
    if (f.matches("[data-kit-issue]")) {
      const r = getReq(s.selected);
      const units = checklist(r).flatMap(({ type, loan }, index) => {
        if (loan) return [];
        const unit = getAsset(form.get("kit-" + index));
        return [unit?.type === type ? unit : undefined];
      });
      issue(f, r, units, form.get("who"), r.due);
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    issue(f, getReq(req), [getAsset(asset)], who, due);
  });
  function showFormError(form, message) {
    const error = form.querySelector('.form-error');
    error.hidden = false;
    error.textContent = message;
  }
  function issue(form, r, units, who, due) {
    if (!r || !people.includes(who) || !dueTimes.includes(due)) {
      return showFormError(form, "Choose an approved request, collector and return time.");
    }
    if (!units.length || units.some((a) => !a || !r.items.includes(a.type))) {
      return showFormError(form, "Choose units that match the approved equipment.");
    }
    if (units.some((a) => !available(a))) {
      return showFormError(form, "A selected unit is unavailable. Choose a unit on the shelf.");
    }
    const types = new Set(units.map((a) => a.type));
    if (types.size !== units.length || s.loans.some((l) =>
      l.req === r.id && !l.back && types.has(loanType(l)))) {
      return showFormError(form, "The approved quantity of this equipment is already on loan.");
    }
    let num = Math.max(...s.loans.map((l) => l.num));
    for (const a of units) s.loans.push({ num: ++num, req: r.id, asset: a.id, who, due, back: false });
    s.editing = false;
    const label = units.length === 1 ? units[0].id : "Equipment";
    commit(label + " issued to " + who + ".", "[data-page] h2");
  }
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
