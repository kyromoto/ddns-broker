import React from "react"

import ListViewComponent from "@client/components/list-view.component";
import { useModal } from "@client/contexts/modal.context";

type User = {
    id: string,
    username: string,
    email: string,
    firstname: string,
    lastname: string,
    roles: string[],
    active: boolean
}

const mockUsers = []

export default function AdminUserView () {

    const roleOptions = ["user", "admin"]

    const mockList: User[] = [
        { id: "1", username: "User-1", email: "User-1@localhost", firstname: "User-1", lastname: "User-1", roles: ["user"], active: true },
        { id: "2", username: "User-2", email: "User-2@localhost", firstname: "User-2", lastname: "User-2", roles: ["user"], active: false },
        { id: "3", username: "User-3", email: "User-3@localhost", firstname: "User-3", lastname: "User-3", roles: ["user"], active: true },
    ]

    const modal = useModal()

    const [users, setUsers] = React.useState<User[]>(mockList)
    const [selectedUser, setSelectedUser] = React.useState<User | undefined>(mockList[0])
    const [formUser, setFormUser] = React.useState<User | undefined>(selectedUser)

    function isFormUserEdited () {
        return JSON.stringify(selectedUser) !== JSON.stringify(formUser)
    }


    function onRoleCheckChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, checked } = event.target
        const roles = formUser && checked ? [...formUser?.roles, name] : formUser?.roles.filter(role => role !== name)
        formUser && roles && setFormUser({ ...formUser, roles })
    }


    function onSave() {
        modal.open({
            title: "Save User",
            body: "Are you sure you want to save this user?",
            confirmLabel: "Save",
            level: "primary",
            onAction: confirmed => console.info("save user confirmed", confirmed)
        })
    }



    function onDelete() {
        modal.open({
            title: "Delete User",
            body: "Are you sure you want to delete this user?",
            confirmLabel: "Delete",
            level: "danger",
            onAction: confirmed => console.info("delete user confirmed", confirmed)
        })
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
                        <input type="text" id="id" name="id" required value={formUser?.id} disabled className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" required value={formUser?.username} disabled className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <input type="text" id="email" name="email" required value={formUser?.email} onChange={e => formUser && setFormUser({ ...formUser, email: e.target.value })} className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="firstname">Firstname</label>
                        <input type="text" id="firstname" name="firstname" required value={formUser?.firstname} onChange={e => formUser && setFormUser({ ...formUser, firstname: e.target.value })} className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="lastname">Lastname</label>
                        <input type="text" id="lastname" name="lastname" required value={formUser?.lastname} onChange={e => formUser && setFormUser({ ...formUser, lastname: e.target.value })} className="form-control" />
                    </div>

                    <div>
                        <label>Roles</label>
                        <div className="card">
                            <div className="card-body d-flex gap-3">
                                {
                                    roleOptions.map(role => (
                                        <>
                                            <input
                                                type="checkbox"
                                                id={`role-${role}`}
                                                name={role}
                                                checked={formUser?.roles.includes(role)}
                                                onChange={e => onRoleCheckChange(e)}
                                                className="btn-check"
                                            />
                                            <label
                                                htmlFor={`role-${role}`}
                                                className="btn btn-outline-primary text-capitalize"
                                            >
                                                {role}
                                            </label>
                                        </>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div>
                    <label>Activated</label>
                        <div className="card">
                            <div className="card-body d-flex gap-3">
                                <>
                                    <input
                                        type="checkbox"
                                        id="active"
                                        name="active"
                                        checked={formUser?.active}
                                        onChange={e => formUser && setFormUser({ ...formUser, active: e.target.checked })}
                                        className="btn-check"
                                    />
                                    <label
                                        htmlFor="active"
                                        className="btn btn-outline-primary"
                                    >
                                        {formUser?.active ? "Active" : "Inactive"}
                                    </label>
                                </>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="btn-toolbar justify-content-end gap-2" role="toolbar">
                    <button className="btn btn-secondary" disabled={!isFormUserEdited()} onClick={() => setFormUser(selectedUser)} ><i className="bi bi-x-lg" /> Cancel</button>
                    <button className="btn btn-primary" disabled={!isFormUserEdited()} onClick={onSave} ><i className="bi bi-save" /> Save</button>
                    <button className="btn btn-danger" onClick={onDelete}><i className="bi bi-trash" /> Delete</button>
                </div>
            </div>
        </ListViewComponent>
    )

}