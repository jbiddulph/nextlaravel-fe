"use client"

import Link from 'next/link';
import { myAppHook } from '@/context/AppProvider';

const NavBar = () => {

    const { logout, authToken } = myAppHook()
    return (
        <nav className="bg-indigo-600 flex h-[60px] items-center justify-between w-full">
            <div className="container mx-auto flex items-center justify-between py-4">
                <Link className="text-white text-xl font-bold" href="/">
                    MyNextApp
                </Link>
                <button
                    className="text-white md:hidden"
                    type="button"
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>
                <div className="hidden md:flex space-x-4 items-center">
                    {authToken ? (
                        <>
                            <Link className="text-white hover:text-gray-300" href="/dashboard">
                                Dashboard
                            </Link>
                            <button className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800" onClick={logout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="text-white hover:text-gray-300" href="/">
                                Home
                            </Link>
                            <Link className="text-white hover:text-gray-300" href="/auth">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;