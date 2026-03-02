import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    "components-breadcrumb": ComponentProps<typeof import("C:/Users/OMEN/Desktop/EGLabs/dwellasuiteadmin/app/layouts/components/Breadcrumb.vue").default>,
    custom: ComponentProps<typeof import("C:/Users/OMEN/Desktop/EGLabs/dwellasuiteadmin/app/layouts/custom.vue").default>,
    default: ComponentProps<typeof import("C:/Users/OMEN/Desktop/EGLabs/dwellasuiteadmin/app/layouts/default.vue").default>,
}
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}