import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/socket.io/')) {
    url.hostname = 'nln-chat-app-server.vercel.app';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
