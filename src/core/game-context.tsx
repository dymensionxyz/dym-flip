'use client';

import { CoinFlipABI } from '@/core/contracts/coin-flip-abi';
import {
    COIN_FLIP_CONTRACT_ADDRESS,
    CoinSide,
    ContractMessage,
    GameResult,
    JSON_RPC,
    LOSING_MESSAGES,
    SUCCESS_MESSAGES,
} from '@/core/types';
import { ethers, formatEther } from 'ethers';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Bounce, toast } from 'react-toastify';
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
    canReveal: boolean;
    coinSide: CoinSide;
    contractMessageToExecute?: ContractMessage;
    setAddresses: (address: string, hexAddress: string) => void;
    setBalance: (value?: number) => void;
    startGame: (bet: number) => void;
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
    const [ broadcastingMessage, setBroadcastingMessage ] = useState<string>();
    const [ coinSide, setCoinSide ] = useState<CoinSide>(CoinSide.LOGO);
    const [ contractMessageToExecute, setContractMessageToExecute ] = useState<ContractMessage>();

    const setAddresses = useCallback((address: string, hexAddress: string): void => {
        setAddress(address);
        setHexAddress(hexAddress);
    }, []);

    const showErrorToast = useCallback((message: string) => toast.error(message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        theme: 'colored',
        transition: Bounce,
    }), []);

    const showSuccessToast = useCallback((message: string) => toast.success(message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        theme: 'colored',
        transition: Bounce,
    }), []);

    useEffect(() => {
        if (!hexAddress) {
            return;
        }
        try {
            flipContract.methods.getBalance(hexAddress).call()
                .then((result) => setRewards(Number(formatEther(result?.toString() || '0'))));
            flipContract.methods.minBetAmount().call()
                .then((result) => setMinBet(Number(formatEther(result?.toString() || '0'))));
            flipContract.methods.calculateMaxBetAmount().call()
                .then((result) => setMaxBet(Number(formatEther(result?.toString() || '0'))));
        } catch (error) {
            console.error(error);
            showErrorToast(`Can't load data, please try again later`);
        }
    }, [ hexAddress, showErrorToast ]);

    const startGame = useCallback((bet: number) => {
        if (!hexAddress || contractMessageToExecute) {
            return;
        }
        const data = flipContract.methods.startGame(coinSide).encodeABI();
        const value = ethers.parseEther(bet.toString()).toString();
        setContractMessageToExecute({ address: COIN_FLIP_CONTRACT_ADDRESS, data, value });
        setBroadcastingMessage('startGame');
        setFlipping(true);
    }, [ coinSide, contractMessageToExecute, hexAddress ]);

    const completeGame = useCallback(() => {
        if (!hexAddress || contractMessageToExecute) {
            return;
        }
        const data = flipContract.methods.completeGame().encodeABI();
        setContractMessageToExecute({ address: COIN_FLIP_CONTRACT_ADDRESS, data });
        setBroadcastingMessage('completeGame');
    }, [ contractMessageToExecute, hexAddress ]);

    const setContractMessageExecuted = useCallback(() => setContractMessageToExecute(undefined), []);

    const handleLastGameResult = useCallback(async () => {
        try {
            const gameResult = (await flipContract.methods.gameByPlayer(hexAddress).call()) as GameResult;
            console.log(44444, gameResult);
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
    }, [ hexAddress, showErrorToast, showSuccessToast ]);

    const handleTxResponse = useCallback(({ response, error }: { response: any, error: any }) => {
        setBroadcastingMessage(undefined);
        if (response?.deliveryTxCode === 0 && !error) {
            if (broadcastingMessage === 'startGame') {
                setCanReveal(true);
            } else if (broadcastingMessage === 'completeGame') {
                setFlipping(false);
                setCanReveal(false);
                handleLastGameResult().then();
            }
        } else {
            console.error(response, error);
            showErrorToast('Transaction delivery failed, please try again later');
            if (broadcastingMessage === 'startGame') {
                setFlipping(false);
            }
        }
    }, [ broadcastingMessage, handleLastGameResult, showErrorToast ]);

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
                completeGame,
                setCoinSide,
                setBalance,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
