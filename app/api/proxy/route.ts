import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url, method, headers, body } = await req.json()

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? null : body,
    })

    const responseText = await response.text()

    return NextResponse.json({ data: responseText }, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while proxying the request' }, { status: 500 })
  }
}