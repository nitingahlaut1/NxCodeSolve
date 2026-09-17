import React from 'react';
import CodeWorkspace from '@/components/CodeWorkspace';
import { Metadata } from 'next';
import { getProblemDetailById } from '@/data/problemDetails';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numId = parseInt(id, 10) || 1;
  const problem = getProblemDetailById(numId);

  return {
    title: `Solve #${problem.id}: ${problem.title} | NxCodeSolve`,
    description: problem.description?.slice(0, 150) || `Solve ${problem.title} on NxCodeSolve workspace.`
  };
}

export default async function SolvePage({ params }: PageProps) {
  const { id } = await params;
  const numId = parseInt(id, 10) || 1;

  return <CodeWorkspace problemId={numId} />;
}
