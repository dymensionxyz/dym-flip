export const formatNumber = (value: number): string => {
    return Intl.NumberFormat('en', { useGrouping: true, notation: 'compact' }).format(Number(value));
};
