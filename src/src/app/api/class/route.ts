import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return jsonResponse({}, 200);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const teacherId = searchParams.get('teacher_id');

  try {
    const whereClause: any = {};
    if (teacherId) {
      whereClause.teacherId = Number(teacherId);
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
    });

    return jsonResponse(
      classes.map((c: any) => ({
        id: c.id,
        teacher_id: c.teacherId,
        class_name: c.className,
        school_name: c.schoolName,
        class_code: c.classCode,
        isactive: c.isActive,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      }))
    );
  } catch (error: any) {
    console.error('Error in GET /api/class:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await prisma.class.create({
      data: {
        className: body.class_name,
        schoolName: body.school_name,
        classCode: body.class_code || Math.random().toString(36).substring(2, 8).toUpperCase(),
        teacherId: body.teacher_id ? Number(body.teacher_id) : null,
        isActive: body.isactive === undefined ? true : Boolean(body.isactive),
      },
    });

    return jsonResponse({
      id: created.id,
      teacher_id: created.teacherId,
      class_name: created.className,
      school_name: created.schoolName,
      class_code: created.classCode,
      isactive: created.isActive,
      created_at: created.createdAt,
      updated_at: created.updatedAt,
    }, 201);
  } catch (error: any) {
    console.error('Error in POST /api/class:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
