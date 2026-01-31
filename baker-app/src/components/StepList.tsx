import type { Step } from '../types/recipe';

interface StepListProps {
  steps: Step[];
}

export default function StepList({ steps }: StepListProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-stone-200">
      <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-6">Instructions</h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center">
              <span className="text-sm font-medium text-stone-500">{index + 1}</span>
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-stone-900 font-medium mb-1">
                {step.title}
              </h3>
              <p className="text-stone-600 text-sm mb-2">{step.description}</p>
              <div className="flex gap-4 text-xs text-stone-400">
                {step.activeMinutes > 0 && (
                  <span>{step.activeMinutes} min active</span>
                )}
                {step.passiveMinutes > 0 && (
                  <span>{step.passiveMinutes} min passive</span>
                )}
                {step.temperature && <span>{step.temperature}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
