/**
 * Main JavaScript file for Asset Management System
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all DataTables
  initializeDataTables();
  
  // Initialize form validation
  initializeFormValidation();
  
  // Setup filter toggles
  setupFilterToggles();
  
  // Initialize tooltips
  initializeTooltips();
});

/**
 * Initialize DataTables on tables with the datatable class
 */
function initializeDataTables() {
  const tables = document.querySelectorAll('.datatable');
  
  tables.forEach(table => {
    $(table).DataTable({
      responsive: true,
      language: {
        search: "_INPUT_",
        searchPlaceholder: "Search...",
        lengthMenu: "Show _MENU_ entries",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        infoEmpty: "Showing 0 to 0 of 0 entries",
        infoFiltered: "(filtered from _MAX_ total entries)"
      },
      dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
      pageLength: 10,
      lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]]
    });
  });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
}

/**
 * Setup filter toggle functionality
 */
function setupFilterToggles() {
  const filterToggles = document.querySelectorAll('.filter-toggle');
  
  filterToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const filterContainer = document.querySelector(this.dataset.target);
      
      if (filterContainer) {
        filterContainer.classList.toggle('show');
        
        // Change icon
        const icon = this.querySelector('i');
        if (icon) {
          if (filterContainer.classList.contains('show')) {
            icon.classList.remove('fa-filter');
            icon.classList.add('fa-times');
          } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-filter');
          }
        }
      }
    });
  });
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Format currency values
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

/**
 * Format date values
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  }).format(date);
}

/**
 * Format date with time
 */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Generate a slug from a string
 */
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Confirm dialog for delete operations
 */
function confirmDelete(message = 'This action cannot be undone. Are you sure?') {
  return confirm(message);
}

/**
 * Filter table rows based on search input
 */
function filterTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName('tr');
  
  input.addEventListener('keyup', function() {
    const filter = input.value.toUpperCase();
    
    for (let i = 1; i < rows.length; i++) {
      let visible = false;
      const cells = rows[i].getElementsByTagName('td');
      
      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        if (cell) {
          const text = cell.textContent || cell.innerText;
          if (text.toUpperCase().indexOf(filter) > -1) {
            visible = true;
            break;
          }
        }
      }
      
      rows[i].style.display = visible ? '' : 'none';
    }
  });
}