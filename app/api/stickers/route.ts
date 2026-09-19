import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_PACKAGES = ['1', '2', '11537', '11538', '11539'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageIdsParam = searchParams.get('packages');
    const packageIds = packageIdsParam ? packageIdsParam.split(',') : DEFAULT_PACKAGES;

    const packs = await Promise.all(
      packageIds.map(async (packageId) => {
        try {
          const res = await fetch(
            `https://stickershop.line-scdn.net/stickershop/v1/product/${packageId}/iphone/productinfo.meta`,
            { cache: 'force-cache' }
          );

          if (res.ok) {
            const data = await res.json();
            const stickers = (data.stickers || []).map((s: { id: number }) => String(s.id));
            const coverStickerId = stickers[0] || '1';
            const title = typeof data.title === 'string' ? data.title : data.title?.en || data.title?.ja || `Pack ${packageId}`;

            return {
              id: `pack-${packageId}`,
              name: title,
              packageId: String(packageId),
              coverStickerId,
              stickers,
            };
          }
        } catch (e) {
          console.error(`Error fetching sticker metadata for package ${packageId}:`, e);
        }

        // Fallback if fetch fails
        return {
          id: `pack-${packageId}`,
          name: `Package ${packageId}`,
          packageId: String(packageId),
          coverStickerId: '1',
          stickers: ['1', '2', '3', '4'],
        };
      })
    );

    return NextResponse.json({ success: true, packs }, { status: 200 });
  } catch (error: any) {
    console.error('Stickers API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch stickers' }, { status: 500 });
  }
}
