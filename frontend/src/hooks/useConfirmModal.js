import { useState } from 'react';

/**
 * Hook personalizado para manejar confirmaciones con modal
 * @param {Object} options - Opciones del modal de confirmación
 * @returns {Object} - Estado y funciones para manejar confirmaciones
 */
export const useConfirmModal = (options = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [modalData, setModalData] = useState({
    title: options.title || '¿Estás seguro?',
    message: options.message || '¿Deseas continuar con esta acción?',
    confirmText: options.confirmText || 'Confirmar',
    cancelText: options.cancelText || 'Cancelar',
    type: options.type || 'danger'
  });

  /**
   * Abre el modal de confirmación
   * @param {Function} action - Función a ejecutar si se confirma
   * @param {Object} customData - Datos personalizados para el modal
   */
  const openConfirmModal = (action, customData = {}) => {
    setConfirmAction(() => action);
    setModalData(prev => ({ ...prev, ...customData }));
    setIsOpen(true);
  };

  /**
   * Confirma y ejecuta la acción
   */
  const confirm = async () => {
    if (!confirmAction) return;

    try {
      setIsLoading(true);
      await confirmAction();
      setIsOpen(false);
    } catch (error) {
      console.error('Error during confirmation action:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  /**
   * Cancela la confirmación
   */
  const cancel = () => {
    setIsOpen(false);
    setIsLoading(false);
    setConfirmAction(null);
  };

  return {
    isOpen,
    isLoading,
    modalData,
    openConfirmModal,
    confirm,
    cancel
  };
};
