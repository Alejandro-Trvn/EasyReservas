// src/components/ScreenLoader.jsx
import React from "react";

const ScreenLoader = ({
	loading = true,
	message = "Cargando...",
	color = "#329c68", // verde

	// Mantengo estas props por si ya las usas en algún lado:
	overlay = true,
	minHeight = "min-h-[400px]",

	// Opcional: si luego quieres volver al overlay oscuro, lo puedes cambiar a "dark"
	variant = "light", // "light" | "dark"
}) => {
	if (!loading) return null;

	const spinnerStyle = { borderBottomColor: color };

	// Overlay full-screen
	if (overlay) {
		const overlayBg =
			variant === "dark" ? "bg-black/40" : "bg-white"; // <- aquí queda “pantalla en blanco”

		const textColor =
			variant === "dark" ? "text-white/90" : "text-green-800";

		return (
			<div className={`fixed inset-0 z-[100] flex items-center justify-center ${overlayBg}`}>
				<div className="text-center">
					<div
						className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-transparent"
						style={spinnerStyle}
						aria-label="Cargando"
					/>
					{message ? <p className={`mt-4 ${textColor}`}>{message}</p> : null}
				</div>
			</div>
		);
	}

	// Inline (dentro del layout), estilo ConfiguracionPage
	return (
		<div className={`flex items-center justify-center ${minHeight}`}>
			<div className="text-center">
				<div
					className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-transparent"
					style={spinnerStyle}
					aria-label="Cargando"
				/>
				{message ? <p className="mt-4 text-green-800">{message}</p> : null}
			</div>
		</div>
	);
};

export default ScreenLoader;
