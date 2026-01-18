import type { Step } from '../types/recipe';

interface StepListProps {
  steps: Step[];
}

export default function StepList({ steps }: StepListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-xl font-semibold mb-2">
              {index + 1}. {step.title}
            </h3>
            <p className="text-gray-700 mb-2">{step.description}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              {step.activeMinutes > 0 && (
                <span>Active: {step.activeMinutes}min</span>
              )}
              {step.passiveMinutes > 0 && (
                <span>Passive: {step.passiveMinutes}min</span>
              )}
              {step.temperature && <span>{step.temperature}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
