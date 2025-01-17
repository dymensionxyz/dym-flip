'use client';

import { CoinFlipContractFunction } from '@/core/types';
import React from 'react';
import Card from '@/components/card/card';
import Spinner from '@/components/spinner/spinner';
import { useGame } from '@/core/game-context';
import { formatNumber } from '@/utils/number-utils';
import './house-info.scss';

const HouseInfo: React.FC = () => {
    const {
        rewards,
        gameStatusLoading,
        minBet,
        maxBet,
        broadcastingMessage,
        flipping,
        claimRewards,
    } = useGame();

    return (
        <Card className='house-info'>
            {gameStatusLoading ? <Spinner size='small' className='info-spinner' /> : <>
                <p className='info-property'>
                    Min Bet<b className='info-property-value'>{formatNumber(minBet || 0)} DYM</b>
                </p>

                <p className='info-property'>
                    Max Bet<b className='info-property-value'>{formatNumber(maxBet || 0)} DYM</b>
                </p>

                <p className='info-property'>
                    Rewards<b className='info-property-value'>{formatNumber(rewards || 0)} DYM</b>
                </p>

                <button
                    className='button claim-button'
                    disabled={Boolean(!rewards || broadcastingMessage || flipping)}
                    onClick={() => claimRewards()}
                >
                    Claim{broadcastingMessage === CoinFlipContractFunction.withdraw ?
                    <>&nbsp;<Spinner size='small' /></> : undefined}
                </button>
            </>}
        </Card>
    );
};

export default HouseInfo;
