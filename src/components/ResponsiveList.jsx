import React from "react";

/**
 * ResponsiveList
 * - Desktop: renderiza "desktop" (normalmente tu TablaMinimalista)
 * - Mobile: renderiza "mobile" (normalmente un listado de cards)
 *
 * Props:
 *  - isMobile: boolean
 *  - desktop: ReactNode
 *  - mobile: ReactNode
 *  - mobileClassName?: string (wrapper opcional)
 *  - desktopClassName?: string (wrapper opcional)
 */
export default function ResponsiveList({
    isMobile,
    desktop,
    mobile,
    mobileClassName = "",
    desktopClassName = "",
}) {
    return isMobile ? (
        <div className={mobileClassName}>{mobile}</div>
    ) : (
        <div className={desktopClassName}>{desktop}</div>
    );
}
