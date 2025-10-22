import { prisma } from "@/lib/prisma";

export async function GET() {
	const items = await prisma.item.findMany();
	return Response.json(items);
}

export async function POST(req: Request) {
	const { name, value } = await req.json();
	const item = await prisma.item.create({ data: { name, value } });
	return new Response(JSON.stringify(item), { status: 201 });
}
