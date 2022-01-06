window.onload = ()=>{
    console.log('window load');
    const addButton = document.querySelector('#addButton');
    const root: HTMLDivElement = document.querySelector('#root-game-panel') as HTMLDivElement;

    const openPage = ()=>{
        console.log('page opened')
    }

    // @ts-ignore
    window.openPage = openPage;
    addButton && addButton.addEventListener('click', ()=>{
        root.innerHTML += 'this is test <a href="javascript:void(0)" onclick="">link</a>'
    })
}
