export const TICKETS_CHOICES = {
    1: 'Выдача модератором',
    2: 'Выдача переводчиком',
    3: 'Выдача по промокоду',
    4: 'Выдача за привязку соц. сетей',
    5: 'Покупка главы',
    6: 'Выдача при пополнении',
    7: 'Выдача за баттлпасс',
};

export const BILLING_CHOICES = {
    0: 'Не назначено',
    1: 'Пополнение',
    3: 'Вывод средств',
    2: 'Покупка главы',
    4: 'Донат',
    5: 'Возврат средств',
    6: 'Покупка платной подписки',
    7: 'ЗП',
    8: 'Покупка тома',
    9: 'Доход по рефералке',
};

export const getStatusRowColor = (status) => {
    switch (status) {
        case 'Ошибка': {
            return '#fa0909';
        }

        case 'В ожидании': {
            return '#e5e53d';
        }

        case 'Успешно': {
            return '#06aa06';
        }

        default: {
            return '#fff';
        }
    }
};

export const getStatusColorBase = (config) => (value) => {
    if (
        'succeed' in config &&
        (typeof config.succeed === 'function' ? config.succeed(value) : config.succeed === value)
    ) {
        return '#06aa06'; // green
    }

    if ('failed' in config && (typeof config.failed === 'function' ? config.failed(value) : config.failed === value)) {
        return '#fa0909'; // red
    }

    if (
        'pending' in config &&
        (typeof config.pending === 'function' ? config.pending(value) : config.pending === value)
    ) {
        return '#e5e53d'; // yellow
    }

    return '#fff'; // gray
};

export const getTicketRowType = (type) => {
    return TICKETS_CHOICES[type] ?? 'Не определено';
};

export const getMoneyRowType = (type) => {
    return BILLING_CHOICES[type] ?? 'Не определено';
};

export const isTicketExpense = (type) => {
    return [5].includes(Number(type));
};

export const isMoneyExpense = (type) => {
    return [2, 3, 4, 6, 8].includes(Number(type));
};
