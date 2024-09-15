import * as Regex from "./regexes"


describe("regexes", () => {

    describe("namespace user", () => {

        describe ("username", () => {

            test("username to be valid", () => {
                expect(Regex.User.username.test("User.Name_0-9")).toBeTruthy()
            })

            test("username should be to short", () => {
                expect(Regex.User.username.test("User")).toBeFalsy()
            })

            test("username should not have whitespace", () => {
                expect(Regex.User.username.test("User Name")).toBeFalsy()
            })

            test('username should not have "?"', () => {
                expect(Regex.User.username.test("User?Name")).toBeFalsy()
            })

        })

    })



    describe("namespace client", () => {

        describe ("clientname", () => {

            test("clientname to be valid", () => {
                expect(Regex.Client.clientname.test("Client.Name_0-9")).toBeTruthy()
            })

            test("clientname should be to short", () => {
                expect(Regex.Client.clientname.test("Client")).toBeFalsy()
            })

            test("clientname should not have whitespace", () => {
                expect(Regex.Client.clientname.test("Client Name")).toBeFalsy()
            })

            test('clientname should not have "?"', () => {
                expect(Regex.Client.clientname.test("Client?Name")).toBeFalsy()
            })

        })

    })



    describe("namespace password", () => {

        describe ("password", () => {

            test("password should have min 8 characters", () => {
                expect(Regex.Password.password.test("pass1!")).toBeFalsy()
            })

            test("password should not allow whitespace", () => {
                expect(Regex.Password.password.test("pass word")).toBeFalsy()
            })

            test("password should have letters", () => {
                expect(Regex.Password.password.test("0123456789!")).toBeFalsy()
            })

            test("password should have numbers", () => {
                expect(Regex.Password.password.test("password!")).toBeFalsy()
            })

            test("password should include at least one special characters", () => {
                expect(Regex.Password.password.test("password0")).toBeFalsy()
            })

            test("password should be valid", () => {
                expect(Regex.Password.password.test("password1!")).toBeTruthy()
            })

        })

    })

})