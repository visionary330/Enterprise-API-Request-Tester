import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url, method, headers, body } = await req.json()

    console.log('Proxying request to:', url)
    console.log('Method:', method)
    console.log('Headers:', headers)
    console.log('Body:', body)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(url, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? null : body,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()
    console.log('Proxy response status:', response.status)
    console.log('Proxy response:', responseText.substring(0, 200) + '...')

    return NextResponse.json({ data: responseText }, { status: response.status })
  } catch (error: unknown) {
    console.error('Proxy error:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
      }
      return NextResponse.json({ error: `Fetch failed: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred while proxying the request' }, { status: 500 })
  }
}