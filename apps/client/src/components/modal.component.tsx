import React from "react"

import { useModal } from "@client/contexts/modal.context"

import styles from "./modal.module.css"


export default function ModalComponent () {


    const modal = useModal()


    function onCancel () {
        modal.close()
        modal.content?.onAction(false)
    }


    function onOk () {
        modal.close()
        modal.content?.onAction(true)
    }


    function getBgByLevel (level?: "info" | "warning" | "danger") {
        switch (level) {
            case "info":
                return "bg-primary"
            case "warning":
                return "bg-warning"
            case "danger":
                return "bg-danger"
            default:
                return "bg-primary"
        }
    }


    return (
        <div className={`modal ${styles.fade} ${modal.isOpen && styles.show}`}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">

                    {
                        modal.content?.title &&
                        <div className={`modal-header ${getBgByLevel(modal.content?.level)}`}>
                            <div className="modal-title">
                                <strong>
                                    {modal.content?.title}
                                </strong>
                            </div>
                        </div>
                    }

                    <div className="modal-body">
                        {modal.content?.body}
                    </div>

                    <div className="modal-footer">
                        <div className="btn-toolbar d-flex gap-3">
                            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                            <button className={`btn ${getBgByLevel(modal.content?.level)}`} onClick={onOk}>{modal.content?.confirmLabel}</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )

}