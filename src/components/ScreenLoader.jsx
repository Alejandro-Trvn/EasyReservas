
import React from "react";
import FadeLoader from "react-spinners/FadeLoader";

const ScreenLoader = ({ loading = true, message = "Cargando...", color = "#10B981", height = 10, width = 6 }) => {
	if (!loading) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="flex flex-col items-center bg-white/5 backdrop-blur-sm rounded-lg p-6">
				<FadeLoader
					loading={true}
					color={color}
					height={height}
					width={width}
					radius={2}
					margin={2}
				/>
				{message && <div className="mt-3 text-sm text-white">{message}</div>}
			</div>
		</div>
	);
};

export default ScreenLoader;
