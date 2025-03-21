export default {
  steps: {
    welcome: {
      title: 'Добро пожаловать',
      description: 'Начнем настройку DeepChat'
    },
    provider: {
      title: 'Провайдер моделей',
      description: 'Выберите предпочитаемого провайдера моделей'
    },
    configuration: {
      title: 'Конфигурация модели',
      description: 'Настройте модели, которые хотите использовать'
    },
    complete: {
      title: 'Завершено',
      description: 'Всё готово к работе!'
    }
  },
  title: 'Добро пожаловать в DeepChat',
  description: 'Давайте завершим процесс настройки',
  provider: {
    select: 'Выбрать провайдера',
    apiUrl: 'API URL',
    apiKey: 'API ключ',
    verifyLink: 'Проверить ссылку'
  },
  complete: {
    title: 'Всё готово!',
    description: 'Вы завершили процесс настройки, давайте начнем!'
  },
  buttons: {
    getStarted: 'Начать',
    next: 'Далее',
    back: 'Назад'
  }
}
