import { SaveConfigArgs, saveConfigAction } from "@/actions/phoneConfigAction"
import { useToast } from "@/components/ui/use-toast"
import { COLORS, FINISHES, MATERIALS, MODELS, type TConfiguratorOptions } from "@/lib/options/config-options"
import { useUploadThing } from "@/lib/uploadthing"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface usePhoneConfiguratorProps {
  phoneCaseRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  configId: string
  imageUrl: string
  imageDimensions: { width: number; height: number }
}

const usePhoneConfigurator = ({ phoneCaseRef, containerRef, configId, imageDimensions, imageUrl }: usePhoneConfiguratorProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const { mutate: saveConfig, isPending } = useMutation({
    mutationKey: ["save-config"],
    mutationFn: async (args: SaveConfigArgs) => {
      await Promise.all([saveConfiguration(), saveConfigAction(args)])
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again.",
        variant: "destructive"
      })
    },
    onSuccess: () => {
      router.push(`/configure/preview?id=${configId}`)
    }
  })

  const [options, setOptions] = useState<TConfiguratorOptions>({
    color: COLORS[0],
    model: MODELS.options[0],
    material: MATERIALS.options[0],
    finish: FINISHES.options[0]
  })

  const [renderedDimension, setRenderedDimension] = useState({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4
  })

  const [renderedPosition, setRenderedPosition] = useState({ x: 150, y: 205 })

  const { startUpload } = useUploadThing("imageUploader")

  async function saveConfiguration() {
    try {
      const { left: caseLeft, top: caseTop, width, height } = phoneCaseRef.current!.getBoundingClientRect()

      const { left: containerLeft, top: containerTop } = containerRef.current!.getBoundingClientRect()

      const leftOffset = caseLeft - containerLeft
      const topOffset = caseTop - containerTop

      const actualX = renderedPosition.x - leftOffset
      const actualY = renderedPosition.y - topOffset

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      const userImage = new Image()
      userImage.crossOrigin = "anonymous"
      userImage.src = imageUrl
      await new Promise((resolve) => (userImage.onload = resolve))

      ctx?.drawImage(userImage, actualX, actualY, renderedDimension.width, renderedDimension.height)

      const base64 = canvas.toDataURL()
      const base64Data = base64.split(",")[1]

      const blob = base64ToBlob(base64Data, "image/png")
      const file = new File([blob], "filename.png", { type: "image/png" })

      await startUpload([file], { configId })
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "There was a problem saving your config, please try again.",
        variant: "destructive"
      })
    }
  }

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  return { options, setOptions, setRenderedDimension, setRenderedPosition, saveConfig, isPending }
}

export default usePhoneConfigurator
