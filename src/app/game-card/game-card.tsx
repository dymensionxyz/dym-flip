'use client';

import Card from '@/components/card/card';
import Spinner from '@/components/spinner/spinner';
import { useGame } from '@/core/game-context';
import { CoinSide } from '@/core/types';
import classNames from 'classnames';
import Image from 'next/image';
import React, { FormEvent, useCallback, useMemo } from 'react';
import './game-card.scss';

const GameCard: React.FC = () => {
    const {
        balance,
        maxBet,
        minBet,
        flipping,
        coinSide,
        broadcastingMessage,
        canReveal,
        bet,
        setBet,
        setCoinSide,
        startGame,
        completeGame,
    } = useGame();

    const inputDisabled = useMemo(
        () => balance === undefined || maxBet === undefined || minBet === undefined || flipping ||
            Boolean(broadcastingMessage),
        [ balance, maxBet, minBet, flipping, broadcastingMessage ],
    );

    const onBetChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        const inputElement = event.target as HTMLInputElement;
        if (!inputElement.value) {
            setBet(undefined);
            return;
        }
        const match = inputElement.value.match(/^[0-9]{0,18}(\.[0-9]{0,18})?$/);
        if (!match) {
            event.preventDefault();
            inputElement.value = bet || '';
            return;
        }
        const numberValue = Number(inputElement.value);
        if (minBet && numberValue < minBet) {
            event.preventDefault();
            setBet(minBet.toString());
            return;
        }
        if (maxBet && numberValue > maxBet) {
            event.preventDefault();
            setBet(maxBet.toString());
            return;
        }
        setBet(inputElement.value);
    }, [ bet, maxBet, minBet, setBet ]);

    return (
        <Card className='game-card' size='large'>
            <h1 className='card-title'>Dym Flip</h1>

            <h4 className='label'>Click To Choose Side:</h4>
            <div
                className={classNames('coin-container', { logo: coinSide === CoinSide.LOGO, flipping })}
                onClick={() => setCoinSide(coinSide === CoinSide.LOGO ? CoinSide.DYM : CoinSide.LOGO)}
            >
                <Image src='/coin.png' fill alt='coin' className='coin-image' />
                <Image src='/dymension-logo-light.svg' fill alt='dymension-logo' className='dymension-logo' />
                <span className='dym'>DYM</span>
            </div>

            <h4 className='label'>Enter Your Bet (DYM):</h4>
            <input
                className='input bet-input'
                placeholder='0.00'
                disabled={inputDisabled}
                value={bet ?? ''}
                onInput={onBetChange}
            />

            <button
                className='button flip-button large'
                disabled={!Number(bet) || !balance || Boolean(broadcastingMessage) || (flipping && !canReveal)}
                onClick={() => flipping ? completeGame() : startGame()}
            >
                {flipping ? 'Reveal' : 'Flip'}
                {broadcastingMessage ? <>&nbsp;<Spinner size='small' /></> : undefined}
            </button>
        </Card>
    );
};

export default GameCard;
