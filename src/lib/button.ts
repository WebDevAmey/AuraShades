import { cva, type VariantProps } from 'class-variance-authority'

/** Button variants. Styles live in styles.css as component tokens; this maps props to classes. */
export const button = cva('btn', {
  variants: {
    variant: { primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost' },
    size: { md: '', sm: 'btn-sm' },
    icon: { true: 'btn-icon', false: '' },
  },
  defaultVariants: { variant: 'primary', size: 'md', icon: false },
})

export type ButtonVariants = VariantProps<typeof button>
