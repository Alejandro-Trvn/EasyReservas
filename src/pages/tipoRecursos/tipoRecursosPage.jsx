import React from "react";
import TablaMinimalista from "../../components/Table/Table";
import Paginador from "../../components/Table/Paginador";
import Buscador from "../../components/Table/Buscador";
import ScreenLoader from "../../components/ScreenLoader";
import Alert, { showAlert } from "../../components/Alert";
import { Search } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Button from "../../components/Button";
import CrearEditarRecurso from "./CrearEditarRecurso";
import useTipoRecursos from "../../services/tipoRecursos/usetipoRecursos";

import ResponsiveList from "../../components/ResponsiveList";
import useIsMobile from "../../hooks/useIsMobile";

const TipoRecursosPage = () => {
	const { tipoRecursos, loading, error, refetch, deleteTipoRecurso } = useTipoRecursos();

	const [modalOpen, setModalOpen] = React.useState(false);
	const [editing, setEditing] = React.useState(null);

	const [deleting, setDeleting] = React.useState(false);
	const [deletingId, setDeletingId] = React.useState(null);

	const [searchTerm, setSearchTerm] = React.useState("");
	const [currentPage, setCurrentPage] = React.useState(1);
	const pageSize = 7;

	// ✅ Opción B: hook reutilizable
	const isMobile = useIsMobile();

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
	}, [totalPages, currentPage]);

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
				setDeletingId(t.id);
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
					showAlert({
						type: "fail",
						title: "Error",
						text: err?.response?.data?.message || err?.message || "Error al eliminar.",
					});
				} finally {
					setDeleting(false);
					setDeletingId(null);
				}
			},
		});
	}

	async function handleSaved(payload) {
		await refetch();
	}

	return (
		<div className="space-y-5 sm:space-y-6">
			<SectionHeader
				title="Tipos de Recursos"
				subtitle="Listado de tipos de recursos"
				Icon={Search}
				bgColor="linear-gradient(to right, #134224, #22c55e)"
			/>

			<div className="flex justify-end">
				<div className="w-full sm:w-auto">
					<Button
						onClick={() => {
							setEditing(null);
							setModalOpen(true);
						}}
						className="w-full sm:w-auto"
					>
						Nuevo tipo
					</Button>
				</div>
			</div>

			<Alert />

			<div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 relative">
				<ScreenLoader
					loading={loading}
					message={"Cargando tipos de recursos..."}
					color="#f2f7f6"
					height={10}
					width={4}
				/>
				<ScreenLoader
					loading={deleting}
					message={"Eliminando tipo de recurso..."}
					color="#f87171"
					height={10}
					width={4}
				/>

				{error ? (
					<div className="text-red-600">
						<p>Error cargando tipos de recursos.</p>
						<button onClick={refetch} className="mt-2 text-sm text-blue-600 underline">
							Reintentar
						</button>
					</div>
				) : (
					<div className="bg-white rounded-md p-0">
						<div className="p-3 sm:p-4">
							<Buscador
								value={searchTerm}
								onChange={(v) => setSearchTerm(v)}
								placeholder={"Buscar por nombre o descripción"}
							/>
						</div>

						{totalItems === 0 ? (
							<div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center text-gray-500">
								<Search size={40} className="mb-4 text-gray-400" />
								<div className="text-lg font-medium">No se encontraron registros</div>
							</div>
						) : (
							<>
								{/* ✅ Mobile: cards | Desktop: tabla (Opción B) */}
								<ResponsiveList
									isMobile={isMobile}
									mobileClassName="px-3 pb-3 space-y-3 sm:px-0 sm:pb-0"
									desktop={
										<TablaMinimalista
											columns={columns}
											rows={rows}
											dotKeys={[]}
											bodyClassName="text-xs text-slate-700"
											headerBg={"bg-blue-100 border-b border-blue-600"}
										/>
									}
									mobile={
										<>
											{visible.map((t) => (
												<TipoRecursoCard
													key={t.id}
													t={t}
													deletingId={deletingId}
													onEdit={() => handleEdit(t)}
													onDelete={() => handleDelete(t)}
												/>
											))}
										</>
									}
								/>

								<div className="p-3 sm:p-4">
									<Paginador
										totalItems={totalItems}
										pageSize={pageSize}
										currentPage={currentPage}
										onPageChange={(p) => setCurrentPage(p)}
									/>
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

/* ---------------- UI Helpers ---------------- */

function TipoRecursoCard({ t, deletingId, onEdit, onDelete }) {
	const estado =
		t.estado === 1
			? { text: "Activo", cls: "text-emerald-700 bg-emerald-50 border-emerald-100" }
			: { text: "Inactivo", cls: "text-red-700 bg-red-50 border-red-100" };

	return (
		<div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="text-base font-bold text-slate-900 truncate">
						{t.nombre || t.name || "—"}
					</div>
					<div className="mt-0.5 text-xs text-slate-500 truncate">
						{t.descripcion || t.description || "—"}
					</div>
				</div>

				<span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${estado.cls}`}>
					{estado.text}
				</span>
			</div>

			<div className="mt-4 flex items-center justify-end gap-2">
				<button
					onClick={onEdit}
					className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 transition"
					type="button"
				>
					<FiEdit />
					Editar
				</button>

				{deletingId === t.id ? (
					<div className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600">
						Eliminando...
					</div>
				) : (
					<button
						onClick={onDelete}
						className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 transition"
						type="button"
					>
						<FiTrash2 />
						Eliminar
					</button>
				)}
			</div>
		</div>
	);
}
