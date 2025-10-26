import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Build the callback page URL with the parameters
  const callbackUrl = new URL('/auth/google/callback', request.url);
  
  if (error) {
    callbackUrl.searchParams.set('error', error);
  }
  
  if (code) {
    callbackUrl.searchParams.set('code', code);
  }
  
  if (state) {
    callbackUrl.searchParams.set('state', state);
  }

  // Redirect to our callback page
  return NextResponse.redirect(callbackUrl);
}