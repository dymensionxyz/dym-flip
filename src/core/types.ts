export const JSON_RPC = 'https://json-rpc.ra-1.rollapp.network';
export const COIN_FLIP_CONTRACT_ADDRESS = '0xfae52eaFEB6bac9413a7210228D78AE036D348c9';

export const DEFAULT_BROADCAST_ATTEMPTS = 3;

export enum CoinSide {
    DYM, LOGO
}

export interface GameResult {
    status: bigint;
    won: boolean;
    playerChoice: bigint;
    betAmount: bigint;
}

export interface ContractMessage {
    address: string;
    data: string;
    value?: string;
}

export const SUCCESS_MESSAGES = [
    '🏆 Another win! Congratulations!',
    '🥳 Great job! You’ve won again!',
    '🎉 You’re on a roll! Another win!',
    '🌟 You’ve done it again! Well played!',
    '👏 Victory! You’re unstoppable!',
    '🪙 Flip success! Another win for you!',
    '💰 Winner again! Keep it up!',
    '🎊 You’re racking up wins! Nice flip!',
];

export const LOSING_MESSAGES = [
    '😔 Better luck next time!',
    '🪙 You lost this flip, but don’t give up!',
    '🤷 Not your day, but keep flipping!',
    '🌧️ This one didn’t go your way. Try again!',
    '😅 So close! Maybe next time.',
    '💔 You’ve lost this round. Flip again!',
    '❌ Oh no! The coin wasn’t in your favor.',
    '🥶 Tough break! Don’t lose hope!',
    '🐾 The coin walked away from you this time!',
    '🤞 Not a win, but your next flip could be the one!',
];


export enum CoinFlipContractFunction {
    startGame = 'startGame', completeGame = 'completeGame', withdraw = 'withdraw'
}
