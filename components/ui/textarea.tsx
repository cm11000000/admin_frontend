import * as React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[100px] w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 ease-in-out resize-y hover:bg-white hover:border-gray-300 focus:border-[#5CBBF6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5CBBF6]/10 focus:shadow-lg focus:shadow-[#5CBBF6]/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
