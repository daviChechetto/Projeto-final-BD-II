import { toast } from 'react-toastify';

// Aqui definimos todas as opções padrão para os nossos toasts
const defaultOptions = {
  position: "top-right",
  autoClose: 3500,       // Fecha automaticamente após 3 segundos
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",      // Opções: "light", "dark", "colored"
};

/**
 * Serviço para exibir notificações toast de forma padronizada na aplicação.
 */
export const ToastService = {
  /**
   * Exibe uma notificação de sucesso.
   * @param {string} message - A mensagem a ser exibida.
   */
  success: (message) => {
    toast.success(message, defaultOptions);
  },

  /**
   * Exibe uma notificação de erro.
   * @param {string} message - A mensagem a ser exibida.
   */
  error: (message) => {
    toast.error(message, defaultOptions);
  },

  /**
   * Exibe uma notificação de aviso.
   * @param {string} message - A mensagem a ser exibida.
   */
  warn: (message) => {
    toast.warn(message, defaultOptions);
  },

  /**
   * Exibe uma notificação de informação.
   * @param {string} message - A mensagem a ser exibida.
   */
  info: (message) => {
    toast.info(message, defaultOptions);
  }
};