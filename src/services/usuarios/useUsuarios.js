import { useEffect, useState, useCallback } from "react";
import { listarUsuarios, crearUsuario } from "./usuariosService";

export default function useUsuarios() {
	const [usuarios, setUsuarios] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchUsuarios = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await listarUsuarios();
			setUsuarios(data || []);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, []);

	const createUsuario = useCallback(
		async (payload) => {
			setLoading(true);
			setError(null);
			try {
				const data = await crearUsuario(payload);
				// refrescar lista
				await fetchUsuarios();
				return data;
			} catch (err) {
				setError(err);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[fetchUsuarios]
	);

	useEffect(() => {
		fetchUsuarios();
	}, [fetchUsuarios]);

	return { usuarios, loading, error, refetch: fetchUsuarios, createUsuario };
}
