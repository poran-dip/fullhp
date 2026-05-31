import { NextResponse } from "next/server";

export async function POST() {
  // Clear all auth-related cookies
  const cookieOptions = {
    path: "/",
    expires: new Date(0),
  };

  const response = NextResponse.json(
    {
      message: "Logged out successfully",
      success: true,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );

  // Set cookies with expired date to clear them
  response.cookies.set("patientId", "", cookieOptions);
  response.cookies.set("doctorId", "", cookieOptions);
  response.cookies.set("adminId", "", cookieOptions);
  response.cookies.set("token", "", cookieOptions);
  response.cookies.set("role", "", cookieOptions);
  response.cookies.set("session", "", cookieOptions);

  return response;
}
