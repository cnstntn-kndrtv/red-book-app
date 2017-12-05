//@ts-check

let exampleButton = document.querySelector('#exampleButton');
exampleButton.onclick = () => example()

let getTermsListButton = document.querySelector('#getTermsListButton');
getTermsListButton.onclick = () => getTermsList();

function example() {
    let dictionary = new Query();
    
    dictionary.get('прозорливый');
    
    dictionary.on('data', (data) => {
        console.log('data', data);
        dictionary.unsubscribe();
    });
    
    dictionary.on('error', (error) => {
        console.log('error', error);
    });
}
