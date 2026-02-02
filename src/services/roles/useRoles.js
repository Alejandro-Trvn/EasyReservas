import { useCallback, useEffect, useState } from "react";
import { listarRoles } from "./rolesService";

export default function useRoles() {
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchRoles = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await listarRoles();
			setRoles(data || []);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchRoles();
	}, [fetchRoles]);

	return { roles, loading, error, refetch: fetchRoles };
}

