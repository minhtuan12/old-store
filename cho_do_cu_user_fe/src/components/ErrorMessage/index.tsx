'use client'

import React, {memo} from "react";

interface IErrorProps {
    message: string,
    className?: string
}

const ErrorMessage = memo(function ErrorMessage({message, className = ''}: IErrorProps) {
    return <span className={`error ${className}`}>
        {message}
    </span>
})

export default ErrorMessage
