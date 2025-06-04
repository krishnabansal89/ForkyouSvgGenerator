import { Redis }   from '@upstash/redis'
import { scrape , generateMatrix } from '@/app/scrapeAction'
import satori from 'satori';
import {generateActivityGrid} from '@/components/LeaderBoard'
 
export const runtime = 'edge'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'


const REDIS_TOKEN = process.env.REDIS_TOKEN || ''

const redis = new Redis({
  url: 'https://capable-coral-46043.upstash.io',
  token: REDIS_TOKEN,
})


export async function GET(req: Request) {
  const url   = new URL(req.url)
  const id    = url.searchParams.get('user')   ?? 'global'

  const key   = `lb:${id}`
  let rows    = await redis.get(key) 

  if (!rows) {
    
    const rawHtml = await scrape(id as string)
    if (!rawHtml) {
      return new Response('No data found', { status: 404 })
    }
    const martix = await generateMatrix(rawHtml as string)
    rows = martix
    console.log("Matrix generated:", martix)
    await redis.set(key, martix, { ex: 3600 })       // 15-min TTL
  }

  console.log("Rows fetched from Redis:", rows)
  // const html = generateActivityMapJSX(rows);
// console.log("HTML generated for Satori:", html)

  
  // const svg = await svgFromSatori(rows as string)
  const ActivityGrid = generateActivityGrid({ matrix:rows as Record<string, number[]> });

  const svg = await satori(ActivityGrid, {
    width: 800,
    height: 400,
    fonts: [
      {
        name: 'Inter',
        data: await fetch(`${BASE_URL}/Inter_18pt-Bold.ttf`).then(res => res.arrayBuffer()),
        weight: 400,
        style: 'normal',
      },
    ],
  });


  // return new Response(JSON.stringify(rows))
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml',
               'Cache-Control': 'public,s-maxage=900,stale-while-revalidate=3600' }
  })
}

