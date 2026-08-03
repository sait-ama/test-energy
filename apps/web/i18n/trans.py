import json
import asyncio
from googletrans import Translator
import logging

# Настройка логгирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация переводчика
translator = Translator()

async def translate_text(text):
    """Асинхронный перевод текста с русского на английский"""
    try:
        # Создаем задачу на перевод с задержкой
        await asyncio.sleep(1)  # Задержка для избежания блокировки
        result = await translator.translate(text, src='ru', dest='en')
        return result.text
    except Exception as e:
        logger.error(f"Ошибка перевода: {e}")
        return text

async def deep_sync(ru_data, en_data):
    """
    Рекурсивно синхронизирует и переводит данные из ru.json в en.json
    """
    if isinstance(ru_data, dict):
        # Обработка словаря
        result = {}
        for key, ru_value in ru_data.items():
            en_value = en_data.get(key) if isinstance(en_data, dict) else None
            result[key] = await deep_sync(ru_value, en_value)
        return result

    elif isinstance(ru_data, list):
        # Обработка списка
        result = []
        en_list = en_data if isinstance(en_data, list) else []
        for i, ru_item in enumerate(ru_data):
            en_item = en_list[i] if i < len(en_list) else None
            result.append(await deep_sync(ru_item, en_item))
        return result

    elif isinstance(ru_data, str):
        # Обработка строки: проверяем существующий перевод
        if en_data and isinstance(en_data, str) and en_data.strip():
            return en_data  # Используем существующий перевод

        # Переводим, если перевод отсутствует или невалиден
        logger.info(f"Перевод: '{ru_data}'")
        return await translate_text(ru_data)

    else:
        # Числа, булевы значения, null - возвращаем как есть
        return ru_data

async def main():
    """Основная асинхронная функция"""
    # Загрузка данных
    with open('ru.json', 'r', encoding='utf-8') as f:
        ru = json.load(f)

    with open('en.json', 'r', encoding='utf-8') as f:
        en = json.load(f)

    # Синхронизация и перевод
    updated_en = await deep_sync(ru, en)

    # Сохранение результата
    with open('en_updated.json', 'w', encoding='utf-8') as f:
        json.dump(updated_en, f, ensure_ascii=False, indent=2, separators=(',', ': '))

    logger.info("Обновленный en.json сохранен как en_updated.json")

if __name__ == '__main__':
    # Запуск асинхронного кода
    asyncio.run(main())