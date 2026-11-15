import { cva, type VariantProps } from 'class-variance-authority'

/** Button variants. Styles live in styles.css as component tokens; this maps props to classes. */
export const button = cva('btn', {
  variants: {
    variant: { primary: 'btn-primary', hot: 'btn-hot', secondary: 'btn-secondary', ghost: 'btn-ghost', field: 'btn-on-field', glass: 'btn-glass' },
    size: { md: '', sm: 'btn-sm', xs: 'btn-xs' },
    icon: { true: 'btn-icon', false: '' },
  },
  defaultVariants: { variant: 'primary', size: 'md', icon: false },
})

export type ButtonVariants = VariantProps<typeof button>
