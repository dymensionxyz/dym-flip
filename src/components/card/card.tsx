import classNames from 'classnames';
import React, { ReactNode } from 'react';
import './card.scss';

interface CardProps {
    children: ReactNode;
    className?: string;
    size?: 'small' | 'medium' | 'large'
}

const Card: React.FC<CardProps> = ({ children, className, size }) => {
    return <div className={classNames('card', className, size)}>{children}</div>;
};

export default Card;
