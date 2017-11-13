let {Query} = require('./Query');
let dictionary = new Query();

dictionary.get('прозорливый');

dictionary.on('data', (data) => {
    console.log('data', data);
    dictionary.unsubscribe();
})

dictionary.on('error', (error) => {
    console.log('error', error);
})