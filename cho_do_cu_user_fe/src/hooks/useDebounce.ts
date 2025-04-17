'use client'

import {useEffect, useRef, useState} from "react";

const useDebounce = (value: string, delay: number) => {
    const [debounceValue, setDebounceValue] = useState('')
    const timerRef = useRef()

    useEffect(() => {
        // @ts-ignore
        timerRef.current = setTimeout(() => setDebounceValue(value), delay)

        return () => {
            clearTimeout(timerRef.current)
        }
    }, [value, delay])

    return debounceValue
}

export default useDebounce
