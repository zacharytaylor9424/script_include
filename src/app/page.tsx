"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Trigger fade-in after component mounts
		setTimeout(() => {
			setIsVisible(true);
		}, 50);
	}, []);

	return (
		<div className={`font-sans p-8 sm:p-20 transition-opacity duration-1000 ease-in-out ${
			isVisible ? "opacity-100" : "opacity-0"
		}`}>
			<div className="max-w-4xl mx-auto">
				<Image
					className="dark:invert mx-auto"
					src="/ScriptInclude.png"
					alt="Script Include Ltd Logo"
					width={180}
					height={38}
					priority
				/>
				{/* <h1 className="text-4xl font-bold mb-2 text-center">Script Include Ltd</h1> */}
				<p className="text-lg mt-6 text-center">
					Script Include Ltd is a software development company that provides comprehensive software development services
					to businesses of all sizes.
				</p>
			</div>
		</div>
	);
}
