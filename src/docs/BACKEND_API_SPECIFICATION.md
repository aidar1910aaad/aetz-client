# API Спецификация для Заявок (Applications)

## Базовый URL
```
https://aetz-server-production.up.railway.app
```

## Аутентификация
Все запросы требуют Bearer токен в заголовке Authorization:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Создание заявки
**POST** `/bids`

**Тело запроса:**
```json
{
  "taskNumber": "string",
  "date": "string",
  "client": "string",
  "type": "string",
  "user": {
    "id": "number",
    "username": "string",
    "firstName": "string | null",
    "lastName": "string | null"
  } | null,
  "totalAmount": "number",
  "data": {
    "bmz": {
      "buildingType": "string",
      "length": "number",
      "width": "number",
      "height": "number",
      "thickness": "number",
      "blockCount": "number",
      "settings": "object",
      "equipmentState": "object",
      "total": "number"
    },
    "transformer": {
      "selected": "object | null",
      "total": "number"
    },
    "rusn": {
      "cellConfigs": "array",
      "busbarSummary": "object | null",
      "busBridgeSummary": "object | null",
      "busBridgeSummaries": "array",
      "cellSummaries": "array",
      "total": "number"
    },
    "runn": {
      "cellSummaries": "array",
      "busbarSummary": "object | null",
      "busBridgeSummary": "object | null",
      "busBridgeSummaries": "array",
      "total": "number"
    },
    "additionalEquipment": {
      "selected": "object",
      "equipmentList": "array",
      "total": "number"
    },
    "works": {
      "selected": "object",
      "worksList": "array",
      "total": "number"
    }
  }
}
```

**Ответ:**
```json
{
  "id": 1,
  "bidNumber": "BID-2024-001",
  "type": "БКТП",
  "date": "2024-09-17",
  "client": "ООО Ромашка",
  "taskNumber": "12345",
  "totalAmount": 52899246.59,
  "data": { ... },
  "user": { ... },
  "createdAt": "2024-09-17T10:00:00Z",
  "updatedAt": "2024-09-17T10:00:00Z"
}
```

### 2. Получение всех заявок
**GET** `/bids`

**Ответ:**
```json
[
  {
    "id": 1,
    "bidNumber": "BID-2024-001",
    "type": "БКТП",
    "date": "2024-09-17",
    "client": "ООО Ромашка",
    "taskNumber": "12345",
    "totalAmount": 52899246.59,
    "data": { ... },
    "user": { ... },
    "createdAt": "2024-09-17T10:00:00Z",
    "updatedAt": "2024-09-17T10:00:00Z"
  }
]
```

### 3. Получение заявки по ID
**GET** `/bids/{id}`

**Ответ:**
```json
{
  "id": 1,
  "bidNumber": "BID-2024-001",
  "type": "БКТП",
  "date": "2024-09-17",
  "client": "ООО Ромашка",
  "taskNumber": "12345",
  "totalAmount": 52899246.59,
  "data": { ... },
  "user": { ... },
  "createdAt": "2024-09-17T10:00:00Z",
  "updatedAt": "2024-09-17T10:00:00Z"
}
```

### 4. Получение заявки по номеру
**GET** `/bids/number/{bidNumber}`

**Ответ:**
```json
{
  "id": 1,
  "bidNumber": "BID-2024-001",
  "type": "БКТП",
  "date": "2024-09-17",
  "client": "ООО Ромашка",
  "taskNumber": "12345",
  "totalAmount": 52899246.59,
  "data": { ... },
  "user": { ... },
  "createdAt": "2024-09-17T10:00:00Z",
  "updatedAt": "2024-09-17T10:00:00Z"
}
```

### 5. Обновление заявки
**PATCH** `/bids/{id}`

**Тело запроса:** (частичные данные)
```json
{
  "type": "БКТП",
  "client": "Новый клиент",
  "totalAmount": 60000000
}
```

**Ответ:**
```json
{
  "id": 1,
  "bidNumber": "BID-2024-001",
  "type": "БКТП",
  "date": "2024-09-17",
  "client": "Новый клиент",
  "taskNumber": "12345",
  "totalAmount": 60000000,
  "data": { ... },
  "user": { ... },
  "createdAt": "2024-09-17T10:00:00Z",
  "updatedAt": "2024-09-17T10:00:00Z"
}
```

### 6. Удаление заявки
**DELETE** `/bids/{id}`

**Ответ:**
```json
{
  "message": "Заявка успешно удалена"
}
```

## Структура данных

### Метаданные заявки (верхний уровень)
- `taskNumber` - Номер задачи
- `date` - Дата создания
- `client` - Клиент
- `type` - Тип заявки (например, "БКТП")
- `user` - Информация о пользователе
- `totalAmount` - Общая сумма заявки

### Данные конфигурации (data)

#### BMZ (Блочно-модульное здание)
- `buildingType` - Тип здания
- `length`, `width`, `height` - Размеры
- `thickness` - Толщина стен
- `blockCount` - Количество блоков
- `settings` - Настройки БМЗ
- `equipmentState` - Состояние оборудования
- `total` - Сумма БМЗ

#### Transformer (Трансформатор)
- `selected` - Данные выбранного трансформатора
- `total` - Сумма трансформатора

#### RUSN (Распределительное устройство среднего напряжения)
- `cellConfigs` - Конфигурации ячеек
- `busbarSummary` - Сводка по шинам
- `busBridgeSummary` - Сводка по мостовым шинам
- `busBridgeSummaries` - Массив сводок по мостовым шинам
- `cellSummaries` - Сводки по ячейкам
- `total` - Сумма РУСН

#### RUNN (Распределительное устройство низкого напряжения)
- `cellSummaries` - Сводки по ячейкам РУНН
- `busbarSummary` - Сводка по шинам РУНН
- `busBridgeSummary` - Сводка по мостовым шинам РУНН
- `busBridgeSummaries` - Массив сводок по мостовым шинам РУНН
- `total` - Сумма РУНН

#### Additional Equipment (Дополнительное оборудование)
- `selected` - Выбранное оборудование
- `equipmentList` - Список доступного оборудования
- `total` - Сумма дополнительного оборудования

#### Works (Работы)
- `selected` - Выбранные работы
- `worksList` - Список доступных работ
- `total` - Сумма работ

## Коды ошибок

- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Заявка не найдена
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Создание заявки
```javascript
const response = await fetch('/api/bids', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify(applicationData)
});
```

### Получение заявки по ID
```javascript
const response = await fetch('/api/bids/123', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
});
const application = await response.json();
```

### Получение заявки по номеру
```javascript
const response = await fetch('/api/bids/number/BID-2024-001', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
});
const application = await response.json();
```