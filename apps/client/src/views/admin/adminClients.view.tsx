import React from "react"

import ListViewComponent from "@client/components/list-view.component";

export default function AdminClientView () {

    const mockList = [
        { id: "1", display: "Client 1" },
        { id: "2", display: "Client 2" },
        { id: "3", display: "Client 3" },
    ]


    return (
        <ListViewComponent list={mockList}>
            <h1>Admin Users View</h1>
        </ListViewComponent>
    )

}