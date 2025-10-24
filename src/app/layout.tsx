import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Script Include Ltd",
	description:
		"Script Include Ltd is a software development company that provides software development services to businesses.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
				<nav className="w-full flex justify-between items-center px-4 ">
					{/* Logo */}
					{/* <div className="pt-2 pl-4">
						<Link href="/" className="flex items-center">
							<Image
								src="/ScriptInclude.png"
								alt="Script Include Ltd Logo"
								width={150}
								height={60}
								className="h-12 w-auto object-contain"
								priority
							/>
						</Link>
					</div> */}

					{/* Navigation Menu */}
					<NavigationMenu>
						<NavigationMenuList>
							{/* <NavigationMenuItem>
								<NavigationMenuLink href="/">Home</NavigationMenuLink>
							</NavigationMenuItem> */}
							{/* <NavigationMenuItem>
								<NavigationMenuLink href="/turkey">Thanksgiving</NavigationMenuLink>
							</NavigationMenuItem> */}
						</NavigationMenuList>
					</NavigationMenu>
				</nav>
				<main className="flex-1">{children}</main>
				<footer className="w-full flex justify-center items-center px-4 h-20 mt-auto">
					<p className="text-sm text-gray-500">
						&copy; {new Date().getFullYear()} Script Include Ltd. All rights reserved.
					</p>
				</footer>
				<Toaster />
			</body>
		</html>
	);
}
