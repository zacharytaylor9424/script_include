"use client";

import { useEffect, useState, useRef } from "react";
import { useItems } from "@/hooks/useItems";
import { itemsAPI } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import Recaptcha, { RecaptchaRef } from "@/components/Recaptcha";

interface Item {
	id: string;
	name: string;
	value: string;
}

export default function HolidayPage() {
	const { items, loading, refreshing, error, sortField, sortDirection, handleSort, refetch } = useItems();
	const [isOpen, setIsOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Item | null>(null);
	const [formData, setFormData] = useState({ name: "", value: "" });
	const [submitting, setSubmitting] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<Item | null>(null);
	const recaptchaRef = useRef<RecaptchaRef>(null);
	const deletingIdRef = useRef<string | null>(null);

	// Predefined names for the combobox
	const nameOptions = [
		{ value: "Con & Lare", label: "Con & Lare" },
		{ value: "Josh & Jess", label: "Josh & Jess" },
		{ value: "Ken & Linda", label: "Ken & Linda" },
		{ value: "Luke & Cheyenne", label: "Luke & Cheyenne" },
		{ value: "Zach & Kerrie", label: "Zach & Kerrie" },
	];

	useEffect(() => {
		// Trigger fade-in after component mounts
		setTimeout(() => {
			setIsVisible(true);
		}, 50);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!formData.name.trim() || !formData.value.trim()) {
			return;
		}

		try {
			setSubmitting(true);
			setLocalError(null);

			// Execute reCAPTCHA automatically
			recaptchaRef.current?.execute();
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : "An error occurred");
			setSubmitting(false);
		}
	};

	const handleRecaptchaChange = async (token: string | null) => {
		if (!token) return;

		try {
			if (editingItem) {
				// Update existing item
				const response = await itemsAPI.updateItem({ 
					id: editingItem.id, 
					name: formData.name, 
					value: formData.value,
					recaptchaToken: token 
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Reset form and close edit modal
				setFormData({ name: "", value: "" });
				setEditingItem(null);
				setIsEditOpen(false);
				recaptchaRef.current?.reset();

				// Refresh the data to show updated item (silent refresh)
				await refetch(false);
			} else if (deletingIdRef.current) {
				// Delete item
				const response = await itemsAPI.deleteItem(deletingIdRef.current, token);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Reset delete state
				setDeletingId(null);
				deletingIdRef.current = null;
				recaptchaRef.current?.reset();

				// Refresh the data to remove deleted item (silent refresh)
				await refetch(false);
			} else {
				// Create new item
				const response = await itemsAPI.createItem({ 
					...formData, 
					recaptchaToken: token 
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Reset form and close add modal
				setFormData({ name: "", value: "" });
				setIsOpen(false);
				recaptchaRef.current?.reset();

				// Refresh the data to show new item (silent refresh)
				await refetch(false);
			}
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : "An error occurred");
			// Clear deleting state on error
			if (deletingIdRef.current) {
				setDeletingId(null);
				deletingIdRef.current = null;
			}
		} finally {
			setSubmitting(false);
		}
	};

	const handleRecaptchaExpired = () => {
		// For v3, we don't need to handle expiration
	};

	const handleRecaptchaError = () => {
		// For v3, errors are handled in the executeRecaptchaAction callback
	};

	const handleEdit = (item: Item) => {
		setEditingItem(item);
		setFormData({ name: item.name, value: item.value });
		setIsEditOpen(true);
	};

	const handleDelete = async (id: string) => {
		try {
			setSubmitting(true);
			setLocalError(null);

			// Store the ID to delete in both state and ref
			setDeletingId(id);
			deletingIdRef.current = id;
			
			// Execute reCAPTCHA automatically for delete
			recaptchaRef.current?.execute();
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : "An error occurred");
			setSubmitting(false);
		}
	};

	const handleRowClick = (item: Item) => {
		setSelectedItem(item);
		setActionDialogOpen(true);
	};

	const handleActionDialogClose = () => {
		setActionDialogOpen(false);
		setSelectedItem(null);
	};

	if (loading) {
		return (
			<div
				className={`container mx-auto px-4 py-8 transition-opacity duration-1000 ease-in-out ${
					isVisible ? "opacity-100" : "opacity-0"
				}`}>
				{/* <h1 className="text-3xl font-bold mb-6">What are you bringing to Thanksgiving?</h1> */}
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6">What are you bringing to Thanksgiving?</h1>
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					<strong>Error:</strong> {error}
				</div>
			</div>
		);
	}

	return (
		<div
			className={`container mx-auto px-4 py-8 transition-opacity duration-1000 ease-in-out ${
				isVisible ? "opacity-100" : "opacity-0"
			}`}>
			<h1 className="text-3xl font-bold mb-6 text-aqua-forest-900">What are you bringing to Thanksgiving?</h1>

			<div className="bg-white rounded-lg shadow-lg border border-aqua-forest-200 overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-aqua-forest-100">
							<TableHead className="w-20 text-aqua-forest-900 font-bold hidden sm:table-cell">Action</TableHead>
							<TableHead className="text-aqua-forest-900 font-bold">
								Name {refreshing && <span className="text-xs text-gray-500">(updating...)</span>}
							</TableHead>
							<TableHead className="text-aqua-forest-900 font-bold">Dish or Drink</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={3} className="text-center text-aqua-forest-600 py-8">
									No items found
								</TableCell>
							</TableRow>
						) : (
							items.map((item, index) => {
								const isDeleting = deletingId === item.id;
								return (
									<TableRow 
										key={item.id} 
										className={`hover:bg-aqua-forest-50 border-b border-aqua-forest-100 ${
											isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer sm:cursor-default'
										}`}
										onClick={() => {
											// Only trigger on mobile (touch devices) and if not deleting
											if (window.innerWidth < 640 && !isDeleting) {
												handleRowClick(item);
											}
										}}>
										<TableCell className="hidden sm:table-cell">
											{isDeleting ? (
												<div className="h-8 w-8 flex items-center justify-center">
													<div className="animate-spin rounded-full h-4 w-4 border-2 border-aqua-forest-300 border-t-aqua-forest-600"></div>
												</div>
											) : (
												<Button
													variant="outline"
													size="sm"
													className="h-8 w-8 p-0 hover:bg-aqua-forest-50 border-aqua-forest-300"
													onClick={() => handleRowClick(item)}>
													<i className="fas fa-pencil-alt text-aqua-forest-900"></i>
												</Button>
											)}
										</TableCell>
										<TableCell className="text-aqua-forest-800 font-medium">
											{item.name}
											{isDeleting && (
												<span className="ml-2 text-xs text-aqua-forest-500">
													<i className="fas fa-spinner fa-spin mr-1"></i>
													Deleting...
												</span>
											)}
										</TableCell>
										<TableCell className="text-aqua-forest-800 wrap-break-word whitespace-normal">
											{item.value}
										</TableCell>
									</TableRow>
								);
							})
						)}
						
						{/* Add Item Button Row */}
						<TableRow className="border-t-2 border-aqua-forest-200">
							<TableCell colSpan={3} className="text-center py-4">
								<Sheet open={isOpen} onOpenChange={setIsOpen}>
									<SheetTrigger asChild>
										<Button className="bg-aqua-forest-600 hover:bg-aqua-forest-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200 hover:scale-105">
											<i className="fas fa-plus mr-2"></i>
											Add Item
										</Button>
									</SheetTrigger>
									<SheetContent side="right">
										<SheetHeader>
											<SheetTitle>What are you bringing to Thanksgiving?</SheetTitle>
											<SheetDescription>
												Tell us who you are and what you're bringing! Please list one thing at a time.
											</SheetDescription>
										</SheetHeader>
										<form onSubmit={handleSubmit} className="space-y-4 mt-6 mx-4">
											<div>
												<label htmlFor="name" className="block text-sm font-medium text-aqua-forest-700 mb-2">
													Your Name
												</label>
												<Combobox
													value={formData.name}
													onValueChange={(value) => setFormData({ ...formData, name: value })}
													placeholder="Select your name"
													options={nameOptions}
													disabled={submitting}													
												/>
											</div>
											<div>
												<label htmlFor="value" className="block text-sm font-medium text-aqua-forest-700 mb-2">
													Dish or Drink
												</label>
												<Input
													id="value"
													type="text"
													value={formData.value}
													onChange={(e) => setFormData({ ...formData, value: e.target.value })}
													placeholder="What are you bringing?"
													required
													className="border-aqua-forest-300 focus:border-aqua-forest-500 focus:ring-aqua-forest-500"
												/>
											</div>
											{localError && (
												<div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
													{localError}
												</div>
											)}
											<div className="flex gap-3 pt-4">
												<Button
													type="submit"
													disabled={submitting}
													className="bg-aqua-forest-600 hover:bg-aqua-forest-700 text-white transition-all duration-200 hover:scale-105">
													{submitting ? "Adding..." : "Add Item"}
												</Button>
												<Button
													type="button"
													variant="outline"
													onClick={() => {
														setIsOpen(false);
														setFormData({ name: "", value: "" });
														recaptchaRef.current?.reset();
													}}
													disabled={submitting}
													className="border-aqua-forest-300 text-aqua-forest-700 hover:bg-aqua-forest-50 transition-all duration-200 hover:scale-105">
													Cancel
												</Button>
											</div>
										</form>
									</SheetContent>
								</Sheet>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 text-sm text-aqua-forest-700 font-medium">Total items: {items.length}</div>

			{/* Hidden reCAPTCHA for delete operations */}
			<div style={{ display: 'none' }}>
				<Recaptcha
					ref={recaptchaRef}
					onChange={handleRecaptchaChange}
					onExpired={handleRecaptchaExpired}
					onError={handleRecaptchaError}
				/>
			</div>


			{/* Edit Modal */}
			<Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Edit Your Item</SheetTitle>
						<SheetDescription>Update the details for this holiday item.</SheetDescription>
					</SheetHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-6 px-4">
						{localError && (
							<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
								<strong>Error:</strong> {localError}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="edit-name">Your Name</Label>
							<Combobox
								value={formData.name}
								onValueChange={(value) => setFormData({ ...formData, name: value })}
								placeholder="Select your name"
								options={nameOptions}
								disabled={submitting}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-value">What you're bringing</Label>
							<Input
								id="edit-value"
								type="text"
								placeholder="e.g., Apple pie, Wine, Side dish"
								value={formData.value}
								onChange={(e) => setFormData({ ...formData, value: e.target.value })}
								required
							/>
						</div>

						<div className="flex gap-2 pt-4">
								<Button
									type="submit"
									disabled={submitting}
									className="bg-aqua-forest-600 hover:bg-aqua-forest-700 text-white transition-all duration-200 hover:scale-105">
									{submitting ? "Updating..." : "Update Item"}
								</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsEditOpen(false);
									setEditingItem(null);
									setFormData({ name: "", value: "" });
									recaptchaRef.current?.reset();
								}}
								disabled={submitting}
								className="border-aqua-forest-300 text-aqua-forest-700 hover:bg-aqua-forest-50 transition-all duration-200 hover:scale-105">
								Cancel
							</Button>
						</div>
					</form>
				</SheetContent>
			</Sheet>

			{/* Single Action Dialog */}
			<AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Choose Action</AlertDialogTitle>
						<AlertDialogDescription>
							{selectedItem?.name}, what would you like to do with "{selectedItem?.value}"?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex-col sm:flex-row gap-2">
						<AlertDialogAction
							onClick={() => {
								if (selectedItem) {
									handleEdit(selectedItem);
									handleActionDialogClose();
								}
							}}
							className="w-full sm:w-auto bg-aqua-forest-500 hover:bg-aqua-forest-600">
							<i className="fas fa-edit mr-2"></i>
							Edit
						</AlertDialogAction>
						<AlertDialogAction
							onClick={() => {
								if (selectedItem) {
									handleDelete(selectedItem.id);
									handleActionDialogClose();
								}
							}}
							className="w-full sm:w-auto bg-aqua-forest-800 hover:bg-aqua-forest-900">
							<i className="fas fa-trash mr-2"></i>
							Delete
						</AlertDialogAction>
						<AlertDialogCancel 
							onClick={handleActionDialogClose}
							className="w-full sm:w-auto">
							Cancel
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
