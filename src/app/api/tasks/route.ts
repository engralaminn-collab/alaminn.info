import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const tasks = await db.task.findMany({
      where: status ? { status } : {},
      include: { contact: true, assignee: true },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
      },
    });
  } catch (err: any) {
    console.error("Tasks API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { title, description, priority, dueDate, contactId, relatedType, relatedId } = json;

    if (!title) {
      return NextResponse.json({ success: false, message: "Task title is required." }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        status: "open",
        dueDate: dueDate ? new Date(dueDate) : null,
        contactId: contactId || null,
        assigneeId: session.userId,
        relatedType,
        relatedId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (err: any) {
    console.error("Task create error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { id, status, priority, title, description, dueDate } = json;

    if (!id) {
      return NextResponse.json({ success: false, message: "Task ID is required." }, { status: 400 });
    }

    const task = await db.task.update({
      where: { id },
      data: {
        status: status ?? undefined,
        priority: priority ?? undefined,
        title: title ?? undefined,
        description: description ?? undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      data: task,
    });
  } catch (err: any) {
    console.error("Task update error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
