class MyEventEmitter {
    constructor() {
        this.events = {};
    }

    on(type, cb) {
        this.events['_on' + type] = this.events['_on' + type] || [];
        this.events['_on' + type].push(cb);
    }

    emit(type, args) {
        this.events['_on' + type] && this.events['_on' + type].forEach((cb) => cb(args));
    }

    unsubscribe() {
        this.events = {};
    }
}

class Query extends MyEventEmitter {
    constructor() {
        super();
        ldf.Logger.setLevel('error');
    }

    get(term) {
        term = term.toLowerCase();
        let fragmentsClient = new ldf.FragmentsClient('http://ldf.kloud.one/redbook');
        let q = 
        `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>
            PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
            PREFIX dc: <http://purl.org/dc/terms#>
            
            SELECT ?id ?meaning ?usage ?partOfSpeech ?canonicalForm
            WHERE {
                ?id a ontolex:LexicalEntry ;
                    ontolex:writtenRep "${term}"@ru .
                OPTIONAL {
                    ?id ontolex:canonicalForm ?canonicalForm .
                }
                OPTIONAL {
                    ?id lexinfo:partOfSpeech ?partOfSpeech .
                }
                OPTIONAL {
                    ?id dc:sense ?senseId .
                    ?senseId ontolex:reference ?referenceId .
                    ?referenceId rdf:value ?meaning .
                }
                OPTIONAL {
                    ?id dc:sense ?senseId .
                    ?senseId ontolex:usage ?usageId .
                    ?usageId rdf:value ?usage .
                }
                
            }
        `;
        let r;
        try {
            r = new ldf.SparqlIterator(q, { fragmentsClient: fragmentsClient });
        }
        catch (error) {
            this.emit('error', error);
        }
        if (r) {
            let results = {};
            
            r.on('data', (res) => {
                let id = res['?id'];
                let meaning = getLiteral(res['?meaning']);
                let usage = getLiteral(res['?usage']);
                let partOfSpeech = getPosTag(res['?partOfSpeech']);
                let canonicalForm = res['?canonicalForm'];
                if(!results.hasOwnProperty(id)){
                    results[id] = {
                        meanings: {},
                        partOfSpeech: null,
                        canonicalForm: null,
                    }
                }
                if(!results[id].meanings.hasOwnProperty(meaning) && meaning != null){
                    results[id].meanings[meaning] = [];
                }
                if(usage){
                    results[id].meanings[meaning].push(usage);
                }
                if(!results[id].partOfSpeech) results[id].partOfSpeech = partOfSpeech;
                if(!results[id].canonicalForm) results[id].canonicalForm = canonicalForm;
            });
    
            r.on('end', () => {
                this.emit('data', results);
            });
        }

    }
}

function getLiteral(l) {
    let match = /^"([^]*)"/.exec(l);
    return (match) ? match[1] : null;
}

function getPosTag(tag) {
    let posTag = null;
    if(tag) posTag = tag.replace('http://www.lexinfo.net/ontology/2.0/lexinfo#', '');
    return posTag;
}
