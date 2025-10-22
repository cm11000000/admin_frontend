// Simple toast utility as a replacement for sonner
export const toast = {
  success: (message: string) => {
    console.log('✓ Success:', message)
    // In production, this would integrate with a toast library
  },
  error: (message: string) => {
    console.error('✗ Error:', message)
    // In production, this would integrate with a toast library
  },
  info: (message: string) => {
    console.info('ℹ Info:', message)
    // In production, this would integrate with a toast library
  },
  warning: (message: string) => {
    console.warn('⚠ Warning:', message)
    // In production, this would integrate with a toast library
  }
}

export default toast
