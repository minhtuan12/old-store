"use client"

import React, {createContext, ReactNode, useContext, useState} from 'react';

export type BreadcrumbItem = {
    name: string;
    path?: string;
};

type BreadcrumbContextType = {
    pageTitle: string,
    setPageTitle: (title: string) => void,
    breadcrumb: BreadcrumbItem[];
    setBreadcrumb: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

type BreadcrumbProviderProps = {
    children: ReactNode;
};

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({children}) => {
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [pageTitle, setPageTitle] = useState<string>('')

    return <BreadcrumbContext.Provider value={{pageTitle, setPageTitle, breadcrumb, setBreadcrumb}}>
        {children}
    </BreadcrumbContext.Provider>
}

export const useBreadcrumb = (): BreadcrumbContextType => {
    const context = useContext(BreadcrumbContext);
    if (!context) {
        throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
    }
    return context;
};
