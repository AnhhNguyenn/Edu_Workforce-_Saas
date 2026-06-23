import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    // Bảo mật On-Demand ISR bằng Secret Key
    const secret = req.headers.get("x-revalidate-secret");
    const validSecret = process.env.REVALIDATE_SECRET || "eduops-secret-key-2026";

    if (secret !== validSecret) {
      return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
    }

    const body = await req.json();
    const path = body.path;

    if (!path) {
      return NextResponse.json({ message: "Path is required" }, { status: 400 });
    }

    // Re-render lại HTML tĩnh cho đường dẫn được cung cấp
    revalidatePath(path);

    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
