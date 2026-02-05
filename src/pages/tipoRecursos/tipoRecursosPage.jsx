import React from "react";
import TablaMinimalista from "../../components/Table/Table";
import Paginador from "../../components/Table/Paginador";
import Buscador from "../../components/Table/Buscador";
import ScreenLoader from "../../components/ScreenLoader";
import Alert, { showAlert } from "../../components/Alert";
import { Search } from "lucide-react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Button from "../../components/Button";
import CrearEditarRecurso from "./CrearEditarRecurso";
import useTipoRecursos from "../../services/tipoRecursos/usetipoRecursos";

const TipoRecursosPage = () => {
	const { tipoRecursos, loading, error, refetch, deleteTipoRecurso } = useTipoRecursos();
	const [modalOpen, setModalOpen] = React.useState(false);
	const [editing, setEditing] = React.useState(null);
	const [deleting, setDeleting] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [currentPage, setCurrentPage] = React.useState(1);
	const pageSize = 7;

	const normalized = (searchTerm || "").toString().trim().toLowerCase();
	const filtered = (tipoRecursos || []).filter((t) => {
		if (!normalized) return true;
		const nombre = (t.nombre || t.name || "").toString().toLowerCase();
		const descripcion = (t.descripcion || t.description || "").toString().toLowerCase();
		return nombre.includes(normalized) || descripcion.includes(normalized);
	});

	const totalItems = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

	React.useEffect(() => setCurrentPage(1), [normalized]);
	React.useEffect(() => {
		if (currentPage > totalPages) setCurrentPage(totalPages);
	}, [totalPages]);

	const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	const columns = [
		{ key: "nombre", title: "Nombre" },
		{ key: "descripcion", title: "Descripción" },
		{ key: "estado", title: "Activo", align: "center", width: "80px" },
		{ key: "actions", title: "Acciones", align: "center", width: "120px" },
	];

	const rows = (visible || []).map((t) => ({
		id: t.id,
		nombre: t.nombre || t.name || "—",
		descripcion: t.descripcion || t.description || "—",
		estado: (
			<button
				type="button"
				className={
					t.estado === 1
						? "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
						: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
				}
			>
				{t.estado === 1 ? "Activo" : "Inactivo"}
			</button>
		),
		actions: (
			<div className="flex items-center justify-center gap-2">
				<button
					onClick={() => handleEdit(t)}
					title="Editar"
					className="p-2 rounded-md text-sky-600 hover:bg-sky-50"
				>
					<FiEdit />
				</button>
				<button
					onClick={() => handleDelete(t)}
					title="Eliminar"
					className="p-2 rounded-md text-red-600 hover:bg-red-50"
				>
					<FiTrash2 />
				</button>
			</div>
		),
	}));

	function handleEdit(t) {
		setEditing(t);
		setModalOpen(true);
	}

	function handleDelete(t) {
		showAlert({
			type: "warning",
			title: "Confirmar eliminación",
			text: `Eliminar tipo de recurso ${t.nombre || t.name}?`,
			showCancel: true,
			confirmText: "Eliminar",
			cancelText: "Cancelar",
			onConfirm: async () => {
				setDeleting(true);
				try {
					await deleteTipoRecurso(t.id);
					showAlert({
						type: "success",
						title: "Eliminado",
						text: `Tipo de recurso ${t.nombre || t.name} eliminado.`,
						confirmText: "OK",
						autoClose: false,
						showCancel: false,
					});
					await refetch();
				} catch (err) {
					showAlert({ type: "fail", title: "Error", text: err?.response?.data?.message || err?.message || "Error al eliminar." });
				} finally {
					setDeleting(false);
				}
			},
		});
	}

	async function handleSaved(payload) {
		// placeholder: implement create/update API call here when available
		// for now just refetch the list so UI updates if backend changes externally
		await refetch();
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h1 className="text-2xl font-semibold">Tipo de Recursos</h1>
					<p className="text-sm text-emerald-600 mt-1">Listado de tipos de recursos</p>
				</div>
				<div>
					<Button
						onClick={() => {
							setEditing(null);
							setModalOpen(true);
						}}
					>
						Nuevo tipo
					</Button>
				</div>
			</div>

			<Alert />

			<div className="bg-white rounded-md shadow-md p-6 border border-gray-100 relative">
				<ScreenLoader loading={loading} message={"Cargando tipos de recursos..."} color="#f2f7f6" height={10} width={4} />
				<ScreenLoader loading={deleting} message={"Eliminando tipo de recurso..."} color="#f87171" height={10} width={4} />

				{error ? (
					<div className="text-red-600">
						<p>Error cargando tipos de recursos.</p>
						<button onClick={refetch} className="mt-2 text-sm text-blue-600 underline">
							Reintentar
						</button>
					</div>
				) : (
					<div className="bg-white rounded-md p-0">
						<div className="p-4">
							<Buscador value={searchTerm} onChange={(v) => setSearchTerm(v)} placeholder={"Buscar por nombre o descripción"} />
						</div>

						{totalItems === 0 ? (
							<div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
								<Search size={40} className="mb-4 text-gray-400" />
								<div className="text-lg font-medium">No se encontraron registros</div>
							</div>
						) : (
							<>
								<TablaMinimalista columns={columns} rows={rows} dotKeys={[]} bodyClassName="text-xs text-slate-700" headerBg={"bg-amber-100 border-b border-amber-600"} />
								<div className="p-4">
									<Paginador totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
								</div>
							</>
						)}
					</div>
				)}

				<CrearEditarRecurso
					isOpen={modalOpen}
					onClose={() => {
						setModalOpen(false);
						setEditing(null);
					}}
					onSaved={handleSaved}
					initialData={editing}
				/>
			</div>
		</div>
	);
};

export default TipoRecursosPage;
