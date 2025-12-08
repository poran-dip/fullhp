import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Prisma } from '../../../../generated'

// Doctor Update Schema
const DoctorUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  image: z.string().optional(),
  specialization: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'UNAVAILABLE']).optional(),
  rating: z.number().optional(),
  location: z.string().optional()
})

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            patient: true,
            ambulance: true
          },
          orderBy: {
            dateTime: 'desc'
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json({ 
        error: 'Doctor not found' 
      }, { status: 404 })
    }

    return NextResponse.json(doctor)
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

    const validation = DoctorUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.issues
      }, { status: 400 });
    }

    const validatedData = validation.data;

    const dataToUpdate: Prisma.DoctorUpdateInput = {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.email && { email: validatedData.email }),
      ...(validatedData.image && { image: validatedData.image }),
      ...(validatedData.specialization && { specialization: validatedData.specialization }),
      ...(validatedData.location && { location: validatedData.location }),
      ...(validatedData.status && { status: validatedData.status }),
      ...(validatedData.rating !== undefined && { rating: new Prisma.Decimal(validatedData.rating) }),
    };

    if (validatedData.password) {
      const hashed = await bcrypt.hash(validatedData.password, 10);
      dataToUpdate.password = hashed;
    }
    
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedDoctor);
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
      // First update appointments
      await tx.appointment.updateMany({
        where: { doctorId: id },
        data: { doctorId: null }
      })

      // Then delete the doctor
      await tx.doctor.delete({
        where: { id }
      })
    })

    return NextResponse.json<{ message: string }>({ 
      message: 'Doctor deleted successfully. Associated appointments updated.' 
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'an unknown error occurred'
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}