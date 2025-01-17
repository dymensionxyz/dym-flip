export const getShortenedAddress = (address: string, prefixLetters = 6, suffixLetters = 4): string => {
    return `${address.slice(0, prefixLetters)}...${address.slice(address.length - suffixLetters)}`;
};
