import type { JSX, JSXElement } from 'solid-js'

export default function Button(
  props: { children: JSXElement } & JSX.HTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      class={
        'rounded-md border border-solid border-gray bg-transparent px-4 py-1 hover:border-active hover:text-active ' +
        props.class
      }
    >
      {props.children}
    </button>
  )
}
