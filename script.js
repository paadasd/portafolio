'use strict';

// ===== DATOS GLOBALES =====
let portfolioData = [];

// ===== FUNCIONES DE UTILIDAD =====
const toggleElement = (elem) => elem.classList.toggle("active");

// ===== PORTFOLIO =====
async function loadPortfolio() {
  try {
    let portfolioPath;
    if (typeof portfolioFile !== 'undefined') {
      portfolioPath = portfolioFile;
    } else {
      portfolioPath = './portfolio_es.json';
    }
    
    const response = await fetch(portfolioPath);
    const data = await response.json();
    portfolioData = data.projects;
    displayPortfolio(portfolioData);
    initFilters();
  } catch (error) {
    console.error('Error cargando portfolio:', error);
    portfolioData = [];
    displayPortfolio(portfolioData);
    initFilters();
  }
}

function displayPortfolio(projects) {
  const projectList = document.getElementById('project-list');
  if (!projectList) return;

  projectList.innerHTML = '';

  projects.forEach(project => {
    const projectItem = createProjectItem(project);
    projectList.appendChild(projectItem);
  });

  setTimeout(() => {
    initVideoThumbnails();
    initProjectLinks();
  }, 100);
}

function createProjectItem(project) {
  const projectItem = document.createElement('li');
  projectItem.className = 'project-item active';
  projectItem.setAttribute('data-filter-item', '');
  projectItem.setAttribute('data-category', project.category);
  
  const mediaContent = getMediaContent(project);
  
  projectItem.innerHTML = `
    <a href="#" class="project-link" data-project-id="${project.id}">
      <figure class="project-img">
        <div class="project-item-icon-box">
          <ion-icon name="eye-outline"></ion-icon>
        </div>
        ${mediaContent}
      </figure>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-category">${getCategoryName(project.category)}</p>
    </a>
  `;
  
  return projectItem;
}

function getMediaContent(project) {
  switch (project.type) {
    case 'video':
      return `
        <div class="video-thumbnail">
          <video preload="metadata" muted>
            <source src="${project.video}" type="video/mp4">
          </video>
        </div>
      `;
    
    case 'pdf':
      return `
        <div class="pdf-preview">
          <ion-icon name="document-text-outline" class="pdf-icon"></ion-icon>
          <div class="pdf-preview-info">
            <div class="pdf-preview-title">${project.title}</div>
            <div class="pdf-preview-text">Documento PDF</div>
          </div>
        </div>
      `;
    
    case '3d':
      return project.preview ? `
        <div class="image-container">
          <img src="${project.preview}" alt="${project.title}" loading="lazy"
               onerror="handleImageError(this, '${project.title}', '3d')">
        </div>
      ` : `
        <div class="model3d-preview">
          <ion-icon name="cube-outline" class="model3d-icon"></ion-icon>
          <div class="model3d-preview-info">
            <div class="model3d-preview-title">${project.title}</div>
            <div class="model3d-preview-text">Modelo 3D</div>
          </div>
        </div>
      `;
    
    default:
      return `
        <div class="image-container">
          <img src="${project.image}" alt="${project.title}" loading="lazy"
               onerror="handleImageError(this, '${project.title}', 'image')">
        </div>
      `;
  }
}

function handleImageError(element, title, type) {
  element.style.display = 'none';
  
  if (type === '3d') {
    element.parentElement.innerHTML = `
      <div class="model3d-preview">
        <ion-icon name="cube-outline" class="model3d-icon"></ion-icon>
        <div class="model3d-preview-info">
          <div class="model3d-preview-title">${title}</div>
          <div class="model3d-preview-text">Modelo 3D</div>
        </div>
      </div>
    `;
  } else {
    element.parentElement.innerHTML = `
      <div class="media-error">
        <ion-icon name="image-outline"></ion-icon>
        <p>Error cargando imagen</p>
      </div>
    `;
  }
}

function getCategoryName(category) {
  const categories = {
    'ilustracion-digital': 'Ilustración Digital',
    'diseno-grafico': 'Diseño Gráfico',
    'animacion-digital': 'Animación Digital',
    'fotografia': 'Fotografía',
    'desarrollo-web': 'Desarrollo Web',
    'realidad-aumentada': 'Realidad Aumentada'
  };
  
  return categories[category] || category;
}

function initVideoThumbnails() {
  document.querySelectorAll('.video-thumbnail video').forEach(video => {
    video.load();
  });
}

function initProjectLinks() {
  document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const projectId = parseInt(this.getAttribute('data-project-id'));
      openProjectModal(projectId);
    });
  });
}

// ===== MODAL =====
function openProjectModal(projectId) {
  const project = portfolioData.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById('portfolio-modal');
  const modalMedia = document.getElementById('modal-media');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDescription = document.getElementById('modal-description');
  const modalTechnologies = document.getElementById('modal-technologies');

  modalMedia.innerHTML = '';
  modalTechnologies.innerHTML = '';

  modalTitle.textContent = project.title;
  modalCategory.textContent = getCategoryName(project.category);
  modalDescription.textContent = project.description;

  if (project.technologies) {
    project.technologies.forEach(tech => {
      const techSpan = document.createElement('span');
      techSpan.className = 'technology-tag';
      techSpan.textContent = tech;
      modalTechnologies.appendChild(techSpan);
    });
  }

  setupModalMedia(modalMedia, project);
  modal.classList.add('active');
  
  modal.querySelector('.portfolio-modal').addEventListener('click', function(e) {
    e.stopPropagation();
  });
}

function setupModalMedia(container, project) {
  switch (project.type) {
    case 'video':
      setupVideoModal(container, project);
      break;
    case 'pdf':
      setupPdfModal(container, project);
      break;
    case '3d':
      setup3dModal(container, project);
      break;
    default:
      setupImageModal(container, project);
  }
}

function setupVideoModal(container, project) {
  const video = document.createElement('video');
  video.className = 'modal-video';
  video.controls = true;
  video.autoplay = true;
  
  if (project.poster) video.poster = project.poster;
  
  const source = document.createElement('source');
  source.src = project.video;
  source.type = 'video/mp4';
  video.appendChild(source);
  
  container.appendChild(video);
}

function setupPdfModal(container, project) {
  const pdfContainer = document.createElement('div');
  pdfContainer.className = 'modal-media-content';
  
  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'pdf-download-btn';
  downloadBtn.href = project.pdf;
  downloadBtn.download = `${project.title}.pdf`;
  downloadBtn.innerHTML = `<ion-icon name="download-outline"></ion-icon> Descargar PDF`;
  
  const pdfViewer = document.createElement('iframe');
  pdfViewer.className = 'pdf-viewer';
  pdfViewer.src = project.pdf;
  
  pdfContainer.appendChild(downloadBtn);
  pdfContainer.appendChild(pdfViewer);
  container.appendChild(pdfContainer);
}

function setup3dModal(container, project) {
  const modelContainer = document.createElement('div');
  modelContainer.className = 'modal-media-content';
  
  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'model3d-download-btn';
  downloadBtn.href = project.model3d;
  downloadBtn.download = `${project.title}.3ds`;
  downloadBtn.innerHTML = `<ion-icon name="download-outline"></ion-icon> Descargar Modelo 3D`;
  
  const preview = document.createElement('div');
  preview.className = 'model3d-viewer';
  
  if (project.preview) {
    const previewImg = document.createElement('img');
    previewImg.src = project.preview;
    previewImg.alt = `Vista previa de ${project.title}`;
    previewImg.style.cssText = 'width:100%; height:100%; object-fit:contain; border-radius:12px;';
    preview.appendChild(previewImg);
  } else {
    preview.innerHTML = `
      <div class="model3d-placeholder">
        <ion-icon name="cube-outline"></ion-icon>
        <h4>Modelo 3D</h4>
        <p>${project.title}</p>
      </div>
    `;
  }
  
  modelContainer.appendChild(downloadBtn);
  modelContainer.appendChild(preview);
  container.appendChild(modelContainer);
}

function setupImageModal(container, project) {
  const imgContainer = document.createElement('div');
  imgContainer.className = 'modal-image-container';
  imgContainer.style.position = 'relative';

  const img = document.createElement('img');
  img.src = project.image;
  img.alt = project.title;
  img.style.cssText = 'width:100%; height:auto; border-radius:12px; cursor: zoom-in;';
  
  img.addEventListener('click', function() {
    openImageZoom(project.image, project.title);
  });

  const zoomBtn = document.createElement('button');
  zoomBtn.className = 'image-zoom-btn';
  zoomBtn.innerHTML = '<ion-icon name="search-outline"></ion-icon>';
  zoomBtn.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.3s ease;
    z-index: 10;
  `;

  zoomBtn.addEventListener('mouseenter', () => {
    zoomBtn.style.background = 'rgba(0, 0, 0, 0.9)';
    zoomBtn.style.transform = 'scale(1.1)';
  });

  zoomBtn.addEventListener('mouseleave', () => {
    zoomBtn.style.background = 'rgba(0, 0, 0, 0.7)';
    zoomBtn.style.transform = 'scale(1)';
  });

  zoomBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageZoom(project.image, project.title);
  });

  imgContainer.appendChild(img);
  imgContainer.appendChild(zoomBtn);
  container.appendChild(imgContainer);
}

function openImageZoom(imageSrc, title) {
  const zoomOverlay = document.createElement('div');
  zoomOverlay.className = 'zoom-overlay';
  zoomOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    cursor: zoom-out;
  `;

  const zoomImg = document.createElement('img');
  zoomImg.src = imageSrc;
  zoomImg.alt = title;
  zoomImg.style.cssText = `
    max-width: 95%;
    max-height: 95%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<ion-icon name="close-outline"></ion-icon>';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 24px;
    transition: all 0.3s ease;
    z-index: 10001;
  `;

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(0, 0, 0, 0.8)';
    closeBtn.style.transform = 'scale(1.1)';
  });

  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(0, 0, 0, 0.5)';
    closeBtn.style.transform = 'scale(1)';
  });

  function closeZoom() {
    document.body.removeChild(zoomOverlay);
    document.removeEventListener('keydown', handleKeyDown);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closeZoom();
    }
  }

  closeBtn.addEventListener('click', closeZoom);
  zoomOverlay.addEventListener('click', (e) => {
    if (e.target === zoomOverlay) {
      closeZoom();
    }
  });

  document.addEventListener('keydown', handleKeyDown);

  zoomOverlay.appendChild(zoomImg);
  zoomOverlay.appendChild(closeBtn);
  document.body.appendChild(zoomOverlay);
}

function closeModal() {
  const modal = document.getElementById('portfolio-modal');
  modal.classList.remove('active');
  
  modal.querySelectorAll('video').forEach(video => {
    video.pause();
    video.currentTime = 0;
  });
}

// ===== FILTROS =====
function initFilters() {
  const filterBtns = document.querySelectorAll("[data-filter-btn]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-select-value]");
  const select = document.querySelector("[data-select]");

  function applyFilter(selectedValue) {
    document.querySelectorAll("[data-filter-item]").forEach(item => {
      const showItem = selectedValue === "todos" || selectedValue === item.dataset.category;
      item.classList.toggle("active", showItem);
    });
  }

  let activeFilter = document.querySelector('[data-filter-btn].active');

  filterBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const selectedValue = this.getAttribute('data-category');
      
      selectValue.textContent = this.textContent;
      applyFilter(selectedValue);

      activeFilter.classList.remove("active");
      this.classList.add("active");
      activeFilter = this;
    });
  });

  selectItems.forEach(item => {
    item.addEventListener("click", function () {
      const selectedValue = this.getAttribute('data-category');
      
      selectValue.textContent = this.textContent;
      toggleElement(select);
      applyFilter(selectedValue);

      const correspondingBtn = document.querySelector(`[data-filter-btn][data-category="${selectedValue}"]`);
      if (correspondingBtn) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        correspondingBtn.classList.add('active');
        activeFilter = correspondingBtn;
      }
    });
  });

  if (select) {
    select.addEventListener("click", () => toggleElement(select));
  }
}

// ===== NAVEGACIÓN =====
function initNavigation() {
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  navLinks.forEach(link => {
    link.addEventListener("click", function () {
      const targetPage = this.textContent.toLowerCase();
      
      pages.forEach((page, index) => {
        const isActive = targetPage === page.dataset.page;
        page.classList.toggle("active", isActive);
        navLinks[index].classList.toggle("active", isActive);
      });
      
      window.scrollTo(0, 0);
    });
  });
}

// ===== FORMULARIO DE CONTACTO =====
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('.form-btn');
  const originalText = submitBtn.innerHTML;
  
  const formData = new FormData(form);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  };
  
  if (!data.name || !data.email || !data.message) {
    showFormMessage('Por favor completa todos los campos', 'error');
    return;
  }
  
  submitBtn.innerHTML = `<ion-icon name="hourglass-outline"></ion-icon><span>Enviando...</span>`;
  submitBtn.disabled = true;
  
  sendEmail(data, submitBtn, originalText);
}

function sendEmail(data, submitBtn, originalText) {
  const subject = `Nuevo mensaje de ${data.name} desde tu portfolio`;
  
  const body = `Nombre: ${data.name}%0D%0AEmail: ${data.email}%0D%0A%0D%0AMensaje:%0D%0A${data.message}`;
  
  const mailtoLink = `mailto:jtroncosoart@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  const mailWindow = window.open(mailtoLink, '_blank');
  
  setTimeout(() => {
    if (mailWindow && !mailWindow.closed) {
      showFormMessage('¡Mensaje enviado! Te responderé pronto.', 'success');
      document.getElementById('contact-form').reset();
    } else {
      window.location.href = mailtoLink;
      showFormMessage('Cliente de correo abierto. Completa el envío allí.', 'success');
      document.getElementById('contact-form').reset();
    }
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    
  }, 1000);
}

function showFormMessage(message, type) {
  const existingMessage = document.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `form-message ${type}`;
  messageDiv.textContent = message;
  
  const form = document.getElementById('contact-form');
  form.parentNode.insertBefore(messageDiv, form.nextSibling);
  
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

function initFormValidation() {
  const formInputs = document.querySelectorAll('#contact-form .form-input');
  
  formInputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      clearFieldError(this);
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Por favor ingresa un email válido');
      return false;
    }
  }
  
  if (field.required && !value) {
    showFieldError(field, 'Este campo es requerido');
    return false;
  }
  
  clearFieldError(field);
  return true;
}

function showFieldError(field, message) {
  clearFieldError(field);
  field.style.borderColor = 'var(--bittersweet-shimmer)';
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: var(--bittersweet-shimmer);
    font-size: var(--fs-8);
    margin-top: 5px;
  `;
  
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.style.borderColor = '';
  
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  
  if (!scrollToTopBtn) return;

  function toggleScrollToTopButton() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition > 500 || (scrollPosition + windowHeight) >= (documentHeight - 100)) {
      scrollToTopBtn.classList.add('active');
      
      if ((scrollPosition + windowHeight) >= (documentHeight - 100)) {
        scrollToTopBtn.classList.add('pulse');
      } else {
        scrollToTopBtn.classList.remove('pulse');
      }
    } else {
      scrollToTopBtn.classList.remove('active', 'pulse');
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  window.addEventListener('scroll', toggleScrollToTopButton);
  scrollToTopBtn.addEventListener('click', scrollToTop);
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Home') {
      e.preventDefault();
      scrollToTop();
    }
  });

  toggleScrollToTopButton();
}

// ===== INICIALIZACIÓN =====
function initApp() {
  loadPortfolio();
  initNavigation();
  initContactForm();
  initFormValidation();
  initScrollToTop();

  // Sidebar toggle
  const sidebarBtn = document.querySelector('[data-sidebar-btn]');
  const sidebar = document.querySelector('[data-sidebar]');
  
  if (sidebarBtn && sidebar) {
    sidebarBtn.addEventListener('click', () => toggleElement(sidebar));
  }

  // Modal events
  const modalContainer = document.getElementById('portfolio-modal');
  const overlay = document.querySelector("[data-overlay]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  
  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }
  
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalContainer.classList.contains('active')) {
      closeModal();
    }
  });

  if (modalContainer) {
    modalContainer.addEventListener('click', function(e) {
      if (e.target === modalContainer) {
        closeModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);