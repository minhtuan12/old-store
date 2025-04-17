'use client'

import React from "react";
import {createCache, extractStyle, StyleProvider} from '@ant-design/cssinjs'
import {useServerInsertedHTML} from "next/navigation";

export default function AddStyledComponentRegistry({children}: { children: React.ReactNode }) {
    const [cache] = React.useState(() => createCache());

    useServerInsertedHTML(() => (
        <style id="antd" dangerouslySetInnerHTML={{__html: extractStyle(cache, true)}}></style>
    ));

    return <StyleProvider cache={cache}>{children}</StyleProvider>
}
