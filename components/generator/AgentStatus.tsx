import { AgentStep } from '@/types';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface AgentStatusProps {
    steps: AgentStep[];
}

export default function AgentStatus({ steps }: AgentStatusProps) {
    return (
        <div className="space-y-4 mt-8 pt-8 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Agent Progress</h3>
            <div className="space-y-6">
                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                {step.status === 'running' ? (
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                ) : step.status === 'done' ? (
                                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                                ) : (
                                    <Circle className="w-5 h-5 text-zinc-700" />
                                )}
                            </div>
                            <span className={`text-sm font-medium ${step.status === 'running' ? 'text-white' :
                                    step.status === 'done' ? 'text-zinc-400' : 'text-zinc-600'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                        {step.status === 'done' && step.output && (
                            <div className="ml-9 p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-zinc-500 italic leading-relaxed">
                                {step.output}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
