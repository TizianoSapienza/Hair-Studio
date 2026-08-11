import * as React from "react"

export function useSize(ref) {
  const [size, setSize] = React.useState(null)

  //useLayoutEffect (non useEffect): la prima volta che 
  //il componente viene montato, vogliamo calcolare le 
  //dimensioni dell'elemento prima che il browser dipinga 
  //la UI. In questo modo, i consumatori possono renderizzare 
  //il loro contenuto reale nel primo frame dipinto invece 
  //di un'ipotesi. Il primo callback di ResizeObserver arriva 
  //troppo tardi per questo: a quel punto, un'ipotesi 
  //di src di <img> è già stata inviata alla rete.

  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    setSize({ width: rect.width, height: rect.height })

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}
