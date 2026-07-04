import React from 'react';

/**
 * FormStepIndicator - Progress tracker for multi-step forms.
 */
const FormStepIndicator = ({ steps, currentStep, onStepClick }) => (
    <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
        {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
                <button
                    key={step.id}
                    disabled={!isCompleted && !isActive}
                    onClick={() => onStepClick(stepNum)}
                    className="flex flex-col items-center gap-2 group outline-none"
                >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ring-4 ring-white ${isActive ? 'bg-gold-500 text-white scale-110' :
                            isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {isCompleted ? '✓' : stepNum}
                    </div>
                    <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-gold-700' : 'text-slate-400'
                        }`}>
                        {step.label}
                    </span>
                </button>
            );
        })}
    </div>
);

export default React.memo(FormStepIndicator);
