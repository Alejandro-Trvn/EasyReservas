import { api } from "../apiClient";

export async function listarRoles() {
	try {
		const res = await api.get("/roles");
		return res.data;
	} catch (error) {
		throw error;
	}
}

export default { listarRoles };

