import React from 'react';
import classNames from 'classnames';
import './spinner.scss';

export interface SpinnerProps {
    className?: string;
    size?: 'xs' | 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ className, size = 'medium' }) => {
    return <span className={classNames('spinner', size, className)} />;
};

export default Spinner;
