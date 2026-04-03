document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'markup-checklist-state';

  // DOM Elements
  const checkItems = document.querySelectorAll('.check-item');
  const progressFill = document.querySelector('.progress-area__bar-fill');
  const checkedCount = document.getElementById('checkedCount');
  const totalCount = document.getElementById('totalCount');
  const percentText = document.getElementById('percentText');
  const resetBtn = document.querySelector('.progress-area__reset');
  const filterBtns = document.querySelectorAll('.filter-tabs__btn');
  const categorySections = document.querySelectorAll('.category-section');

  const totalItems = checkItems.length;
  totalCount.textContent = totalItems;

  // Load saved state
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const state = JSON.parse(saved);
      checkItems.forEach(function (item) {
        const id = item.dataset.id;
        if (state[id]) {
          item.classList.add('is-checked');
        }
      });
    } catch (e) {
      // ignore
    }
  }

  // Save state
  function saveState() {
    var state = {};
    checkItems.forEach(function (item) {
      state[item.dataset.id] = item.classList.contains('is-checked');
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Update progress
  function updateProgress() {
    var checked = document.querySelectorAll('.check-item.is-checked').length;
    var percent = totalItems > 0 ? Math.round((checked / totalItems) * 100) : 0;
    checkedCount.textContent = checked;
    progressFill.style.width = percent + '%';
    percentText.textContent = percent + '%';

    // Update category counts
    categorySections.forEach(function (section) {
      var items = section.querySelectorAll('.check-item');
      var done = section.querySelectorAll('.check-item.is-checked').length;
      var countEl = section.querySelector('.category-section__count');
      if (countEl) {
        countEl.textContent = '(' + done + '/' + items.length + ')';
      }
    });
  }

  // Toggle check item
  checkItems.forEach(function (item) {
    var checkbox = item.querySelector('.check-item__checkbox');
    var label = item.querySelector('.check-item__label');

    function toggle() {
      item.classList.toggle('is-checked');
      saveState();
      updateProgress();
    }

    checkbox.addEventListener('click', toggle);
    label.addEventListener('click', toggle);
  });

  // Toggle category accordion
  categorySections.forEach(function (section) {
    var header = section.querySelector('.category-section__header');
    header.addEventListener('click', function () {
      section.classList.toggle('is-open');
    });
  });

  // Filter tabs
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var filter = btn.dataset.filter;

      categorySections.forEach(function (section) {
        if (filter === 'all') {
          section.style.display = '';
        } else {
          section.style.display = section.dataset.category === filter ? '' : 'none';
        }
      });
    });
  });

  // Reset
  resetBtn.addEventListener('click', function () {
    if (!confirm('모든 체크 항목을 초기화하시겠습니까?')) return;
    checkItems.forEach(function (item) {
      item.classList.remove('is-checked');
    });
    saveState();
    updateProgress();
  });

  // Initialize
  loadState();
  updateProgress();

  // Open first category by default
  if (categorySections.length > 0) {
    categorySections[0].classList.add('is-open');
  }
});
