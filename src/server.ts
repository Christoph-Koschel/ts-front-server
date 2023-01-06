import {select} from "@yapm/code-database/l/linq";
import {AfterRender} from "./render";

export type SpezialRout = "404";

export abstract class Rout {
    public abstract get pathname(): string[];

    public abstract get CSSID(): string;

    public abstract render();
}

export abstract class FormHandler<KeyMap extends {}> {
    public abstract get blockScreen(): boolean;

    public constructor(form: HTMLFormElement) {
        if (form.id == "") {
            form.id = "auto" + Date.now();
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            // @ts-ignore
            let elements = select(Object.keys(document.forms[form.id].elements)).all().where((x, i) => isNaN(parseInt(x))).get();
            let data = {};
            elements.forEach(value => {
                // @ts-ignore
                data[value] = document.forms[form.id].elements[value].value;
            });

            let div: HTMLElement | null = null;

            if (this.blockScreen) {
                div = document.createElement("div");
                div.style.position = "absolute";
                div.style.height = "100%";
                div.style.width = "100%";
                div.style.top = "0";
                div.style.left = "0";
                div.style.zIndex = "1000";
                document.body.appendChild(div);
            }
            await this.execute(<KeyMap>data);
            if (!!div) {
                div.remove();
            }
        });
    }

    public abstract execute(values: KeyMap): Promise<void>
}

class Server {
    private routes: Rout[];
    private renders: AfterRender[];
    private special: { [Key in SpezialRout]: Rout };

    public constructor() {
        this.routes = [];
        this.renders = [];
        this.special = {"404": null};
    }

    public register(rout: Rout) {
        this.routes.push(rout);
    }

    public registerRender(render: AfterRender) {
        this.renders.push(render);
    }

    public registerSpecial(key: SpezialRout, rout: Rout) {
        this.special[key] = rout;
    }

    public exec() {
        let parts: string[] = document.location.pathname.split("/");
        parts = select(parts).all().where((x, i) => x != "").get();
        let copy = ["/"];
        parts.forEach((value, index, array) => {
            if (index < array.length - 1) {
                copy.push("/");
            }

            copy.push(value);
        });
        parts = copy;

        let matchRate = -1;
        let current: Rout | null = null;

        for (let route of this.routes) {
            let expect = route.pathname;
            let copy = ["/"];
            expect.forEach((value, index, array) => {
                if (index < array.length - 1) {
                    copy.push("/");
                }

                copy.push(value);
            });
            expect = copy;
            let rate = 0;

            if (parts.length != expect.length) {
                continue;
            }

            for (let i = 0; i < parts.length; i++) {
                if (expect[i] == parts[i]) {
                    rate += 2;
                } else if (expect[i] == "*") {
                    rate += 1;
                } else {
                    rate = -1;
                    break;
                }
            }
            if (rate > matchRate) {
                current = route;
            }
        }
        if (current == null) {
            window.addEventListener("load", () => {
                if (this.special["404"] == null) {
                    document.body.innerHTML += "404 Page not found";
                } else {
                    current = this.special["404"];

                    document.body.classList.add(current.CSSID);
                    current.render();
                    this.renders.forEach(render => {
                        render.render(current);
                    });
                }
            });
        } else {
            window.addEventListener("load", () => {
                document.body.classList.add(current.CSSID);
                current.render();
                this.renders.forEach(render => {
                    render.render(current);
                });
            });
        }
    }
}

export const server: Server = new Server();