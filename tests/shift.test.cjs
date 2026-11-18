const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

// Exercise the standalone app's UI event handlers without a dependency on a
// browser runner. The test supplies the DOM and storage methods they call.
function openDesk(saved) {
  const listeners = new Map();
  const nodes = new Map();
  const querySelector = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, { focus() {} });
    return nodes.get(selector);
  };
  const root = {
    querySelector,
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
  };

  vm.runInNewContext(script, {
    CSS: { escape: String },
    document: { getElementById: () => root, querySelector },
    localStorage: {
      getItem: (key) => saved.get(key),
      setItem: (key, value) => saved.set(key, value),
    },
    FormData: class {
      constructor(form) { this.values = form.values; }
      get(name) { return this.values[name] ?? null; }
    },
  });

  return {
    click(action, val) {
      listeners.get("click")({
        target: { closest: () => ({ dataset: { action, val: String(val ?? "") } }) },
      });
    },
    submit(selector, values, dataset = {}) {
      listeners.get("submit")({
        preventDefault() {},
        target: {
          values,
          dataset,
          matches: (candidate) => candidate === selector,
          querySelector,
        },
      });
    },
    get page() { return querySelector("[data-page]").innerHTML; },
  };
}

test("the screening's partial return carries the outstanding unit into morning handover", () => {
  const saved = new Map();
  const loans = () => JSON.parse(saved.values().next().value).loans;
  const numberFor = (asset) => loans().find((loan) => loan.asset === asset).num;
  let desk = openDesk(saved);

  desk.click("request", "RQ-214");
  assert.match(desk.page, /<option value="Kabir Sen" selected>/);
  assert.doesNotMatch(desk.page, /PR-06/);

  const pickup = {
    who: "Kabir Sen",
    "kit-0": "PR-04",
    "kit-1": "SP-02",
    "kit-2": "AD-15",
  };
  desk.submit("[data-kit-issue]", { ...pickup, "kit-0": "PR-06" });
  assert.deepEqual(loans().map((loan) => loan.asset), ["MI-09"]);

  desk.submit("[data-kit-issue]", pickup);
  assert.deepEqual(
    loans().filter((loan) => loan.req === "RQ-214").map(({ asset, who, due }) => [asset, who, due]),
    [
      ["PR-04", "Kabir Sen", "Fri 8 pm"],
      ["SP-02", "Kabir Sen", "Fri 8 pm"],
      ["AD-15", "Kabir Sen", "Fri 8 pm"],
    ],
  );

  desk.click("advance");
  for (const unit of ["PR-04", "SP-02"]) {
    const number = numberFor(unit);
    desk.click("return", number);
    assert.equal(loans().find((loan) => loan.num === number).back, false);
    desk.submit("[data-return]", { unit, returnedBy: "Kabir Sen" }, {
      return: String(number),
    });
  }
  assert.match(desk.page, /Partial return/);

  const adapter = numberFor("AD-15");
  desk.click("handover", adapter);
  desk.submit("[data-handover]", { contact: "Leela Das", expected: "Sat 9 am" }, {
    handover: String(adapter),
  });
  desk.click("advance");

  desk = openDesk(saved);
  desk.click("tab", "Loan register");
  assert.match(desk.page, /AD-15/);
  assert.match(desk.page, /Leela Das · Expected Sat 9 am/);
  assert.doesNotMatch(desk.page, /AD-12|PR-04|SP-02/);

  desk.click("return", adapter);
  desk.submit("[data-return]", { unit: "AD-12", returnedBy: "Leela Das" }, {
    return: String(adapter),
  });
  assert.equal(loans().find((loan) => loan.num === adapter).back, false);
  assert.match(desk.page, /AD-15/);

  desk.submit("[data-return]", { unit: " ad-15 ", returnedBy: "Leela Das" }, {
    return: String(adapter),
  });
  assert.doesNotMatch(desk.page, /AD-15/);
  assert.deepEqual(loans().filter((loan) => !loan.back).map((loan) => loan.asset), ["MI-09"]);
  const returned = loans().find((loan) => loan.num === adapter);
  assert.equal(returned.returnedBy, "Leela Das");
  assert.equal(returned.returnedAt, "Saturday · 9:00 am");

  desk = openDesk(saved);
  desk.click("undo-return");
  const reopened = loans().find((loan) => loan.num === adapter);
  assert.equal(reopened.back, false);
  assert.equal(reopened.returnedAt, undefined);
  assert.equal(reopened.returnedBy, undefined);
  assert.match(desk.page, /Leela Das · Expected Sat 9 am/);
});

test("a return cannot be undone after the physical unit is issued again", () => {
  const saved = new Map();
  const loans = () => JSON.parse(saved.values().next().value).loans;
  const desk = openDesk(saved);

  desk.click("tab", "Loan register");
  desk.click("return", 401);
  desk.submit("[data-return]", { unit: "MI-09", returnedBy: "Tara Shah" }, {
    return: "401",
  });
  assert.equal(loans()[0].back, true);

  desk.submit("[data-issue]", {
    req: "RQ-209", asset: "MI-09", who: "Tara Shah", due: "Sat 10 am",
  });
  desk.click("undo-return");
  assert.equal(loans()[0].back, true);
  assert.equal(loans().filter((loan) => loan.asset === "MI-09" && !loan.back).length, 1);
});
