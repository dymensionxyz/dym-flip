import React from 'react';
import { ToastContainer } from 'react-toastify';
import ConnectWidget from '@/app/connect-widget/connect-widget';
import GameCard from '@/app/game-card/game-card';
import HouseInfo from '@/app/house-info/house-info';
import { GameContextProvider } from '@/core/game-context';
import './page.scss';

export default function Home() {
    return (
        <main className='main'>
            <GameContextProvider>
                <GameCard />
                <ConnectWidget />
                <HouseInfo />
                <ToastContainer />
            </GameContextProvider>
        </main>
    );
}
