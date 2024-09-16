export namespace User {
    export const name = /^[A-Za-z0-9_.-]{8,}$/;
}


export namespace Client {
    export const name = /^[A-Za-z0-9_.-]{8,}$/;
}

export namespace Password {
    export const password = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!?&%$])[A-Za-z\d!?&%$]{8,}$/;
}

