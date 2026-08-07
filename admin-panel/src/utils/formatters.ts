export function formatMZN(value: number): string {
    return `${value.toFixed(2)} MZN`;
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        delivered: 'bg-blue-100 text-blue-800',
        failed: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800',
        available: 'bg-green-100 text-green-800',
        sold: 'bg-purple-100 text-purple-800',
        expired: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}