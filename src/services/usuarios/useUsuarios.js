import { useEffect, useState, useCallback } from "react";
import { listarUsuarios, crearUsuario, eliminarUsuario, verPerfilUsuario as verPerfilUsuarioService, editarPerfilUsuario as editarPerfilUsuarioService } from "./usuariosService";

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

	const deleteUsuario = useCallback(
		async (id) => {
			setLoading(true);
			setError(null);
			try {
				const data = await eliminarUsuario(id);
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

	const verPerfilUsuario = useCallback(
		async (id) => {
			setLoading(true);
			setError(null);
			try {
				const data = await verPerfilUsuarioService(id);
				return data;
			} catch (err) {
				setError(err);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[verPerfilUsuarioService]
	);

	const editarPerfilUsuario = useCallback(
		async (payload) => {
			setLoading(true);
			setError(null);
			try {
				const data = await editarPerfilUsuarioService(payload);
				return data;
			} catch (err) {
				setError(err);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[editarPerfilUsuarioService]
	);

	useEffect(() => {
		fetchUsuarios();
	}, [fetchUsuarios]);

	return { usuarios, loading, error, refetch: fetchUsuarios, createUsuario, deleteUsuario, verPerfilUsuario, editarPerfilUsuario };
}
