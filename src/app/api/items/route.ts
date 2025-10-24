import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Function to verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not found in environment variables");
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export async function GET() {
	const items = await prisma.item.findMany();
	return NextResponse.json(items);
}

export async function POST(req: Request) {
	try {
		const { name, value, recaptchaToken } = await req.json();

		// Verify reCAPTCHA token
		if (!recaptchaToken) {
			return NextResponse.json({ error: "reCAPTCHA token is required" }, { status: 400 });
		}

		const isValidToken = await verifyRecaptcha(recaptchaToken);

		if (!isValidToken) {
			return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
		}

		const item = await prisma.item.create({ data: { name, value } });
		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error("Error creating item:", error);
		return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');
	
	if (!id) {
		return NextResponse.json({ error: 'ID is required' }, { status: 400 });
	}

	try {
		const { recaptchaToken } = await req.json();

		// Verify reCAPTCHA token
		if (!recaptchaToken) {
			return NextResponse.json({ error: "reCAPTCHA token is required" }, { status: 400 });
		}

		const isValidToken = await verifyRecaptcha(recaptchaToken);

		if (!isValidToken) {
			return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
		}

		await prisma.item.delete({ where: { id } });
		return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
	} catch (error) {
		console.error("Error deleting item:", error);
		return NextResponse.json({ error: 'Item not found' }, { status: 404 });
	}
}

export async function PUT(req: Request) {
	try {
		const { id, name, value, recaptchaToken } = await req.json();

		if (!id) {
			return NextResponse.json({ error: "ID is required" }, { status: 400 });
		}

		// Verify reCAPTCHA token
		if (!recaptchaToken || !(await verifyRecaptcha(recaptchaToken))) {
			return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
		}

		const item = await prisma.item.update({
			where: { id },
			data: { name, value },
		});
		return NextResponse.json(item, { status: 200 });
	} catch (error) {
		console.error("Error updating item:", error);
		return NextResponse.json({ error: "Item not found" }, { status: 404 });
	}
}