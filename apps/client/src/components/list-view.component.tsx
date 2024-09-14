import React, { PropsWithChildren } from "react"

import styles from "./list-view.module.css"


export type ListItem = {
    id: string
    display: string | JSX.Element
}

export interface ListLayoutProps<ListItem> {
    name?: string
    list: ListItem[],
    selectedItem?: ListItem | undefined
    onItemClicked?: (item: ListItem) => void
    onAddItem?: () => void
}


export default function ListViewComponent<T extends ListItem> (props: PropsWithChildren<ListLayoutProps<T>>) {


    const [search, setSearch] = React.useState("")

    return (
        <div className={styles.layout}>
            
            <div className={styles.list}>

                {
                    props.onAddItem &&
                    <button
                        className="btn btn-primary w-100"
                        onClick={props.onAddItem}
                    >
                        <i className="bi bi-plus-lg" /> Add
                    </button>
                }

                <div className="list-group">

                    {
                        props.name && <div className="list-group-item bg-secondary text-center"><strong>{props.name}</strong></div>
                    }

                    <div className="list-group-item p-2" style={{ display: "flex", gap: "0.5rem" }}>
                        <div className="input-group">
                            <input type="text" placeholder="Search" className="form-control" value={search} onChange={e => setSearch(e.target.value)} />
                            <button className="btn btn-outline-secondary"><i className="bi bi-x-lg" onClick={() => setSearch("")} /></button>
                        </div>
                    </div>

                    
                    {
                        props.list
                            .filter(item => {
                                return item.id.toString().toLowerCase().includes(search.toLowerCase())
                                || item.display.toString().toLowerCase().includes(search.toLowerCase())
                            })
                            .map(item =>
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => props.onItemClicked?.(item)}
                                className={`list-group-item list-group-item-action ${props.selectedItem?.id === item.id && "active"}`}
                            >
                                {item.display}
                            </button>
                        )
                    }
                </div>

            </div>

            <div className={styles.view}>
                {props.children}
            </div>

        </div>
    )

}