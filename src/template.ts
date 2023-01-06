export function parseTemplate(content: string): HTMLElement {
    let parser = new DOMParser();
    let body = parser.parseFromString(content, "text/html");
    console.log(body);
    if (body.body.children.length > 0) {
        return <HTMLElement>body.body.children.item(0);
    }

    let div = document.createElement("div")
    div.innerHTML = "Template has no children";
    return div;
}