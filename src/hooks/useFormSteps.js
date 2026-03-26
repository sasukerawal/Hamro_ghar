import { useState, useCallback } from 'react';

/**
 * useFormSteps - Manages the progression and validation state of a multi-step form.
 * 
 * @param {number} totalSteps - Total number of steps in the form.
 * @returns {Object} Step state and control functions.
 */
export function useFormSteps(totalSteps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [furthestStep, setFurthestStep] = useState(1);

    const goToStep = useCallback((step) => {
        if (step >= 1 && step <= furthestStep + 1 && step <= totalSteps) {
            setCurrentStep(step);
            if (step > furthestStep) setFurthestStep(step);
        }
    }, [furthestStep, totalSteps]);

    const nextStep = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
    const prevStep = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

    return {
        currentStep,
        furthestStep,
        goToStep,
        nextStep,
        prevStep,
        isFirst: currentStep === 1,
        isLast: currentStep === totalSteps,
        progress: (currentStep / totalSteps) * 100
    };
}
