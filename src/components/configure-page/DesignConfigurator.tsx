"use client"

import { useRef } from "react"
import { AspectRatio } from "../ui/aspect-ratio"
import NextImage from "next/image"
import { Rnd } from "react-rnd"
import { Button } from "../ui/button"
import { ArrowRight } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import HandleComponent from "./HandleComponent"
import usePhoneConfigurator from "@/hooks/usePhoneConfigurator"
import { BASE_PRICE } from "@/lib/options/price-config"
import ConfiguratorOptions from "./ConfiguratorOptions"

interface DesignConfiguratorProps {
  configId: string
  imageUrl: string
  imageDimensions: { width: number; height: number }
}

const DesignConfigurator = ({ configId, imageUrl, imageDimensions }: DesignConfiguratorProps) => {
  const phoneCaseRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { isPending, options, saveConfig, setOptions, setRenderedDimension, setRenderedPosition } = usePhoneConfigurator({
    phoneCaseRef,
    containerRef,
    configId,
    imageUrl,
    imageDimensions
  })

  return (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20">
      <div
        ref={containerRef}
        className="relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]">
          <AspectRatio ref={phoneCaseRef} ratio={896 / 1831} className="pointer-events-none relative z-50 aspect-[896/1831] w-full">
            <NextImage fill alt="phone image" src="/phone-template.png" className="pointer-events-none z-50 select-none" />
          </AspectRatio>
          <div className={cn("absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]", `bg-blue-500`)} />
          <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />
        </div>

        <Rnd
          default={{ x: 150, y: 205, height: imageDimensions.height / 4, width: imageDimensions.width / 4 }}
          onResizeStop={(_, __, ref, ___, { x, y }) => {
            setRenderedDimension({
              height: parseInt(ref.style.height.slice(0, -2)),
              width: parseInt(ref.style.width.slice(0, -2))
            })

            setRenderedPosition({ x, y })
          }}
          onDragStop={(_, data) => {
            const { x, y } = data
            setRenderedPosition({ x, y })
          }}
          className="absolute z-20 border-[3px] border-primary"
          lockAspectRatio
          resizeHandleComponent={{
            bottomRight: <HandleComponent />,
            bottomLeft: <HandleComponent />,
            topRight: <HandleComponent />,
            topLeft: <HandleComponent />
          }}
        >
          <div className="relative w-full h-full">
            <NextImage src={imageUrl} fill alt="your image" className="pointer-events-none" />
          </div>
        </Rnd>
      </div>

      <div className="h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
        <ConfiguratorOptions options={options} setOptions={setOptions} />

        <div className="w-full px-8 h-16 bg-white">
          <div className="h-px w-full bg-zinc-200" />
          <div className="w-full h-full flex justify-end items-center">
            <div className="w-full flex gap-6 items-center">
              <p className="font-medium whitespace-nowrap">
                {formatPrice((BASE_PRICE + options.finish.price + options.material.price) / 100)}
              </p>
              <Button
                isLoading={isPending}
                disabled={isPending}
                loadingText="Saving"
                onClick={() =>
                  saveConfig({
                    configId,
                    color: options.color.value,
                    finish: options.finish.value,
                    material: options.material.value,
                    model: options.model.value
                  })
                }
                size="sm"
                className="w-full"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignConfigurator
