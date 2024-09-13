import React from "react"

type ModalContent = {
    title?: string,
    body: string | JSX.Element,
    confirmLabel: string,
    level: "info" | "warning" | "danger"
    onAction: (confirmed: boolean) => void }


export interface ModalContext {
    content: ModalContent | undefined
    isOpen: boolean
    open: (content: ModalContent) => void
    close: () => void,
}


export const ModalContext = React.createContext<ModalContext>({
    content: undefined,
    isOpen: false,
    open: (content: ModalContent) => {},
    close: () => {},
})



export const ModalProvider = (props: React.PropsWithChildren) => {

    const [content, setContent] = React.useState<ModalContent | undefined>(undefined)
    const [isOpen, setIsOpen] = React.useState(false)


    const open = (newContent: ModalContent) => {

        // if (typeof content !== undefined) return

        setContent(newContent)
        setIsOpen(true)
    }


    const close = () => {
        setContent(undefined)
        setIsOpen(false)
    }


    return (
        <ModalContext.Provider value={{ content, isOpen, open, close }}>
            {props.children}
        </ModalContext.Provider>
    )
}



export function useModal () {
    return React.useContext(ModalContext)
}