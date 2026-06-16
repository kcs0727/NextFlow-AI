import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-check';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    return NextResponse.json({
      success: true,
      isPremium: authCheck.isPremium,
      freeUsageCount: authCheck.freeUsageCount,
    });
  } 
  catch (error: any) {
    console.error('get-user error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
