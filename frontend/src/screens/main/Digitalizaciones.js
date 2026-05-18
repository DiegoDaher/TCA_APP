"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import HeaderSon from "@/components/layout/HeaderSon";
import SubirDigitalizacion from "@/components/features/Digitalizaciones/subirDigitalizaciones";
import { Card, CardContent } from "@/components/ui/card";

export default function DigitalizacionesScreen() {
	const [digitalizaciones, setDigitalizaciones] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	const handleUploadSuccess = (nuevaDigitalizacion) => {
		if (!nuevaDigitalizacion) return;

		setDigitalizaciones((prev) => [
			{
				id: nuevaDigitalizacion.id,
				titulo: nuevaDigitalizacion.titulo,
				totalHojas: nuevaDigitalizacion.totalHojas ?? 0,
				portadaUrl: nuevaDigitalizacion.portadaUrl,
				createdAt: new Date().toISOString(),
			},
			...prev,
		]);
	};

	const filteredDigitalizaciones = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return digitalizaciones;
		return digitalizaciones.filter((item) =>
			item.titulo?.toLowerCase().includes(term)
		);
	}, [digitalizaciones, searchTerm]);

	return (
		<div className="min-h-screen bg-gray-100">
			<HeaderSon
				title="Digitalizaciones"
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				showAdvancedFilter={false}
			/>

			<main className="container mx-auto p-6 space-y-8">
				{/* Sección de subida */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
					<div className="lg:col-span-1">
						<SubirDigitalizacion onSuccess={handleUploadSuccess} />
					</div>

					<div className="lg:col-span-2 space-y-4">
						<div className="flex items-baseline justify-between">
							<h2 className="text-xl font-semibold text-gray-800">
								Biblioteca digital
							</h2>
							<span className="text-sm text-gray-500">
								{filteredDigitalizaciones.length} grupos de digitalizaciones
							</span>
						</div>

						{filteredDigitalizaciones.length === 0 ? (
							<div className="h-48 flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/60 text-gray-500 text-sm">
								Aún no hay digitalizaciones para mostrar.
							</div>
						) : (
							<div className="space-y-6">
								{/* Fila tipo "Netflix" con scroll horizontal */}
								<div className="space-y-2">
									<h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
										Recientes
									</h3>
									<div className="flex gap-4 pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 rounded-full">
										{filteredDigitalizaciones.map((item) => (
											<Card
												key={item.id}
												className="relative bg-[#0f172a] text-white border-none  shadow-lg shadow-black/40 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-xl"
											>	
												<div className="relative aspect-[3/4] w-full bg-gradient-to-b from-slate-600 to-slate-900">
													{item.portadaUrl ? (
														<Image
															src={item.portadaUrl}
															alt={item.titulo}
															fill
															className="object-cover"
														/>
													) : (
														<div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-200/80">
															<Image
																src="/document-search.svg"
																alt="Digitalización"
																width={40}
																height={40}
																className="mb-2 opacity-80"
															/>
															<span>Sin portada</span>
														</div>
													)}
												</div>

												<CardContent className="p-3 space-y-1.5">
													<h4 className="text-sm font-semibold leading-snug line-clamp-2">
														{item.titulo}
													</h4>
													<p className="text-[11px] text-slate-300/90">
														{item.totalHojas || 0} hojas digitalizadas
													</p>
													{item.createdAt && (
														<p className="text-[10px] text-slate-400">
															Creado: {new Date(item.createdAt).toLocaleDateString()}
														</p>
													)}
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
