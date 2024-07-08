export default function windowChange() {
    const anotherFunc = (): number => {
        return 42;
    }

    console.log('window change: ')
    
    window.hello = {
        world: "from injected content script",
        coolNumer: anotherFunc()
    }

    console.log(document.getElementsByTagName('html'))

}