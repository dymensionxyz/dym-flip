'use client';

import { useGame } from '@/core/game-context';
import { getShortenedAddress } from '@/utils/address-utils';
import { formatEther } from 'ethers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './connect-widget.scss';

const DYMENSION_CONNECT_URL = 'http://localhost:3002';
const DYMENSION_CONNECT_NETWORK_IDS = [ 'dymflip_248217-1' ];

const ConnectWidget: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const {
        hexAddress,
        contractMessageToExecute,
        setContractMessageExecuted,
        setAddresses,
        setBalance,
        handleTxResponse,
    } = useGame();
    const [ dymensionConnectOpen, setDymensionConnectOpen ] = useState(false);
    const [ dymensionConnectReady, setDymensionConnectReady ] = useState(false);

    const qrAccount = useMemo(() => typeof window !==
        'undefined' &&
        new URLSearchParams(window?.location.search).get('qrAccount'), []);

    const dymensionConnectUrl = useMemo(
        () => `${DYMENSION_CONNECT_URL}/connect` +
            `${qrAccount ? `/account/${qrAccount}` : ''}?networkIds=${DYMENSION_CONNECT_NETWORK_IDS.join(',')}`,
        [ qrAccount ],
    );

    const sendMessage = useCallback((message: any) =>
        iframeRef.current?.contentWindow?.postMessage(message, DYMENSION_CONNECT_URL), []);

    const updateTriggerBoundingRect = useCallback(() => {
        const boundingRect = buttonRef.current?.getBoundingClientRect();
        if (boundingRect) {
            sendMessage({ type: 'setTriggerBoundingRect', rect: boundingRect });
        }
    }, [ sendMessage ]);

    const initModal = useCallback(() => {
        updateTriggerBoundingRect();
        sendMessage({ type: 'setMenuAlign', align: 'right' });
    }, [ sendMessage, updateTriggerBoundingRect ]);

    console.log('>>>>>>>>>>>>', contractMessageToExecute);

    useEffect(() => {
        console.log('-----', contractMessageToExecute);
        if (contractMessageToExecute) {
            sendMessage({ type: 'executeEthTx', contract: contractMessageToExecute });
            setContractMessageExecuted();
        }
    }, [ contractMessageToExecute, sendMessage, setContractMessageExecuted ]);

    useEffect(() => {
        window.addEventListener('scroll', updateTriggerBoundingRect, true);
        window.addEventListener('resize', updateTriggerBoundingRect, true);
        return () => {
            window.removeEventListener('scroll', updateTriggerBoundingRect, true);
            window.removeEventListener('resize', updateTriggerBoundingRect, true);
        };
    }, [ updateTriggerBoundingRect ]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== DYMENSION_CONNECT_URL) {
                return;
            }
            if (event.data.type === 'ready') {
                setDymensionConnectReady(true);
            }
            if (event.data.type === 'menu-visible') {
                setDymensionConnectOpen(event.data.value);
            }
            if (event.data.type === 'connect') {
                setAddresses(event.data.address, event.data.hexAddress);
                updateTriggerBoundingRect();
            }
            if (event.data.type === 'balances') {
                setBalance(Number(formatEther(event.data.balances[0]?.amount || '0')));
            }
            if (event.data.type === 'disconnect') {
                setAddresses('', '');
                setBalance(undefined);
                updateTriggerBoundingRect();
            }
            if (event.data.type === 'tx-response') {
                handleTxResponse(event.data);
            }
            // if (event.data.type === 'notification') {
            //     setNotifications(event.data.messages);
            // }
            // if (event.data.type === 'wallet-error') {
            //     setTimeout(() => alert(event.data.error?.message), 50);
            // }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [ initModal, setAddresses, sendMessage, setBalance, updateTriggerBoundingRect, handleTxResponse ]);

    return (
        <>
            <button
                className='button connect-wallet-button'
                disabled={!dymensionConnectReady}
                ref={buttonRef}
                onClick={() => {
                    setDymensionConnectOpen(!dymensionConnectOpen);
                    updateTriggerBoundingRect();
                }}
            >
                {hexAddress ? getShortenedAddress(hexAddress) : 'Connect Wallet'}
            </button>
            <iframe
                ref={iframeRef}
                onLoad={initModal}
                style={{ display: dymensionConnectOpen || qrAccount ? 'block' : 'none' }}
                allow='clipboard-read; clipboard-write; camera'
                title='dymension-connect'
                className='dymension-connect-iframe'
                src={dymensionConnectUrl}
            />
        </>
    );
};

export default ConnectWidget;
