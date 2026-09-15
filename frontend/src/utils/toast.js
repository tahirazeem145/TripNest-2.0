/**
 * Lightweight Toast notification utility for user feedback
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (typeof document === 'undefined') return;
    
    let container = document.getElementById('tripnest-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tripnest-toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      });
      document.body.appendChild(container);
    }
    this.container = container;
  }

  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.initContainer();
    if (!this.container) return;

    const toast = document.createElement('div');
    const colors = {
      success: { bg: '#059669', text: '#ffffff' },
      error: { bg: '#dc2626', text: '#ffffff' },
      info: { bg: '#2563eb', text: '#ffffff' },
      warning: { bg: '#d97706', text: '#ffffff' },
    };

    const style = colors[type] || colors.info;

    Object.assign(toast.style, {
      padding: '12px 20px',
      backgroundColor: style.bg,
      color: style.text,
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
      opacity: '0',
      transform: 'translateY(10px)',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: 'auto',
      maxWidth: '360px',
    });

    toast.textContent = message;
    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  success(msg, duration) {
    this.show(msg, 'success', duration);
  }

  error(msg, duration) {
    this.show(msg, 'error', duration);
  }

  info(msg, duration) {
    this.show(msg, 'info', duration);
  }

  warning(msg, duration) {
    this.show(msg, 'warning', duration);
  }
}

export const toast = new ToastManager();
export default toast;
