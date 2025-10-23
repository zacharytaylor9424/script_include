import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
	const items = await prisma.item.findMany();
	return NextResponse.json(items);
}

export async function POST(req: Request) {
	const { name, value } = await req.json();
	const item = await prisma.item.create({ data: { name, value } });
	return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');
	
	if (!id) {
		return NextResponse.json({ error: 'ID is required' }, { status: 400 });
	}
	
	try {
		await prisma.item.delete({ where: { id } });
		return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Item not found' }, { status: 404 });
	}
}

export async function PUT(req: Request) {
	const { id, name, value } = await req.json();
	
	if (!id) {
		return NextResponse.json({ error: 'ID is required' }, { status: 400 });
	}
	
	try {
		const item = await prisma.item.update({
			where: { id },
			data: { name, value },
		});
		return NextResponse.json(item, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Item not found' }, { status: 404 });
	}
}