class Session {
    private prefix: string = window.location.hostname;

    public load(key: string): string | null {
        return sessionStorage.getItem(this.prefix + ":" + key);
    }

    public set(key: string, value: string) {
        sessionStorage.setItem(this.prefix + ":" + key, value);
    }

    public exists(key: string): boolean {
        return this.load(key) != null;
    }
}

export const session: Session = new Session();