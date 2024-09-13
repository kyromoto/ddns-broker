import React from "react"

import ListViewComponent from "@client/components/list-view.component";

type User = {
    id: string,
    username: string,
    email: string,
    firstname: string,
    lastname: string,
    roles: string[]
}

const mockUsers = []

export default function AdminUserView () {

    const mockList: User[] = [
        { id: "1", username: "User-1", email: "User-1@localhost", firstname: "User-1", lastname: "User-1", roles: ["user"] },
        { id: "2", username: "User-2", email: "User-2@localhost", firstname: "User-2", lastname: "User-2", roles: ["user"] },
        { id: "3", username: "User-3", email: "User-3@localhost", firstname: "User-3", lastname: "User-3", roles: ["user"] },
    ]

    const [users, setUsers] = React.useState<User[]>(mockList)
    const [selectedUser, setSelectedUser] = React.useState<User | undefined>(mockList[0])
    const [formUser, setFormUser] = React.useState<User | undefined>(selectedUser)

    function isFormUserEdited () {
        return JSON.stringify(selectedUser) !== JSON.stringify(formUser)
    }


    return (
        <ListViewComponent
            name="Users"
            list={mockList.map(user => ({ ...user, display: user.username }))}
            selectedItem={selectedUser && { ...selectedUser, display: selectedUser.username }}
            onItemClicked={user => {
                setSelectedUser(users.find(u => u.id === user.id))
                setFormUser(users.find(u => u.id === user.id))
            }}
            onAddItem={() => null}
            
        >
            <div style={{ display: "grid", gap: "1.5rem" }}>

                <form style={{ display: "grid", gap: "1rem" }}>
                    <div>
                        <label htmlFor="id">ID</label>
                        <input type="text" id="id" name="id" value={formUser?.id} disabled className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" value={formUser?.username} disabled className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <input type="text" id="email" name="email" value={formUser?.email} onChange={e => setFormUser({ ...formUser, email: e.target.value })} className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="firstname">Firstname</label>
                        <input type="text" id="firstname" name="firstname" value={formUser?.firstname} onChange={e => setFormUser({ ...formUser, firstname: e.target.value })} className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="lastname">Lastname</label>
                        <input type="text" id="lastname" name="lastname" value={formUser?.lastname} onChange={e => setFormUser({ ...formUser, lastname: e.target.value })} className="form-control" />
                    </div>
                </form>

                <div className="btn-toolbar justify-content-end gap-2" role="toolbar">
                    <button className="btn btn-primary" disabled={!isFormUserEdited()} onClick={() => setFormUser(selectedUser)} ><i className="bi bi-x-lg" /> Reset</button>
                    <button className="btn btn-warning" disabled={!isFormUserEdited()} ><i className="bi bi-save" /> Update</button>
                    <button className="btn btn-danger"><i className="bi bi-trash" /> Delete</button>
                </div>
            </div>
        </ListViewComponent>
    )

}