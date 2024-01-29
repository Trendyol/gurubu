"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export const GoBackButton = () => {
	const router = useRouter();

	return (
		<button
			className="not-found-page__navigation__go-back"
			onClick={() => {
				router.back();
			}}>
			<Image
				priority
				src="/left-arrow.svg"
				alt="left-arrow"
				width={24}
				height={24}
			/>
			Go back
		</button>
	);
};
