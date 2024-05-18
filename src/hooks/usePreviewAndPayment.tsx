import { createCheckoutSession } from "@/actions/createCheckoutSession"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { COLORS, MODELS } from "@/lib/options/config-options"
import { BASE_PRICE, PRODUCT_PRICES } from "@/lib/options/price-config"
import { Configuration } from "@prisma/client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface usePreviewAndPaymentProps {
  config: Configuration
}

const usePreviewAndPayment = ({ config }: usePreviewAndPaymentProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const { id, color, model, finish, material } = config
  const { user } = useKindeBrowserClient()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false)

  const tw = COLORS.find((supportedColor) => supportedColor.value === color)?.tw

  const { label: modelLabel } = MODELS.options.find(({ value }) => value === model)!

  let totalPrice = BASE_PRICE
  if (material === "polycarbonate") totalPrice += PRODUCT_PRICES.material.polycarbonate
  if (finish === "textured") totalPrice += PRODUCT_PRICES.finish.textured

  const { mutate: createPaymentSession } = useMutation({
    mutationKey: ["get-checkout-session"],
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      if (url) router.push(url)
      else throw new Error("Unable to retrieve payment URL.")
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again.",
        variant: "destructive"
      })
    }
  })

  const handleCheckout = () => {
    if (user) {
      createPaymentSession({ configId: id })
    } else {
      localStorage.setItem("configurationId", id)
      setIsLoginModalOpen(true)
    }
  }
  return { handleCheckout, tw, modelLabel, totalPrice, isLoginModalOpen, setIsLoginModalOpen, user }
}

export default usePreviewAndPayment
