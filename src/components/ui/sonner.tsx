import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** Kit-styled toasts: white card, hairline border, pill-soft radius, Figtree. */
const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    position="bottom-center"
    className="toaster group"
    icons={{
      success: <CircleCheckIcon className="size-4 text-green-600" />,
      info: <InfoIcon className="size-4 text-indigo-600" />,
      warning: <TriangleAlertIcon className="size-4 text-yellow-700" />,
      error: <OctagonXIcon className="size-4 text-red-400" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }}
    toastOptions={{
      classNames: {
        toast:
          '!rounded-xl !border !border-st !bg-white !font-sans !text-caption !text-tx !shadow-kit-lg',
      },
    }}
    {...props}
  />
)

export { Toaster }
