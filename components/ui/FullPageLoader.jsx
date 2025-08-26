import React from "react";
import { Loader2 } from "lucide-react"; // Ensure you have this icon from lucide-react

const FullPageLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-colors duration-300">
            <div className="text-center">
                <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
};

export default FullPageLoader;
