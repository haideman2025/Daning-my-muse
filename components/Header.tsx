import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = ['Phong cách', 'Chung', 'Khuôn mặt', 'Cơ thể', 'Chi tiết', 'Hoàn Tất'];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 sm:mb-12">
      <div className="flex items-center">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center text-center z-10">
                <button
                  disabled={!isCompleted}
                  onClick={() => isCompleted && onStepClick(stepNumber)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted ? 'bg-pink-500 border-pink-500 cursor-pointer hover:scale-110' : 
                    isActive ? 'border-pink-500 scale-110' : 'border-gray-600 bg-[#111111]'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <span className={`font-bold ${isActive ? 'text-pink-500' : 'text-gray-500'}`}>{stepNumber}</span>
                  )}
                </button>
                <p className={`mt-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 hidden sm:block ${
                    isCompleted || isActive ? 'text-white' : 'text-gray-500'
                  }`}>{label}</p>
              </div>
              {stepNumber < STEPS.length && (
                <div className={`flex-1 h-0.5 transition-colors duration-500 ${isCompleted ? 'bg-pink-500' : 'bg-gray-700'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;