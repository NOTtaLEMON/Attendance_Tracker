(function () {
  "use strict";

  var STORAGE_CONFIG = "att_config_v1";
  var STORAGE_RECORDS = "att_records_v1";
  var STORAGE_UI = "att_ui_v1";
  var STORAGE_OVERRIDES = "att_overrides_v1";

  var SUBJECT_COLORS = ["#2563eb","#dc2626","#16a34a","#d97706","#7c3aed","#0891b2","#db2777","#65a30d","#ea580c"];

  var DEFAULT_CONFIG = {
    semesterStart: "2026-09-07",
    semesterEnd: "2026-12-21",
    attendanceThreshold: 75,
    holidays: [
      { date: "2026-01-15", name: "Uttarayana Punyakala / Makara Sankranti" },
      { date: "2026-01-26", name: "Republic Day" },
      { date: "2026-03-19", name: "Ugadi Festival" },
      { date: "2026-03-21", name: "Khutub E Ramzan" },
      { date: "2026-03-31", name: "Mahaveera Jayanthi" },
      { date: "2026-04-03", name: "Good Friday" },
      { date: "2026-04-14", name: "Dr. B R Ambedkar Jayanthi / Souramana Ugadi" },
      { date: "2026-04-20", name: "Basava Jayanthi / Akshya Tritiya" },
      { date: "2026-05-01", name: "May Day / Buddha Poornima" },
      { date: "2026-05-28", name: "Bakrid" },
      { date: "2026-06-26", name: "Last Day of Moharam" },
      { date: "2026-08-15", name: "Independence Day" },
      { date: "2026-08-26", name: "Eid-Milad / Rug Upakarma / Onam" },
      { date: "2026-09-14", name: "Swarna Gowri Vrata / Varasiddhi Vinayaka Vrata" },
      { date: "2026-10-02", name: "Gandhi Jayanthi" },
      { date: "2026-10-10", name: "Mahalaya Amavasye" },
      { date: "2026-10-20", name: "Mahanavami / Ayudhapooja" },
      { date: "2026-10-21", name: "Vijayadashami" },
      { date: "2026-11-10", name: "Balipadyami / Deepavali" },
      { date: "2026-11-27", name: "Kanakadasa Jayanthi" },
      { date: "2026-12-25", name: "Christmas" }
    ],
    timetable: {
      1: [
        { subject: "ADLD", start: "09:00", end: "10:00" },
        { subject: "DSA", start: "10:00", end: "11:00" },
        { subject: "BC", start: "11:30", end: "12:30" },
        { subject: "Math", start: "12:30", end: "13:30" },
        { subject: "OS", start: "14:30", end: "15:30" },
        { subject: "QCE", start: "15:30", end: "16:30" }
      ],
      2: [
        { subject: "DSA", start: "09:00", end: "10:00" },
        { subject: "OS", start: "10:00", end: "11:00" },
        { subject: "Math", start: "11:30", end: "12:30" },
        { subject: "ADLD", start: "12:30", end: "13:30" },
        { subject: "DTL Lab", start: "14:30", end: "16:30", weight: 2 }
      ],
      3: [
        { subject: "OS", start: "09:00", end: "10:00" },
        { subject: "Math", start: "10:00", end: "11:00" },
        { subject: "DSA Lab", start: "11:30", end: "13:30", weight: 2 },
        { subject: "DSA", start: "14:30", end: "15:30" },
        { subject: "BC", start: "15:30", end: "16:30" }
      ],
      4: [
        { subject: "Math", start: "09:00", end: "10:00" },
        { subject: "ADLD", start: "10:00", end: "11:00" },
        { subject: "QCE", start: "11:30", end: "12:30" }
      ],
      5: [
        { subject: "QCE", start: "09:00", end: "10:00" },
        { subject: "BC", start: "10:00", end: "11:00" },
        { subject: "ADLD Lab", start: "11:30", end: "13:30", weight: 2 }
      ]
    }
  };

  var REASON_TAGS = ["Sick", "Personal", "College event", "Overslept", "Travel", "Other"];

  // ---------- storage ----------
  function loadConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_CONFIG, JSON.stringify(cfg));
  }
  function loadRecords() {
    try {
      var raw = localStorage.getItem(STORAGE_RECORDS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }
  function saveRecords(r) {
    localStorage.setItem(STORAGE_RECORDS, JSON.stringify(r));
  }
  function loadUI() {
    try {
      var raw = localStorage.getItem(STORAGE_UI);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { theme: "auto", layout: "layout-auto" };
  }
  function saveUI(ui) {
    localStorage.setItem(STORAGE_UI, JSON.stringify(ui));
  }
  function loadOverrides() {
    try {
      var raw = localStorage.getItem(STORAGE_OVERRIDES);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }
  function saveOverrides(o) {
    localStorage.setItem(STORAGE_OVERRIDES, JSON.stringify(o));
  }

  var config = loadConfig();
  var records = loadRecords();
  var ui = loadUI();
  var overrides = loadOverrides();

  // ---------- date utils ----------
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function toISO(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function parseISO(s) {
    var parts = s.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  function addDays(d, n) {
    var r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }
  function todayDate() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  var WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function formatLong(d) {
    return WEEKDAY_NAMES[d.getDay()] + ", " + d.getDate() + " " + MONTH_NAMES[d.getMonth()] + " " + d.getFullYear();
  }

  function holidayMap() {
    var m = {};
    config.holidays.forEach(function (h) { m[h.date] = h.name; });
    return m;
  }

  function slotWeight(slot) {
    return slot.weight || 1;
  }

  function subjectList() {
    var set = {};
    var order = [];
    Object.keys(config.timetable).forEach(function (day) {
      config.timetable[day].forEach(function (slot) {
        if (!set[slot.subject]) { set[slot.subject] = true; order.push(slot.subject); }
      });
    });
    Object.keys(overrides).forEach(function (iso) {
      (overrides[iso].added || []).forEach(function (slot) {
        if (!set[slot.subject]) { set[slot.subject] = true; order.push(slot.subject); }
      });
    });
    return order;
  }

  function subjectColor(subject) {
    var list = subjectList();
    var idx = list.indexOf(subject);
    if (idx < 0) idx = 0;
    return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
  }

  // returns {isHoliday, holidayName, slots:[{subject,start,end,weight}], inRange}
  // slots reflects the weekly timetable with that date's overrides (removed/added) applied.
  function dayInfo(dateObj) {
    var iso = toISO(dateObj);
    var start = parseISO(config.semesterStart);
    var end = parseISO(config.semesterEnd);
    var inRange = dateObj >= start && dateObj <= end;
    var dow = dateObj.getDay();
    var hmap = holidayMap();
    var isHoliday = !!hmap[iso];
    var isWeekend = dow === 0 || dow === 6;
    var baseSlots = [];
    if (inRange && !isHoliday && !isWeekend && config.timetable[dow]) {
      baseSlots = config.timetable[dow];
    }
    var ov = overrides[iso];
    var removedSet = {};
    if (ov && ov.removed) ov.removed.forEach(function (k) { removedSet[k] = true; });
    var slots = baseSlots
      .filter(function (s) { return !removedSet[s.subject + "::" + s.start]; })
      .map(function (s) { return { subject: s.subject, start: s.start, end: s.end, weight: slotWeight(s), added: false }; });
    if (ov && ov.added) {
      ov.added.forEach(function (s) {
        slots.push({ subject: s.subject, start: s.start, end: s.end, weight: slotWeight(s), added: true });
      });
    }
    slots.sort(function (a, b) { return a.start < b.start ? -1 : (a.start > b.start ? 1 : 0); });
    return {
      iso: iso,
      inRange: inRange,
      isWeekend: isWeekend,
      isHoliday: isHoliday,
      holidayName: hmap[iso] || null,
      slots: slots
    };
  }

  function removeSlotForDay(iso, slot) {
    if (!overrides[iso]) overrides[iso] = {};
    if (slot.added) {
      overrides[iso].added = (overrides[iso].added || []).filter(function (s) {
        return !(s.subject === slot.subject && s.start === slot.start);
      });
    } else {
      overrides[iso].removed = overrides[iso].removed || [];
      var key = slot.subject + "::" + slot.start;
      if (overrides[iso].removed.indexOf(key) === -1) overrides[iso].removed.push(key);
    }
    saveOverrides(overrides);
    setRecord(iso, slot.subject, slot.start, null);
  }

  function addSlotForDay(iso, subject, start, end, weight) {
    if (!overrides[iso]) overrides[iso] = {};
    overrides[iso].added = overrides[iso].added || [];
    overrides[iso].added.push({ subject: subject, start: start, end: end, weight: weight || 1 });
    saveOverrides(overrides);
  }

  function setHoliday(iso, name) {
    config.holidays = config.holidays.filter(function (h) { return h.date !== iso; });
    config.holidays.push({ date: iso, name: name || "Holiday" });
    saveConfig(config);
  }

  function unsetHoliday(iso) {
    config.holidays = config.holidays.filter(function (h) { return h.date !== iso; });
    saveConfig(config);
  }

  function recordKey(iso, subject, start) {
    return iso + "::" + subject + "::" + start;
  }

  function getRecord(iso, subject, start) {
    return records[recordKey(iso, subject, start)] || null;
  }

  function setRecord(iso, subject, start, status, reason) {
    var key = recordKey(iso, subject, start);
    if (!status) {
      delete records[key];
    } else {
      records[key] = { status: status, reason: reason || "", loggedAt: new Date().toISOString() };
    }
    saveRecords(records);
  }

  // ---------- stats ----------
  function computeStats(uptoDateExclusiveISO) {
    var start = parseISO(config.semesterStart);
    var end = parseISO(config.semesterEnd);
    var cutoff = uptoDateExclusiveISO ? parseISO(uptoDateExclusiveISO) : addDays(todayDate(), 1);
    var subjects = subjectList();
    var stats = {};
    subjects.forEach(function (s) {
      stats[s] = { held: 0, attended: 0, missed: 0, cancelled: 0, unlogged: 0, remaining: 0 };
    });

    var d = new Date(start);
    while (d <= end) {
      var info = dayInfo(d);
      if (info.slots.length) {
        info.slots.forEach(function (slot) {
          var st = stats[slot.subject];
          if (!st) return;
          var w = slot.weight;
          var rec = getRecord(info.iso, slot.subject, slot.start);
          if (rec) {
            if (rec.status === "present") { st.attended += w; st.held += w; }
            else if (rec.status === "absent") { st.missed += w; st.held += w; }
            else if (rec.status === "cancelled") { st.cancelled += w; }
          } else if (d < cutoff) {
            st.unlogged += w;
          } else {
            st.remaining += w;
          }
        });
      }
      d = addDays(d, 1);
    }

    var overall = { held: 0, attended: 0, missed: 0, cancelled: 0, unlogged: 0, remaining: 0 };
    subjects.forEach(function (s) {
      var st = stats[s];
      st.pct = st.held ? Math.round((st.attended / st.held) * 1000) / 10 : null;
      overall.held += st.held;
      overall.attended += st.attended;
      overall.missed += st.missed;
      overall.cancelled += st.cancelled;
      overall.unlogged += st.unlogged;
      overall.remaining += st.remaining;
    });
    overall.pct = overall.held ? Math.round((overall.attended / overall.held) * 1000) / 10 : null;

    return { subjects: stats, overall: overall, subjectOrder: subjects };
  }

  function bunkAdvice(st) {
    var T = config.attendanceThreshold / 100;
    var A = st.attended, H = st.held, R = st.remaining;
    if (H === 0) return { type: "none", text: "No classes held yet" };
    var curPct = A / H;
    if (curPct >= T) {
      var safe = Math.floor(A + R - T * (H + R));
      if (safe < 0) safe = 0;
      if (safe > R) safe = R;
      if (R === 0) return { type: "ok", text: "Semester's classes for this subject are done" };
      return { type: "ok", text: "Can skip " + safe + " more of " + R + " remaining and stay ≥" + config.attendanceThreshold + "%" };
    } else {
      var denom = (1 - T);
      var need = denom > 0 ? Math.ceil((T * H - A) / denom) : Infinity;
      if (need > R) {
        return { type: "bad", text: "Below target; attending all " + R + " remaining won't reach " + config.attendanceThreshold + "%" };
      }
      return { type: "bad", text: "Must attend next " + need + " of " + R + " remaining to reach " + config.attendanceThreshold + "%" };
    }
  }

  // ---------- UI state ----------
  var state = {
    currentTab: "today",
    todayDate: todayDate(),
    calMonth: todayDate().getMonth(),
    calYear: todayDate().getFullYear()
  };

  // ---------- rendering: Today tab ----------
  function renderToday() {
    var d = state.todayDate;
    document.getElementById("dayLabelDate").textContent = formatLong(d);
    var info = dayInfo(d);
    var statusEl = document.getElementById("dayLabelStatus");
    if (info.isHoliday) statusEl.textContent = "Holiday: " + info.holidayName;
    else if (info.isWeekend) statusEl.textContent = "Weekend";
    else if (!info.inRange) statusEl.textContent = "Outside semester range";
    else statusEl.textContent = info.slots.length + " class" + (info.slots.length === 1 ? "" : "es") + " scheduled";

    var listEl = document.getElementById("todayList");
    listEl.innerHTML = "";

    if (info.slots.length) {
      if (info.isHoliday) {
        var note = document.createElement("div");
        note.className = "holiday-notice";
        note.textContent = "Holiday (" + info.holidayName + ") but a class is scheduled below";
        listEl.appendChild(note);
      }
      info.slots.forEach(function (slot) {
        listEl.appendChild(renderSlotCard(info.iso, slot, renderToday));
      });
    } else if (info.isHoliday) {
      listEl.innerHTML = '<div class="holiday-notice">No classes — ' + escapeHtml(info.holidayName) + "</div>";
    } else if (info.isWeekend) {
      listEl.innerHTML = '<div class="holiday-notice">Weekend — no classes</div>';
    } else if (!info.inRange) {
      listEl.innerHTML = '<div class="empty-notice">This date is outside your configured semester range.</div>';
    } else {
      listEl.innerHTML = '<div class="empty-notice">No classes scheduled this day.</div>';
    }

    var dayTools = document.createElement("div");
    dayTools.className = "day-tools";
    renderHolidayToggle(dayTools, info.iso, info, renderToday);
    renderAddSlotForm(dayTools, info.iso, renderToday);
    listEl.appendChild(dayTools);

    renderUnloggedBanner();
  }

  function renderSlotCard(iso, slot, onChange) {
    var rec = getRecord(iso, slot.subject, slot.start);
    var card = document.createElement("div");
    card.className = "slot-card";

    var top = document.createElement("div");
    top.className = "slot-top";
    var weightBadge = slot.weight !== 1 ? ' <span class="weight-badge">' + slot.weight + "x</span>" : "";
    var addedBadge = slot.added ? ' <span class="weight-badge added-badge">extra</span>' : "";
    top.innerHTML =
      '<div class="slot-subject"><span class="subject-dot" style="background:' + subjectColor(slot.subject) + '"></span>' +
      escapeHtml(slot.subject) + weightBadge + addedBadge + "</div>" +
      '<div class="slot-time">' + slot.start + "–" + slot.end + "</div>";
    card.appendChild(top);

    var meta = document.createElement("div");
    meta.className = "slot-meta-row";
    var removeLink = document.createElement("button");
    removeLink.className = "slot-remove-link";
    removeLink.textContent = slot.added ? "Remove this extra class" : "Not held today (temporary change)";
    removeLink.onclick = function () {
      if (!confirm(slot.added ? "Remove this extra class from " + iso + "?" : "Mark \"" + slot.subject + "\" as not held on " + iso + "? (Timetable stays unchanged for other days.)")) return;
      removeSlotForDay(iso, slot);
      onChange();
    };
    meta.appendChild(removeLink);
    card.appendChild(meta);

    var actions = document.createElement("div");
    actions.className = "slot-actions";
    var statuses = [
      { key: "present", label: "Present" },
      { key: "absent", label: "Absent" },
      { key: "cancelled", label: "Cancelled" }
    ];
    statuses.forEach(function (s) {
      var btn = document.createElement("button");
      btn.className = "status-btn " + s.key + (rec && rec.status === s.key ? " selected" : "");
      btn.textContent = s.label;
      btn.onclick = function () {
        var newStatus = rec && rec.status === s.key ? null : s.key;
        setRecord(iso, slot.subject, slot.start, newStatus, rec ? rec.reason : "");
        onChange();
      };
      actions.appendChild(btn);
    });
    card.appendChild(actions);

    if (rec && rec.status === "absent") {
      var box = document.createElement("div");
      box.className = "reason-box";
      var chips = document.createElement("div");
      chips.className = "reason-chips";
      REASON_TAGS.forEach(function (tag) {
        var chip = document.createElement("span");
        chip.className = "reason-chip" + (rec.reason === tag ? " selected" : "");
        chip.textContent = tag;
        chip.onclick = function () {
          setRecord(iso, slot.subject, slot.start, "absent", tag);
          onChange();
        };
        chips.appendChild(chip);
      });
      box.appendChild(chips);

      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Add a note (optional)";
      input.value = REASON_TAGS.indexOf(rec.reason) === -1 ? (rec.reason || "") : "";
      input.onchange = function () {
        setRecord(iso, slot.subject, slot.start, "absent", input.value);
      };
      box.appendChild(input);
      card.appendChild(box);
    }

    return card;
  }

  function renderHolidayToggle(container, iso, info, onChange) {
    var btn = document.createElement("button");
    btn.className = "link-btn holiday-toggle-btn";
    if (info.isHoliday) {
      btn.textContent = "Remove holiday flag (" + info.holidayName + ")";
      btn.onclick = function () {
        if (!confirm("Remove holiday flag for " + iso + "?")) return;
        unsetHoliday(iso);
        onChange();
      };
    } else {
      btn.textContent = "Mark " + iso + " as an official holiday";
      btn.onclick = function () {
        var name = prompt("Reason for holiday (optional):", "No class");
        if (name === null) return;
        setHoliday(iso, name);
        onChange();
      };
    }
    container.appendChild(btn);
  }

  function renderAddSlotForm(container, iso, onChange) {
    var wrap = document.createElement("div");
    wrap.className = "add-slot-wrap";
    var toggleBtn = document.createElement("button");
    toggleBtn.className = "btn-secondary";
    toggleBtn.textContent = "+ Add extra class for this day";
    var form = document.createElement("div");
    form.className = "add-slot-form hidden";

    var subjInput = document.createElement("input");
    subjInput.type = "text";
    subjInput.placeholder = "Subject";
    var startInput = document.createElement("input");
    startInput.type = "time";
    startInput.value = "09:00";
    var endInput = document.createElement("input");
    endInput.type = "time";
    endInput.value = "10:00";
    var weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.min = "1";
    weightInput.max = "4";
    weightInput.value = "1";
    weightInput.title = "Weight (2 for a 2-hour lab)";

    var row1 = document.createElement("div");
    row1.className = "add-slot-row";
    row1.appendChild(subjInput);
    var row2 = document.createElement("div");
    row2.className = "add-slot-row";
    row2.appendChild(startInput);
    row2.appendChild(endInput);
    var weightLabel = document.createElement("label");
    weightLabel.className = "weight-label";
    weightLabel.textContent = "Weight";
    weightLabel.appendChild(weightInput);
    row2.appendChild(weightLabel);

    var confirmBtn = document.createElement("button");
    confirmBtn.className = "btn-secondary";
    confirmBtn.textContent = "Add";
    confirmBtn.onclick = function () {
      if (!subjInput.value.trim()) { alert("Enter a subject name."); return; }
      addSlotForDay(iso, subjInput.value.trim(), startInput.value, endInput.value, parseInt(weightInput.value, 10) || 1);
      onChange();
    };

    form.appendChild(row1);
    form.appendChild(row2);
    form.appendChild(confirmBtn);

    toggleBtn.onclick = function () {
      form.classList.toggle("hidden");
    };

    wrap.appendChild(toggleBtn);
    wrap.appendChild(form);
    container.appendChild(wrap);
  }

  function renderUnloggedBanner() {
    var banner = document.getElementById("unloggedBanner");
    var stats = computeStats();
    if (stats.overall.unlogged > 0) {
      banner.classList.remove("hidden");
      banner.textContent = stats.overall.unlogged + " past class" + (stats.overall.unlogged === 1 ? "" : "es") + " not yet logged. Use the calendar to back-fill.";
    } else {
      banner.classList.add("hidden");
    }
  }

  // ---------- rendering: Dashboard ----------
  function renderDashboard() {
    var stats = computeStats();
    var overallCard = document.getElementById("overallCard");
    var pct = stats.overall.pct;
    overallCard.innerHTML =
      '<div class="overall-title">Overall attendance</div>' +
      '<div class="overall-pct">' + (pct === null ? "–" : pct + "%") + "</div>" +
      '<div class="overall-sub">' + stats.overall.attended + " attended / " + stats.overall.held + " held" +
      (stats.overall.cancelled ? " · " + stats.overall.cancelled + " cancelled" : "") +
      (stats.overall.unlogged ? " · " + stats.overall.unlogged + " unlogged" : "") + "</div>";

    var wrap = document.getElementById("subjectCards");
    wrap.innerHTML = "";
    stats.subjectOrder.forEach(function (subject) {
      var st = stats.subjects[subject];
      var card = document.createElement("div");
      card.className = "subject-card";
      var pctClass = st.pct === null ? "warn" : st.pct >= config.attendanceThreshold ? "ok" : (st.pct >= config.attendanceThreshold - 10 ? "warn" : "bad");
      var advice = bunkAdvice(st);
      card.innerHTML =
        '<div class="subject-card-top">' +
          '<div class="subject-card-name"><span class="subject-dot" style="background:' + subjectColor(subject) + '"></span>' + escapeHtml(subject) + "</div>" +
          '<div class="pct-pill ' + pctClass + '">' + (st.pct === null ? "–" : st.pct + "%") + "</div>" +
        "</div>" +
        '<div class="progress-bar"><div class="progress-bar-fill ' + pctClass + '" style="width:' + (st.pct || 0) + '%"></div></div>' +
        '<div class="subject-card-stats"><span>' + st.attended + " attended</span><span>" + st.held + " held</span><span>" + st.remaining + " left</span></div>" +
        (st.unlogged ? '<div class="subject-card-stats"><span>' + st.unlogged + " unlogged</span></div>" : "") +
        '<div class="subject-card-advice ' + (advice.type === "bad" ? "bad" : "ok") + '">' + escapeHtml(advice.text) + "</div>";
      wrap.appendChild(card);
    });
  }

  // ---------- rendering: Calendar ----------
  function renderCalendar() {
    var label = document.getElementById("calMonthLabel");
    label.textContent = MONTH_NAMES[state.calMonth] + " " + state.calYear;

    var grid = document.getElementById("calGrid");
    grid.innerHTML = "";
    ["Mon","Tue","Wed","Thu","Fri"].forEach(function (w) {
      var lbl = document.createElement("div");
      lbl.className = "cal-weekday-label";
      lbl.textContent = w;
      grid.appendChild(lbl);
    });

    var firstOfMonth = new Date(state.calYear, state.calMonth, 1);
    var firstDow = firstOfMonth.getDay();
    var leadBlanks = firstDow === 0 ? 4 : (firstDow === 6 ? 5 : firstDow - 1);
    var daysInMonth = new Date(state.calYear, state.calMonth + 1, 0).getDate();
    var today = todayDate();

    for (var i = 0; i < leadBlanks; i++) {
      var blank = document.createElement("div");
      blank.className = "cal-day empty";
      grid.appendChild(blank);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(state.calYear, state.calMonth, day);
      var dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      var info = dayInfo(d);
      var cell = document.createElement("div");
      cell.className = "cal-day";
      cell.textContent = day;

      if (!info.slots.length) {
        cell.classList.add("off");
      } else {
        var hasUnlogged = false, hasAbsent = false, hasAny = false;
        info.slots.forEach(function (slot) {
          var rec = getRecord(info.iso, slot.subject, slot.start);
          if (!rec) hasUnlogged = true;
          else { hasAny = true; if (rec.status === "absent") hasAbsent = true; }
        });
        if (hasAbsent) cell.classList.add("bad");
        else if (hasAny && !hasUnlogged) cell.classList.add("ok");
        else if (hasUnlogged && d <= today) cell.classList.add("partial");
        else cell.classList.add("future");
      }
      if (toISO(d) === toISO(today)) cell.classList.add("today");

      cell.onclick = function (isoDate) {
        return function () { openDayModal(isoDate); };
      }(info.iso);

      grid.appendChild(cell);
    }
  }

  function openDayModal(iso) {
    var d = parseISO(iso);
    var info = dayInfo(d);
    var root = document.getElementById("modalRoot");
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    var box = document.createElement("div");
    box.className = "modal-box";
    box.innerHTML = '<div class="modal-title">' + formatLong(d) + "</div>";

    function refreshModal() {
      root.innerHTML = "";
      openDayModal(iso);
      renderCalendar();
      renderDashboard();
      if (state.currentTab === "today") renderToday();
    }

    if (info.slots.length) {
      if (info.isHoliday) {
        var note = document.createElement("div");
        note.className = "holiday-notice";
        note.textContent = "Holiday (" + info.holidayName + ") but a class is scheduled below";
        box.appendChild(note);
      }
      var list = document.createElement("div");
      list.className = "slot-list";
      info.slots.forEach(function (slot) {
        list.appendChild(renderSlotCard(iso, slot, refreshModal));
      });
      box.appendChild(list);
    } else if (info.isHoliday) {
      box.innerHTML += '<div class="holiday-notice">Holiday: ' + escapeHtml(info.holidayName) + "</div>";
    } else {
      box.innerHTML += '<div class="empty-notice">No classes this day.</div>';
    }

    var dayTools = document.createElement("div");
    dayTools.className = "day-tools";
    renderHolidayToggle(dayTools, iso, info, refreshModal);
    renderAddSlotForm(dayTools, iso, refreshModal);
    box.appendChild(dayTools);

    var closeRow = document.createElement("div");
    closeRow.className = "modal-close-row";
    var closeBtn = document.createElement("button");
    closeBtn.className = "btn-secondary";
    closeBtn.textContent = "Close";
    closeBtn.onclick = function () {
      root.innerHTML = "";
      renderCalendar();
      renderDashboard();
    };
    closeRow.appendChild(closeBtn);
    box.appendChild(closeRow);

    overlay.appendChild(box);
    overlay.onclick = function (e) { if (e.target === overlay) closeBtn.onclick(); };
    root.innerHTML = "";
    root.appendChild(overlay);
  }

  // ---------- rendering: Settings ----------
  function renderSettings() {
    document.getElementById("cfgStart").value = config.semesterStart;
    document.getElementById("cfgEnd").value = config.semesterEnd;
    document.getElementById("cfgThreshold").value = config.attendanceThreshold;

    var tt = document.getElementById("timetableEditor");
    tt.innerHTML = "";
    var dayNames = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday" };
    [1,2,3,4,5].forEach(function (dow) {
      var block = document.createElement("div");
      block.className = "timetable-day-block";
      var title = document.createElement("div");
      title.className = "timetable-day-title";
      title.textContent = dayNames[dow];
      block.appendChild(title);

      (config.timetable[dow] || []).forEach(function (slot, idx) {
        var row = document.createElement("div");
        row.className = "timetable-row";

        var subjInput = document.createElement("input");
        subjInput.type = "text";
        subjInput.value = slot.subject;
        subjInput.onchange = function () { slot.subject = subjInput.value; saveConfig(config); renderAll(); };

        var startInput = document.createElement("input");
        startInput.type = "time";
        startInput.value = slot.start;
        startInput.onchange = function () { slot.start = startInput.value; saveConfig(config); renderAll(); };

        var endInput = document.createElement("input");
        endInput.type = "time";
        endInput.value = slot.end;
        endInput.onchange = function () { slot.end = endInput.value; saveConfig(config); renderAll(); };

        var weightInput = document.createElement("input");
        weightInput.type = "number";
        weightInput.min = "1";
        weightInput.max = "4";
        weightInput.title = "Weight (2 for a 2-hour lab)";
        weightInput.value = slotWeight(slot);
        weightInput.onchange = function () { slot.weight = parseInt(weightInput.value, 10) || 1; saveConfig(config); renderAll(); };

        var removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "✕";
        removeBtn.onclick = function () {
          config.timetable[dow].splice(idx, 1);
          saveConfig(config);
          renderSettings();
          renderAll();
        };

        row.appendChild(subjInput);
        row.appendChild(startInput);
        row.appendChild(endInput);
        row.appendChild(weightInput);
        row.appendChild(removeBtn);
        block.appendChild(row);
      });

      var addBtn = document.createElement("button");
      addBtn.className = "btn-secondary";
      addBtn.textContent = "+ Add to " + dayNames[dow];
      addBtn.onclick = function () {
        if (!config.timetable[dow]) config.timetable[dow] = [];
        config.timetable[dow].push({ subject: "New Subject", start: "09:00", end: "10:00", weight: 1 });
        saveConfig(config);
        renderSettings();
        renderAll();
      };
      block.appendChild(addBtn);

      tt.appendChild(block);
    });

    var he = document.getElementById("holidayEditor");
    he.innerHTML = "";
    var sortedHolidays = config.holidays.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    sortedHolidays.forEach(function (h) {
      var row = document.createElement("div");
      row.className = "holiday-row";
      row.innerHTML =
        '<div class="holiday-row-info">' + escapeHtml(h.name) + '<div class="holiday-row-date">' + h.date + "</div></div>";
      var removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "✕";
      removeBtn.onclick = function () {
        config.holidays = config.holidays.filter(function (x) { return !(x.date === h.date && x.name === h.name); });
        saveConfig(config);
        renderSettings();
        renderAll();
      };
      row.appendChild(removeBtn);
      he.appendChild(row);
    });

    document.getElementById("cfgStart").onchange = function (e) {
      config.semesterStart = e.target.value; saveConfig(config); renderAll();
    };
    document.getElementById("cfgEnd").onchange = function (e) {
      config.semesterEnd = e.target.value; saveConfig(config); renderAll();
    };
    document.getElementById("cfgThreshold").onchange = function (e) {
      config.attendanceThreshold = parseFloat(e.target.value) || 75; saveConfig(config); renderAll();
    };
  }

  function renderAll() {
    renderToday();
    renderDashboard();
    renderCalendar();
  }

  // ---------- misc ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- tabs ----------
  function switchTab(tab) {
    state.currentTab = tab;
    document.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
    document.querySelectorAll(".tab-panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "tab-" + tab);
    });
    if (tab === "today") renderToday();
    if (tab === "dashboard") renderDashboard();
    if (tab === "calendar") renderCalendar();
    if (tab === "settings") renderSettings();
  }

  // ---------- theme / layout ----------
  function applyTheme() {
    var html = document.documentElement;
    if (ui.theme === "auto") html.removeAttribute("data-theme");
    else html.setAttribute("data-theme", ui.theme);
  }
  function applyLayout() {
    document.body.className = ui.layout;
    document.getElementById("layoutToggle").value = ui.layout;
  }

  // ---------- init ----------
  function init() {
    applyTheme();
    applyLayout();

    document.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.onclick = function () { switchTab(btn.dataset.tab); };
    });

    document.getElementById("prevDay").onclick = function () {
      state.todayDate = addDays(state.todayDate, -1);
      renderToday();
    };
    document.getElementById("nextDay").onclick = function () {
      state.todayDate = addDays(state.todayDate, 1);
      renderToday();
    };
    document.getElementById("jumpToday").onclick = function () {
      state.todayDate = todayDate();
      renderToday();
    };

    document.getElementById("prevMonth").onclick = function () {
      state.calMonth--;
      if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
      renderCalendar();
    };
    document.getElementById("nextMonth").onclick = function () {
      state.calMonth++;
      if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
      renderCalendar();
    };

    document.getElementById("themeToggle").onclick = function () {
      ui.theme = ui.theme === "auto" ? "light" : (ui.theme === "light" ? "dark" : "auto");
      saveUI(ui);
      applyTheme();
    };
    document.getElementById("layoutToggle").onchange = function (e) {
      ui.layout = e.target.value;
      saveUI(ui);
      applyLayout();
    };

    document.getElementById("addHolidayBtn").onclick = function () {
      var dateInput = document.getElementById("newHolidayDate");
      var nameInput = document.getElementById("newHolidayName");
      if (!dateInput.value) return;
      setHoliday(dateInput.value, nameInput.value || "No class");
      dateInput.value = "";
      nameInput.value = "";
      renderSettings();
      renderAll();
    };

    document.getElementById("exportBtn").onclick = function () {
      var data = { config: config, records: records, overrides: overrides, exportedAt: new Date().toISOString() };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "attendance-backup-" + toISO(todayDate()) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    document.getElementById("importBtn").onclick = function () {
      document.getElementById("importFile").click();
    };
    document.getElementById("importFile").onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (data.config) config = data.config;
          if (data.records) records = data.records;
          if (data.overrides) overrides = data.overrides;
          saveConfig(config);
          saveRecords(records);
          saveOverrides(overrides);
          renderSettings();
          renderAll();
          alert("Backup imported.");
        } catch (err) {
          alert("Could not read that file.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    };

    document.getElementById("resetBtn").onclick = function () {
      if (!confirm("This deletes all logged attendance and settings on this device. Continue?")) return;
      localStorage.removeItem(STORAGE_CONFIG);
      localStorage.removeItem(STORAGE_RECORDS);
      localStorage.removeItem(STORAGE_OVERRIDES);
      config = loadConfig();
      records = loadRecords();
      overrides = loadOverrides();
      renderSettings();
      renderAll();
    };

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
