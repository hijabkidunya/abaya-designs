"use client";
import { useEffect, useState } from "react";
import FullPageLoader from "@/components/ui/FullPageLoader";

export default function AppHydrationLoader({ children }) {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) {
        return <FullPageLoader />;
    }

    return <>{children}</>;
} 