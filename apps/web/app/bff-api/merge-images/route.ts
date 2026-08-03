import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { captureException } from '@sentry/nextjs';
import sharp from 'sharp';

export const POST = async (req: NextRequest) => {
  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length > 20) {
      return NextResponse.json(
        { error: 'Please provide between 1 and 20 image URLs.' },
        { status: 400 }
      );
    }

    const imageBuffers = await Promise.all(
      imageUrls.map(async (url: string) => {
        const response = await fetch(url, {
          headers: {
            referer: 'https://remanga.org/',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch image from URL: ${url}`);
        return Buffer.from(await response.arrayBuffer());
      })
    );

    const sharpImages = await Promise.all(imageBuffers.map((buffer) => sharp(buffer)));
    const metadataList = await Promise.all(sharpImages.map((image) => image.metadata()));

    const maxWidth = Math.max(...metadataList.map(({ width }) => width || 0));

    let totalHeight = 0;
    const resizedBuffers = await Promise.all(
      sharpImages.map(async (image, index) => {
        const { height, width } = metadataList[index]!;

        const newHeight = Math.round((height! / width!) * maxWidth);
        totalHeight += newHeight;

        return await image.resize(maxWidth, newHeight).toBuffer();
      })
    );

    let yOffset = 0;
    const mergedImage = sharp({
      create: {
        width: maxWidth,
        height: totalHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    });

    const compositeList = resizedBuffers.map((buffer, index) => {
      const { height } = metadataList[index]!;
      const compositeObject = { input: buffer, left: 0, top: yOffset };
      yOffset += Math.round((height! / metadataList[index]!.width!) * maxWidth);
      return compositeObject;
    });

    const finalImageBuffer = await mergedImage.composite(compositeList).png().toBuffer();

    return new NextResponse(finalImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error: unknown) {
    captureException(error);
    return NextResponse.json({ error: 'Failed to merge images' }, { status: 500 });
  }
};
