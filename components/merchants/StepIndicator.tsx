'use client';

import React from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepId: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: number) => currentStep === stepId;
  const isStepAccessible = (stepId: number) => stepId <= currentStep || isStepCompleted(stepId);

  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${(completedSteps.length / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const completed = isStepCompleted(step.id);
            const current = isStepCurrent(step.id);
            const accessible = isStepAccessible(step.id);

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <button
                  onClick={() => accessible && onStepClick?.(step.id)}
                  disabled={!accessible}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200 relative z-10
                    ${completed
                      ? 'bg-blue-600 text-white'
                      : current
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : accessible
                      ? 'bg-white border-2 border-gray-300 text-gray-500 hover:border-blue-400'
                      : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {completed ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.id + 1
                  )}
                </button>

                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      current ? 'text-blue-600' : completed ? 'text-gray-700' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
