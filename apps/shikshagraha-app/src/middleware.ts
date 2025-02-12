import { NextResponse } from 'next/server';

export function middleware(request: { nextUrl: { clone: () => any } }) {
  const url = request.nextUrl.clone();

  if (url.pathname.startsWith('/shikshagraha/registration')) {
    url.hostname = 'localhost';
    url.port = '4300';
    return NextResponse.rewrite(url);
  }

  if (url.pathname.startsWith('/shikshagraha/content')) {
    url.hostname = 'localhost';
    url.port = '4301';
    return NextResponse.rewrite(url);
  }

  if (url.pathname.startsWith('/shikshagraha/pwa')) {
    url.hostname = 'localhost';
    url.port = '4200';
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}
