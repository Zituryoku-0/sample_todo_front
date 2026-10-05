"use client";

import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

export default function Header() {
    const pathname = usePathname();

    if (pathname === "/page/login") {
        return null;
    }

    return (
        <header>
            <nav>
                <LogoutButton />
            </nav>
        </header>
    )
}