'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Suppress expected "Blocked by Client" errors from analytics
        if (error.message.includes('Failed to fetch') || error.message.includes('BLOCKED_BY_CLIENT') || error.message.includes('Ad Proxy')) {
            console.warn("Analytics/Ad blocked or failed - suppressing error UI.");
            return;
        }
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // We can just render children anyway if it's a minor error, 
            // but usually we render a fallback.
            // For analytics errors that trigger this, we might want to recover.
            // Actually, usually network errors in event handlers don't trigger Error Boundaries.
            // This only catches errors in RENDER.
            return this.props.children;
        }

        return this.props.children;
    }
}
