import React from 'react';
import styles from './TabGroup.module.css';

export default function TabGroup({
    tabs,
    activeTab,
    onTabChange,
    buttonClassName,      
    containerClassName,
    activeButtonClassName,
}) {
    return (
        <div className={containerClassName || styles.tabGroup}>
            {tabs.map(tab => {
                const isActive = activeTab === tab.key;
                const btnClass = buttonClassName 
                    ? `${buttonClassName} ${isActive && activeButtonClassName ? activeButtonClassName : ''}`
                    : `${styles.tabGroupButton} ${isActive ? styles.activeTab : ''}`;

                return (
                    <button
                        key={tab.key}
                        type={tab.type || 'button'}
                        className={btnClass}
                        onClick={() => tab.onClick ? tab.onClick() : onTabChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
