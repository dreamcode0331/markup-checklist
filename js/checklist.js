document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'markup-checklist-state';
  var AI_STORAGE_KEY = 'markup-checklist-ai';
  var AI_STATUS = {
    pass: null,
    na: { text: '해당 없음', modifier: 'na' },
    fail: { text: '수정 필요', modifier: 'fail', state: 'is-fail' },
    check: { text: '확인 필요', modifier: 'pending', state: 'is-pending' }
  };

  // DOM Elements
  var checkItems = document.querySelectorAll('.check-item');
  var checkInputs = document.querySelectorAll('.check-item__input');
  var progressFill = document.querySelector('.progress-area__bar-fill');
  var checkedCount = document.getElementById('checkedCount');
  var totalCount = document.getElementById('totalCount');
  var percentText = document.getElementById('percentText');
  var resetBtn = document.querySelector('.progress-area__reset');
  var filterBtns = document.querySelectorAll('.filter-tabs__btn');
  var categorySections = document.querySelectorAll('.category-section');
  var searchInput = document.getElementById('searchInput');
  var searchCount = document.getElementById('searchCount');
  var exportBtn = document.getElementById('exportBtn');
  var importBtn = document.getElementById('importBtn');
  var importInput = document.getElementById('importInput');
  var aiInfo = document.getElementById('aiInfo');

  var totalItems = checkInputs.length;
  totalCount.textContent = totalItems;
  var aiResult = null;

  // Load saved state
  function loadState() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      var state = JSON.parse(saved);
      checkInputs.forEach(function (input) {
        var id = input.id;
        if (state[id]) {
          input.checked = true;
          input.closest('.check-item').classList.add('is-checked');
        }
      });
    } catch (e) {
      // ignore
    }
  }

  // Save state
  function saveState() {
    var state = {};
    checkInputs.forEach(function (input) {
      state[input.id] = input.checked;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Update progress
  function updateProgress() {
    var checked = document.querySelectorAll('.check-item__input:checked').length;
    var percent = totalItems > 0 ? Math.round((checked / totalItems) * 100) : 0;
    checkedCount.textContent = checked;
    progressFill.style.width = percent + '%';
    percentText.textContent = percent + '%';

    // Update category counts
    categorySections.forEach(function (section) {
      var items = section.querySelectorAll('.check-item__input');
      var done = section.querySelectorAll('.check-item__input:checked').length;
      var countEl = section.querySelector('.category-section__count');
      if (countEl) {
        countEl.textContent = '(' + done + '/' + items.length + ')';
      }
    });
  }

  // Toggle via checkbox input
  checkInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      var item = input.closest('.check-item');
      if (input.checked) {
        item.classList.add('is-checked');
      } else {
        item.classList.remove('is-checked');
      }
      saveState();
      updateProgress();
    });
  });

  // Update tabindex for accordion items
  function updateTabIndex(section) {
    var isOpen = section.classList.contains('is-open');
    var focusables = section.querySelectorAll('.category-section__body input, .category-section__body label[for]');
    focusables.forEach(function (el) {
      el.tabIndex = isOpen ? 0 : -1;
    });
  }

  // Toggle category accordion
  categorySections.forEach(function (section) {
    var header = section.querySelector('.category-section__header');
    header.addEventListener('click', function () {
      section.classList.toggle('is-open');
      updateTabIndex(section);
    });
  });

  // Activate filter
  function activateFilter(filter) {
    filterBtns.forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.filter === filter);
    });

    categorySections.forEach(function (section) {
      if (filter === 'all') {
        section.style.display = '';
      } else {
        section.style.display = section.dataset.category === filter ? '' : 'none';
      }
      updateTabIndex(section);
    });
  }

  // Get current active filter
  function getActiveFilter() {
    var active = document.querySelector('.filter-tabs__btn.is-active');
    return active ? active.dataset.filter : 'all';
  }

  // Filter tabs
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateFilter(btn.dataset.filter);
    });
  });

  // Tab key: move to next filter when at last item of filtered section
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || e.shiftKey) return;

    var filter = getActiveFilter();
    if (filter === 'all') return;

    var visibleSection = document.querySelector('.category-section[data-category="' + filter + '"]');
    if (!visibleSection) return;

    var inputs = visibleSection.querySelectorAll('.check-item__input');
    var lastInput = inputs[inputs.length - 1];
    if (document.activeElement !== lastInput) return;

    // Find next filter tab
    var filterOrder = [];
    filterBtns.forEach(function (b) {
      if (b.dataset.filter !== 'all') filterOrder.push(b.dataset.filter);
    });
    var currentIdx = filterOrder.indexOf(filter);
    if (currentIdx < filterOrder.length - 1) {
      var nextFilter = filterOrder[currentIdx + 1];
      e.preventDefault();
      activateFilter(nextFilter);
      var nextSection = document.querySelector('.category-section[data-category="' + nextFilter + '"]');
      if (nextSection) {
        var nextHeader = nextSection.querySelector('.category-section__header');
        nextHeader.focus();
      }
    }
  });

  // Save original text for highlight restore
  checkItems.forEach(function (item) {
    var label = item.querySelector('.check-item__label');
    var desc = item.querySelector('.check-item__desc');
    if (label) label.dataset.original = label.textContent;
    if (desc) desc.dataset.original = desc.textContent;
  });

  // Highlight keyword in text
  function highlightText(el, keyword) {
    if (!el || !el.dataset.original) return;
    if (!keyword) {
      el.textContent = el.dataset.original;
      return;
    }
    var original = el.dataset.original;
    var lowerOriginal = original.toLowerCase();
    var lowerKeyword = keyword.toLowerCase();
    var result = '';
    var idx = 0;

    while (idx < original.length) {
      var found = lowerOriginal.indexOf(lowerKeyword, idx);
      if (found === -1) {
        result += escapeHtml(original.slice(idx));
        break;
      }
      result += escapeHtml(original.slice(idx, found));
      result += '<mark>' + escapeHtml(original.slice(found, found + keyword.length)) + '</mark>';
      idx = found + keyword.length;
    }
    el.innerHTML = result;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Search
  searchInput.addEventListener('input', function () {
    var keyword = searchInput.value.trim();

    if (!keyword) {
      searchCount.textContent = '';
      checkItems.forEach(function (item) {
        item.style.display = '';
        highlightText(item.querySelector('.check-item__label'), '');
        highlightText(item.querySelector('.check-item__desc'), '');
      });
      categorySections.forEach(function (section) {
        section.style.display = '';
      });
      return;
    }

    // Reset filter to "all"
    activateFilter('all');

    var matchCount = 0;

    checkItems.forEach(function (item) {
      var label = item.querySelector('.check-item__label');
      var desc = item.querySelector('.check-item__desc');
      var text = (label ? label.dataset.original : '') + ' ' + (desc ? desc.dataset.original : '');

      if (text.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
        item.style.display = '';
        highlightText(label, keyword);
        highlightText(desc, keyword);
        matchCount++;
      } else {
        item.style.display = 'none';
        highlightText(label, '');
        highlightText(desc, '');
      }
    });

    // Hide sections with no visible items
    categorySections.forEach(function (section) {
      var visibleItems = section.querySelectorAll('.check-item:not([style*="display: none"])');
      section.style.display = visibleItems.length > 0 ? '' : 'none';
      if (visibleItems.length > 0 && !section.classList.contains('is-open')) {
        section.classList.add('is-open');
        updateTabIndex(section);
      }
    });

    searchCount.textContent = matchCount + '건';
  });

  // Export
  exportBtn.addEventListener('click', function () {
    var now = new Date();
    var dateStr = now.getFullYear() + '-'
      + String(now.getMonth() + 1).padStart(2, '0') + '-'
      + String(now.getDate()).padStart(2, '0');

    var checked = document.querySelectorAll('.check-item__input:checked').length;
    var severityIcon = { high: '🔴', medium: '🟡', low: '🟢' };

    // Collect unchecked items per category: AI 'check' → 확인 필요, the rest → 수정 필요
    var fixItems = [];
    var pendingItems = [];
    var categoryLines = [];

    categorySections.forEach(function (section) {
      var title = section.querySelector('.category-section__title');
      var titleText = title ? title.textContent.replace(/\s*\(.*\)/, '').trim() : '';
      var items = section.querySelectorAll('.check-item');
      var fixCount = 0;
      var pendingCount = 0;

      items.forEach(function (item) {
        var input = item.querySelector('.check-item__input');
        if (input && input.checked) return;

        var id = item.dataset.id;
        var label = item.querySelector('.check-item__label');
        var desc = item.querySelector('.check-item__desc');
        var priorityEl = item.querySelector('.check-item__priority');
        var priority = 'low';
        if (priorityEl) {
          if (priorityEl.classList.contains('check-item__priority--high')) priority = 'high';
          else if (priorityEl.classList.contains('check-item__priority--medium')) priority = 'medium';
        }
        var status = aiResult ? aiResult.items[id] : null;
        var note = aiResult && aiResult.notes ? aiResult.notes[id] : '';

        var entry = {
          text: label ? (label.dataset.original || label.textContent) : '',
          desc: note || (desc ? (desc.dataset.original || desc.textContent) : ''),
          category: titleText,
          priority: priority
        };

        if (status === 'check') {
          pendingItems.push(entry);
          pendingCount++;
        } else {
          fixItems.push(entry);
          fixCount++;
        }
      });

      var counts = [];
      if (fixCount > 0) counts.push('수정 필요 ' + fixCount);
      if (pendingCount > 0) counts.push('확인 필요 ' + pendingCount);
      categoryLines.push('- ' + titleText + ' : ' + (counts.length > 0 ? counts.join(' · ') : '이상 없음'));
    });

    var order = ['high', 'medium', 'low'];
    fixItems.sort(function (a, b) {
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });

    var resultText = fixItems.length === 0 ? '✅통과' : '❌미통과';

    var lines = [];
    lines.push('■ 마크업 검수 결과 — ' + (aiResult && aiResult.file ? aiResult.file : '체크리스트 수동 점검'));
    lines.push('');
    lines.push('검수일: ' + dateStr + ' · 기준: 마크업 품질 체크리스트 v2.0');
    if (aiResult) {
      lines.push('AI 검수: ' + (aiResult.date || '-') + ' 결과 반영');
    }
    lines.push('');
    lines.push('[종합] 결과 ' + resultText + ' · 수정 필요 [' + fixItems.length + '] · 확인 필요 [' + pendingItems.length + '] · 확인 완료 [' + checked + '/' + totalItems + ']');
    lines.push('');
    lines.push('[카테고리별]');
    categoryLines.forEach(function (line) {
      lines.push(line);
    });

    if (fixItems.length > 0) {
      lines.push('');
      lines.push('[수정 필요]');
      fixItems.forEach(function (item) {
        lines.push('- ' + severityIcon[item.priority] + ' ' + item.text + ' → ' + item.desc + '  (' + item.category + ')');
      });
    }

    if (pendingItems.length > 0) {
      lines.push('');
      lines.push('[확인 필요 — 런타임·빌드 단계]');
      pendingItems.forEach(function (item) {
        lines.push('- ' + item.text + ' → ' + item.desc + '  (' + item.category + ')');
      });
    }

    var text = '```\n' + lines.join('\n') + '\n```\n';
    var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'markup-checklist-' + now.getFullYear()
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  });

  // AI result: badges and notes
  function clearAiMarks() {
    checkItems.forEach(function (item) {
      item.classList.remove('is-fail', 'is-pending');
      var status = item.querySelector('.check-item__status');
      var note = item.querySelector('.check-item__note');
      if (status) status.remove();
      if (note) note.remove();
    });
  }

  function renderAiMarks() {
    clearAiMarks();
    if (!aiResult) return;

    checkItems.forEach(function (item) {
      var id = item.dataset.id;
      var status = AI_STATUS[aiResult.items[id]];
      var noteText = aiResult.notes ? aiResult.notes[id] : '';

      if (status) {
        var badge = document.createElement('span');
        badge.className = 'check-item__status check-item__status--' + status.modifier;
        badge.textContent = status.text;
        item.insertBefore(badge, item.querySelector('.check-item__priority'));
        if (status.state) item.classList.add(status.state);
      }

      if (noteText) {
        var note = document.createElement('p');
        note.className = 'check-item__note';
        note.textContent = noteText;
        item.querySelector('.check-item__content').appendChild(note);
      }
    });
  }

  function updateAiInfo() {
    if (!aiResult) {
      aiInfo.textContent = '';
      return;
    }
    var fail = 0;
    var pending = 0;
    Object.keys(aiResult.items).forEach(function (id) {
      if (aiResult.items[id] === 'fail') fail++;
      else if (aiResult.items[id] === 'check') pending++;
    });
    aiInfo.textContent = 'AI 검수 결과: ' + (aiResult.file || '-') + ' · ' + (aiResult.date || '-')
      + ' · 수정 필요 ' + fail + ' · 확인 필요 ' + pending;
  }

  // Keep only ids that exist on this page; returns null when the format is invalid
  function normalizeAiResult(data) {
    if (!data || typeof data.items !== 'object' || data.items === null) return null;
    var items = {};
    var notes = {};
    var ignored = 0;
    Object.keys(data.items).forEach(function (id) {
      var input = document.getElementById(id);
      var isItem = input && input.classList.contains('check-item__input');
      if (!isItem || !Object.prototype.hasOwnProperty.call(AI_STATUS, data.items[id])) {
        ignored++;
        return;
      }
      items[id] = data.items[id];
      if (data.notes && typeof data.notes[id] === 'string') notes[id] = data.notes[id];
    });
    if (Object.keys(items).length === 0) return null;
    return { file: data.file || '', date: data.date || '', items: items, notes: notes, ignored: ignored };
  }

  function applyAiResult(result) {
    aiResult = result;
    Object.keys(result.items).forEach(function (id) {
      var input = document.getElementById(id);
      var isDone = result.items[id] === 'pass' || result.items[id] === 'na';
      input.checked = isDone;
      input.closest('.check-item').classList.toggle('is-checked', isDone);
    });
    renderAiMarks();
    updateAiInfo();
    saveState();
    updateProgress();
    try {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(result));
    } catch (e) {
      // ignore
    }
  }

  function loadAiResult() {
    try {
      var saved = localStorage.getItem(AI_STORAGE_KEY);
      if (!saved) return;
      aiResult = normalizeAiResult(JSON.parse(saved));
      renderAiMarks();
      updateAiInfo();
    } catch (e) {
      // ignore
    }
  }

  // Import AI result
  importBtn.addEventListener('click', function () {
    importInput.click();
  });

  importInput.addEventListener('change', function () {
    var file = importInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var result = null;
      try {
        result = normalizeAiResult(JSON.parse(reader.result));
      } catch (e) {
        result = null;
      }
      importInput.value = '';
      if (!result) {
        alert('AI 검수 결과 형식이 아닙니다. items에 항목 id와 상태값(pass/fail/na/check)이 있는 JSON 파일을 선택하세요.');
        return;
      }
      applyAiResult(result);
      if (result.ignored > 0) {
        alert('체크리스트에 없는 id 또는 잘못된 상태값 ' + result.ignored + '건은 제외하고 반영했습니다.');
      }
    };
    reader.readAsText(file);
  });

  // Reset
  resetBtn.addEventListener('click', function () {
    if (!confirm('모든 체크 항목을 초기화하시겠습니까?')) return;
    checkInputs.forEach(function (input) {
      input.checked = false;
      input.closest('.check-item').classList.remove('is-checked');
    });
    aiResult = null;
    clearAiMarks();
    updateAiInfo();
    try {
      localStorage.removeItem(AI_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    saveState();
    updateProgress();
  });

  // Initialize
  loadState();
  loadAiResult();
  updateProgress();

  // Set initial tabindex for all sections
  categorySections.forEach(function (section) {
    updateTabIndex(section);
  });
});
