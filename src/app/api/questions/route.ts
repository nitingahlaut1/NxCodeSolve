import { NextResponse } from 'next/server';
import dsaQuestions from '@/data/dsaQuestions.json';

export async function GET() {
  return NextResponse.json({ questions: dsaQuestions, total: dsaQuestions.length });
}
