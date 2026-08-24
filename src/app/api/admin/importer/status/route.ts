import { NextRequest, NextResponse } from 'next/server';
import { referenceRepository } from '@/lib/firestore/reference';

export async function GET() {
  try {
    const latestRun = await referenceRepository.getLatestImportRun();
    return NextResponse.json({ run: latestRun });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, runId } = await req.json();

    if (action === 'start') {
      const newRunId = `run_${Date.now()}`;
      const newRun = {
        runId: newRunId,
        startedAt: new Date().toISOString(),
        status: 'running' as const,
        productsDiscovered: 0,
        productsCreated: 0,
        productsUpdated: 0,
        duplicates: 0,
        errors: 0,
        imagesFound: 0,
        imagesUploaded: 0,
        imagesFailed: 0,
        priceChanges: 0,
      };
      await referenceRepository.createImportRun(newRun);
      return NextResponse.json({ run: newRun });
    }

    if (!runId) return NextResponse.json({ error: 'Missing runId' }, { status: 400 });

    if (action === 'pause') {
      await referenceRepository.updateImportRun(runId, { status: 'paused' });
    } else if (action === 'resume') {
      await referenceRepository.updateImportRun(runId, { status: 'running' });
    } else if (action === 'stop') {
      await referenceRepository.updateImportRun(runId, { 
        status: 'completed',
        finishedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, action, runId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
