import {Rout} from "./server";

export abstract class AfterRender {
    public abstract render(rout: Rout): void;
}