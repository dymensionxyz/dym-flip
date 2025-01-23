import { useEffect, useState } from 'react';

type WindowSize = { width: number; height: number, isMobile: boolean, isTablet: boolean };

const MOBILE_WIDTH = 720;
const TABLET_WIDTH = 1024;

const getCurrentWindowSize = (): WindowSize => ({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= MOBILE_WIDTH,
    isTablet: window.innerWidth <= TABLET_WIDTH,
});

const useWindowSize = (): WindowSize => {
    const [ windowSize, setWindowSize ] = useState<WindowSize>(getCurrentWindowSize());

    useEffect(() => {
        const handleResize = (): void => setWindowSize(getCurrentWindowSize());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

export default useWindowSize;
