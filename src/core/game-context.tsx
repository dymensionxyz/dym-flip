'use client';

import { CoinFlipABI } from '@/core/contracts/coin-flip-abi';
import {
    COIN_FLIP_CONTRACT_ADDRESS, CoinFlipContractFunction,
    CoinSide,
    ContractMessage, DEFAULT_BROADCAST_ATTEMPTS,
    GameResult,
    JSON_RPC,
    LOSING_MESSAGES,
    SUCCESS_MESSAGES,
} from '@/core/types';
import { showErrorToast, showSuccessToast } from '@/core/utils/toast-utils';
import { ethers, formatEther } from 'ethers';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider(JSON_RPC));
const flipContract = new web3.eth.Contract(CoinFlipABI, COIN_FLIP_CONTRACT_ADDRESS);

interface GameContextValue {
    address: string;
    hexAddress: string;
    balance?: number;
    minBet?: number;
    maxBet?: number;
    rewards?: number;
    flipping: boolean;
    broadcastingMessage?: string;
    bet?: string;
    canReveal: boolean;
    gameStatusLoading: boolean;
    coinSide: CoinSide;
    contractMessageToExecute?: ContractMessage;
    setAddresses: (address: string, hexAddress: string) => void;
    setBalance: (value?: number) => void;
    startGame: () => void;
    claimRewards: () => void;
    setBet: (value?: string) => void;
    completeGame: () => void;
    setCoinSide: (side: CoinSide) => void;
    setContractMessageExecuted: () => void;
    handleTxResponse: (response: any) => void;
}

export const GameContext = createContext<GameContextValue>({} as GameContextValue);

export const useGame = (): GameContextValue => useContext(GameContext);

export const GameContextProvider = ({ children }: { children: ReactNode }) => {
    const [ address, setAddress ] = useState('');
    const [ hexAddress, setHexAddress ] = useState('');
    const [ balance, setBalance ] = useState<number>();
    const [ minBet, setMinBet ] = useState<number>();
    const [ maxBet, setMaxBet ] = useState<number>();
    const [ rewards, setRewards ] = useState<number>();
    const [ flipping, setFlipping ] = useState(false);
    const [ canReveal, setCanReveal ] = useState(false);
    const [ gameStatusLoading, setGameStatusLoading ] = useState(true);
    const [ bet, setBet ] = useState<string>();
    const [ broadcastingMessage, setBroadcastingMessage ] = useState<string>();
    const [ broadcastingAttempts, setBroadcastingAttempts ] = useState(0);
    const [ coinSide, setCoinSide ] = useState<CoinSide>(CoinSide.LOGO);
    const [ contractMessageToExecute, setContractMessageToExecute ] = useState<ContractMessage>();

    const setAddresses = useCallback((address: string, hexAddress: string): void => {
        setAddress(address);
        setHexAddress(hexAddress);
    }, []);

    const updateGameStatus = useCallback((lastGameResult?: boolean) => {
        if (hexAddress === undefined || balance === undefined) {
            return;
        }
        if (!hexAddress) {
            setGameStatusLoading(false);
            setFlipping(false);
            setCanReveal(false);
            setRewards(undefined);
            setMinBet(undefined);
            setMaxBet(undefined);
            setBroadcastingMessage(undefined);
            setBroadcastingAttempts(0);
            return;
        }
        const promises = [
            flipContract.methods.getBalance(hexAddress).call()
                .then((result) => setRewards(Number(formatEther(result?.toString() || '0')))),
            flipContract.methods.minBetAmount().call()
                .then((result) => setMinBet(Number(formatEther(result?.toString() || '0')))),
            flipContract.methods.calculateMaxBetAmount().call()
                .then((result) => setMaxBet(Number(formatEther(result?.toString() || '0')))),
            !lastGameResult ? Promise.resolve() : flipContract.methods.gameByPlayer(hexAddress).call()
                .then((result: any) => {
                    const gameResult = result as GameResult;
                    if (gameResult.status === BigInt(1)) {
                        setFlipping(true);
                        setCanReveal(true);
                        setBet(formatEther(gameResult.betAmount));
                    }
                }),
        ];
        Promise.all(promises).catch((error) => {
            console.error(error);
            showErrorToast(`Can't load data, please try again later`);
        }).finally(() => setGameStatusLoading(false));
    }, [ balance, hexAddress ]);

    useEffect(() => updateGameStatus(true), [ updateGameStatus ]);

    const startGame = useCallback((retry?: boolean) => {
        if (!hexAddress || contractMessageToExecute || !bet || (!retry && broadcastingMessage)) {
            return;
        }
        const data = flipContract.methods.startGame(coinSide).encodeABI();
        const value = ethers.parseEther(bet).toString();
        setContractMessageToExecute({ address: COIN_FLIP_CONTRACT_ADDRESS, data, value });
        setBroadcastingMessage(CoinFlipContractFunction.startGame);
        setFlipping(true);
        if (!retry) {
            setBroadcastingAttempts(DEFAULT_BROADCAST_ATTEMPTS);
        }
    }, [ bet, broadcastingMessage, coinSide, contractMessageToExecute, hexAddress ]);

    const completeGame = useCallback((retry?: boolean) => {
        if (!hexAddress || contractMessageToExecute || (!retry && broadcastingMessage)) {
            return;
        }
        const data = flipContract.methods.completeGame().encodeABI();
        setContractMessageToExecute({ address: COIN_FLIP_CONTRACT_ADDRESS, data });
        setBroadcastingMessage(CoinFlipContractFunction.completeGame);
        if (!retry) {
            setBroadcastingAttempts(DEFAULT_BROADCAST_ATTEMPTS);
        }
    }, [ broadcastingMessage, contractMessageToExecute, hexAddress ]);

    const claimRewards = useCallback((retry?: boolean) => {
        if (!hexAddress || contractMessageToExecute || (!retry && broadcastingMessage)) {
            return;
        }
        const data = flipContract.methods.withdraw().encodeABI();
        setContractMessageToExecute({ address: COIN_FLIP_CONTRACT_ADDRESS, data });
        setBroadcastingMessage(CoinFlipContractFunction.withdraw);
        if (!retry) {
            setBroadcastingAttempts(DEFAULT_BROADCAST_ATTEMPTS);
        }
    }, [ broadcastingMessage, contractMessageToExecute, hexAddress ]);

    const setContractMessageExecuted = useCallback(() => setContractMessageToExecute(undefined), []);

    const handleLastGameResult = useCallback(async () => {
        try {
            const gameResult = (await flipContract.methods.gameByPlayer(hexAddress).call()) as GameResult;
            if (gameResult.status !== BigInt(2)) {
                showErrorToast(`Can't fetch game status, please try again later`);
                return;
            }
            if (gameResult.won) {
                const successMessage = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
                showSuccessToast(successMessage);
            } else {
                const losingMessage = LOSING_MESSAGES[Math.floor(Math.random() * LOSING_MESSAGES.length)];
                showErrorToast(losingMessage);
                setCoinSide(gameResult.playerChoice === BigInt(CoinSide.LOGO) ? CoinSide.DYM : CoinSide.LOGO);
            }
        } catch (error) {
            console.error(error);
            showErrorToast(`Can't fetch game status, please try again later`);
        }
    }, [ hexAddress ]);

    const handleTxResponse = useCallback(({ response, error }: { response: any, error: any }) => {
        const isUserReject = error?.originalError?.reason?.toLowerCase().includes('reject') ||
            error?.originalError?.message?.toLowerCase().includes('reject') ||
            error?.originalError?.shortMessage?.toLowerCase().includes('reject');

        if (response?.deliveryTxCode === 0 && !error) {
            setBroadcastingMessage(undefined);
            setBroadcastingAttempts(0);
            if (broadcastingMessage === CoinFlipContractFunction.startGame) {
                setTimeout(() => setCanReveal(true), 3000);
                updateGameStatus();
            } else if (broadcastingMessage === CoinFlipContractFunction.completeGame) {
                setFlipping(false);
                setCanReveal(false);
                setBet(undefined);
                updateGameStatus();
                handleLastGameResult().then();
            } else if (broadcastingMessage === CoinFlipContractFunction.withdraw) {
                updateGameStatus();
                showSuccessToast('🏆 Congratulations! Your rewards have been successfully claimed!');
            }
        } else if (broadcastingAttempts > 0 && !isUserReject) {
            setBroadcastingAttempts(broadcastingAttempts - 1);
            if (broadcastingMessage === CoinFlipContractFunction.startGame) {
                startGame(true);
            } else if (broadcastingMessage === CoinFlipContractFunction.completeGame) {
                completeGame(true);
            } else if (broadcastingMessage === CoinFlipContractFunction.withdraw) {
                claimRewards(true);
            }
        } else {
            setBroadcastingAttempts(0);
            setBroadcastingMessage(undefined);
            showErrorToast('Transaction delivery failed, please try again later');
            if (broadcastingMessage === CoinFlipContractFunction.startGame) {
                setFlipping(false);
            }
        }
    }, [
        broadcastingAttempts,
        broadcastingMessage,
        claimRewards,
        completeGame,
        handleLastGameResult,
        startGame,
        updateGameStatus,
    ]);

    return (
        <GameContext.Provider
            value={{
                address,
                flipping,
                minBet,
                maxBet,
                rewards,
                hexAddress,
                balance,
                canReveal,
                setAddresses,
                startGame,
                coinSide,
                setContractMessageExecuted,
                contractMessageToExecute,
                handleTxResponse,
                broadcastingMessage,
                gameStatusLoading,
                completeGame,
                bet,
                claimRewards,
                setBet,
                setCoinSide,
                setBalance,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
