'use client';

import { CoinFlipContractFunction } from '@/core/types';
import classNames from 'classnames';
import React from 'react';
import Card from '@/components/card/card';
import Spinner from '@/components/spinner/spinner';
import { useGame } from '@/core/game-context';
import { formatNumber } from '@/utils/number-utils';
import './house-info.scss';

interface HouseInfoProps {
    className: string;
}

const HouseInfo: React.FC<HouseInfoProps> = ({ className }) => {
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
        <Card className={classNames('house-info', className)}>
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
