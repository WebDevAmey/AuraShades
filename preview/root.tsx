// Client-only root used for the static preview build (no document shell).
import { createRootRoute } from '@tanstack/react-router'
import { RootLayout, NotFound } from '../src/routes/__root'

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound })
