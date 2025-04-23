import { computed, ref } from 'vue';

export const notification = ref<{
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
}>({
  message: '',
  type: 'info',
  isVisible: false,
});

export function showError(message: string) {
  if (!navigator.onLine) {
    message = "Il semble que vous n'êtes pas connecté à Internet. Veuillez vérifier votre connexion.";
  }

  notification.value = {
    message,
    type: 'error',
    isVisible: true,
  };

  setTimeout(() => {
    notification.value.isVisible = false;
  }, 5000);
}


export function showSuccess(message: string) {
  notification.value = {
    message,
    type: 'success',
    isVisible: true,
  };
  
  setTimeout(() => {
    notification.value.isVisible = false;
  }, 5000);
}

export const currentNotification = computed(() => notification.value);
