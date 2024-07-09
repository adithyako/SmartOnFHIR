import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6 transition-transform transform hover:scale-105">
            <header className="bg-gray-200 p-4 rounded-t-lg font-bold mb-4 text-lg">{title}</header>
            <div>{children}</div>
        </section>
    );
};

export default Card;
