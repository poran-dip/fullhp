import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Patient Update Schema
const PatientUpdateSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional()
})

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: true,
            ambulance: true
          },
          orderBy: {
            dateTime: 'desc'
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ 
        error: 'Patient not found' 
      }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'an unknown error occurred'
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json()

    const validation = PatientUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.issues
      }, { status: 400 })
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: validation.data,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        image: true,
        // createdAt: true,
        // updatedAt: true
      }
    })

    return NextResponse.json(patient)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'an unknown error occurred'
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      await tx.appointment.deleteMany({
        where: { patientId: id }
      })

      await tx.patient.delete({
        where: { id }
      })
    })

    return NextResponse.json<{ message: string }>({ 
      message: 'Patient and associated appointments deleted successfully' 
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'an unknown error occurred'
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}