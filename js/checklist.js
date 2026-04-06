document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'markup-checklist-state';

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

  var totalItems = checkInputs.length;
  totalCount.textContent = totalItems;

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
      + String(now.getDate()).padStart(2, '0') + ' '
      + String(now.getHours()).padStart(2, '0') + ':'
      + String(now.getMinutes()).padStart(2, '0');

    var checked = document.querySelectorAll('.check-item__input:checked').length;
    var percent = totalItems > 0 ? Math.round((checked / totalItems) * 100) : 0;

    var lines = [];
    lines.push('마크업 품질 체크리스트 검수 결과');
    lines.push('생성일: ' + dateStr);
    lines.push('진행률: ' + checked + ' / ' + totalItems + ' (' + percent + '%)');
    lines.push('');
    lines.push('='.repeat(50));

    categorySections.forEach(function (section) {
      var title = section.querySelector('.category-section__title');
      var titleText = title ? title.textContent.replace(/\s*\(.*\)/, '') : '';
      var items = section.querySelectorAll('.check-item');
      var sectionDone = section.querySelectorAll('.check-item__input:checked').length;

      lines.push('');
      lines.push('## ' + titleText + ' (' + sectionDone + '/' + items.length + ')');
      lines.push('-'.repeat(50));

      items.forEach(function (item) {
        var input = item.querySelector('.check-item__input');
        var label = item.querySelector('.check-item__label');
        var labelText = label ? (label.dataset.original || label.textContent) : '';
        var mark = input && input.checked ? '[✓]' : '[ ]';
        lines.push(mark + ' ' + labelText);
      });
    });

    lines.push('');
    lines.push('='.repeat(50));

    var text = lines.join('\n');
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'markup-checklist-' + now.getFullYear()
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Reset
  resetBtn.addEventListener('click', function () {
    if (!confirm('모든 체크 항목을 초기화하시겠습니까?')) return;
    checkInputs.forEach(function (input) {
      input.checked = false;
      input.closest('.check-item').classList.remove('is-checked');
    });
    saveState();
    updateProgress();
  });

  // Initialize
  loadState();
  updateProgress();

  // Set initial tabindex for all sections
  categorySections.forEach(function (section) {
    updateTabIndex(section);
  });
});
