//@ts-check

function getTermsList(cb) {
    // console.log('getTermsList')
    ldf.Logger.setLevel('error');

    let fragmentsClient = new ldf.FragmentsClient('http://ldf.kloud.one/redbook');
    
    let limit = 1000000;
    let offset = 0;
    
    let q = 
    `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        PREFIX dc: <http://purl.org/dc/terms#>
        
        SELECT ?id ?wr
        WHERE {
            ?id a ontolex:LexicalEntry ;
                ontolex:writtenRep ?wr .
        
           OPTIONAL {
                ?id dc:dateAccepted ?dateAccepted .
            }
        }
        ORDER BY ?dateAccepted
        OFFSET ${offset}
        LIMIT ${limit}
    `
    
    let r = new ldf.SparqlIterator(q, { fragmentsClient: fragmentsClient });
    let n = 0;
    let results = [];
    
    function getLiteral(l) {
        let match = /^"([^]*)"/.exec(l);
        return (match) ? match[1] : null;
    }
    
    r.on('data', (data) => {
        // console.log(data)
        results.push( getLiteral( data['?wr'] ).toLowerCase() );
    });
    
    r.on('end', () => {
        // console.log(results);
        cb(results);
        // console.log(results.size);
    });
}