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
