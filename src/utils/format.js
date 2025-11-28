export const formatMoney = (amount, currency = 'PEN') => {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatPercent = (val) => {
    return val ? `${(Number(val) * 100).toFixed(2)}%` : "-";
};

export const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-PE", {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};
