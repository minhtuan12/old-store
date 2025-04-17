"use client";

import React, {useEffect} from 'react';
import {BreadcrumbItem, useBreadcrumb} from "@/app/context/BreadcrumbContext";
import Link from "next/link";
import styles from "@/components/BreadcrumbUpdater/styles.module.scss";
import {useFetchProfile} from "@/api/profile";
import {handleLogout} from "@/actions/auth";

type BreadcrumbUpdaterProps = {
    title: string,
    breadcrumbData: BreadcrumbItem[];
    className?: string
};

const BreadcrumbUpdater: React.FC<BreadcrumbUpdaterProps> = ({title, breadcrumbData, className = ''}) => {
    const {pageTitle, breadcrumb, setBreadcrumb, setPageTitle} = useBreadcrumb();

    useEffect(() => {
        setPageTitle(title)
        setBreadcrumb(breadcrumbData);
    }, [title, breadcrumbData, setBreadcrumb]);

    const handleRenderItemBreadCrumb = (index: number, item: BreadcrumbItem) => {
        switch (index) {
            case 0:
                return (
                    <><Link href={'/'} className={'hover:decoration-transparent'}>
                        <span className={`${styles.text} ${breadcrumb.length > 1 ? styles.activeText : ''}`}>
                            Trang chủ
                        </span>
                    </Link> - </>
                );
            case breadcrumb.length - 1:
                return (
                    <span className={`${styles.text}`}>
                        {item.name}
                    </span>
                )
            default:
                return (
                    <>
                        {
                            item?.path ? <><Link href={item?.path} className={'hover:decoration-transparent'}>
                                <span className={`${styles.text} ${styles.activeText}`}>
                                    {item.name}
                                </span>
                            </Link> - </> : <span className={`${styles.text} ${styles.activeText}`}>
                                {item.name}
                            </span>
                        }
                    </>
                );
        }
    }

    return <div className={className}>
        <div className={'text-[24px] font-semibold'}>{pageTitle}</div>
        <div className={styles.breadcrumbWrap}>
            {
                breadcrumb.map((item: BreadcrumbItem, index: number) => {
                    return <span key={index}>{(handleRenderItemBreadCrumb(index, item))}</span>
                })
            }
        </div>
    </div>
};

export default BreadcrumbUpdater;
