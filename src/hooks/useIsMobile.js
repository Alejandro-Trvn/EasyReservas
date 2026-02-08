import { useEffect, useState } from "react";

/**
 * useIsMobile
 * - Por defecto: Tailwind "sm" => max-width: 639px
 */
export default function useIsMobile(query = "(max-width: 639px)") {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia(query);
        const handler = () => setIsMobile(mq.matches);

        handler();
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, [query]);

    return isMobile;
}
