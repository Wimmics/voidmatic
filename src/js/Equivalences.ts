import sparqljs, { Triple } from "sparqljs";
import * as fs from 'fs';
import * as $rdf from 'rdflib';
import * as RDFUtils from "./RDFUtils";
import * as QueryUtils from "./QueryUtils";


const EQUIV = $rdf.Namespace("https://ns.inria.fr/equivalence/#");
const equivEquivalenceClasses = EQUIV("AllEquivalentClasses");
const equivEquivalenceProperties = EQUIV("AllEquivalentProperties");


export type Equivalence = {
    property?: $rdf.NamedNode[],
    class?: $rdf.NamedNode[],
    pattern?: TriplePattern[]
}

export type TriplePattern = {
    subject: $rdf.NamedNode | $rdf.BlankNode | NodePattern,
    predicate: $rdf.NamedNode,
    object: $rdf.Node | NodePattern,
}

export type NodePattern = {
    name: string
}

export function readEquivalenceFile(file: string): Promise<Equivalence[]> {
    let equivalences: Equivalence[] = [];
    let fileContent = QueryUtils.fetchGETPromise(file);
    let store = RDFUtils.createStore();
    return fileContent.then(fileContent => RDFUtils.parseTurtleToStore(fileContent, store))
        .then(equivalencesStore => {
            let equivalenceClassNodes: Set<$rdf.NamedNode | $rdf.BlankNode> = new Set();
            let equivalencePropertiesNodes: Set<$rdf.NamedNode | $rdf.BlankNode> = new Set();

            // Extracting all the nodes representing equivalence sets
            equivalencesStore.statementsMatching(null, RDFUtils.RDF("type"), equivEquivalenceClasses).forEach(statement => {
                if ($rdf.isBlankNode(statement.subject) || $rdf.isNamedNode(statement.subject)) {
                    equivalenceClassNodes.add(statement.subject);
                }
            });
            equivalencesStore.statementsMatching(null, RDFUtils.RDF("type"), equivEquivalenceProperties).forEach(statement => {
                if ($rdf.isBlankNode(statement.subject) || $rdf.isNamedNode(statement.subject)) {
                    equivalencePropertiesNodes.add(statement.subject);
                }
            });

            function getMembers(equivalenceNode: $rdf.NamedNode | $rdf.BlankNode, equivalencesStore: $rdf.Formula): $rdf.NamedNode[] {
                let members: $rdf.NamedNode[] = [];
                equivalencesStore.statementsMatching(equivalenceNode, RDFUtils.OWL("members"), null).forEach(statement => {
                    let memberArray: $rdf.NamedNode[] = RDFUtils.collectionToArray(statement.object as $rdf.NamedNode | $rdf.BlankNode, equivalencesStore).filter(member => $rdf.isNamedNode(member)).map(member => member as $rdf.NamedNode);
                    members = members.concat(memberArray);
                });
                return members;
            }

            // Creating the object for each equivalence set
            equivalenceClassNodes.forEach(equivalenceNode => {
                let equivalence: Equivalence = {};
                equivalence.class = getMembers(equivalenceNode, equivalencesStore);

                equivalences.push(equivalence);
            });

            // Creating the object for each equivalence set
            equivalencePropertiesNodes.forEach(equivalenceNode => {
                let equivalence: Equivalence = {};
                equivalence.property = getMembers(equivalenceNode, equivalencesStore);

                equivalences.push(equivalence);
            });

            return equivalences;
        });
}

function applyEquivalence(equivalence: Equivalence, store: $rdf.Store): $rdf.Statement[] {
    let result: $rdf.Statement[] = [];

    // find dataset instances
    let datasetInstances: Set<$rdf.NamedNode> = new Set();
    store.statementsMatching(null, RDFUtils.RDF("type"), RDFUtils.VOID("Dataset")).forEach(statement => {
        if($rdf.isNamedNode(statement.subject)) {
            datasetInstances.add(statement.subject);
        }
    });
    store.statementsMatching(null, RDFUtils.RDF("type"), RDFUtils.DCAT("Dataset")).forEach(statement => {
        if($rdf.isNamedNode(statement.subject)) {
            datasetInstances.add(statement.subject);
        }
    });
    store.statementsMatching(null, RDFUtils.RDF("type"), RDFUtils.SCHEMA("Dataset")).forEach(statement => {
        if($rdf.isNamedNode(statement.subject)) {
            datasetInstances.add(statement.subject);
        }
    });
    store.statementsMatching(null, RDFUtils.RDF("type"), RDFUtils.SD("Dataset")).forEach(statement => {
        if($rdf.isNamedNode(statement.subject)) {
            datasetInstances.add(statement.subject);
        }
    });
    store.statementsMatching(null, RDFUtils.RDF("type"), RDFUtils.DCMITYPE("Dataset")).forEach(statement => {
        if($rdf.isNamedNode(statement.subject)) {
            datasetInstances.add(statement.subject);
        }
    });


    datasetInstances.forEach(datasetInstance => {
        if (equivalence.class != undefined) {
            let applicableEquivalence = false;
            equivalence.class.forEach(equivalenceClass => {
                if(store.holds(datasetInstance, null, equivalenceClass)){
                    applicableEquivalence = true;
                }
            })
            if(applicableEquivalence){
                equivalence.class.forEach(equivalenceClass => {
                    store.statementsMatching(datasetInstance, null, equivalenceClass).forEach(statement => {
                        let subject = statement.subject;
                        let predicate = statement.predicate;
                        equivalence.class.forEach(otherEquivalenceClass => {
                            let newStatement = $rdf.st(subject, predicate, otherEquivalenceClass);
                            result.push(newStatement);
                        });
                    });
                });
            }
        }

        if (equivalence.property != undefined) {
            let applicableEquivalence = false;

            equivalence.property.forEach(equivalenceProperty => {
                if(store.holds(datasetInstance, equivalenceProperty, null)){
                    applicableEquivalence = true;
                }
            })

            if(applicableEquivalence){
                equivalence.property.forEach(equivalenceProperty => {
                    store.statementsMatching(datasetInstance, equivalenceProperty, null).forEach(statement => {
                        let subject = statement.subject;
                        let object = statement.object;
                        equivalence.property.forEach(otherEquivalenceProperty => {
                            let newStatement = $rdf.st(subject, otherEquivalenceProperty, object);
                            result.push(newStatement);
                        });
                    });
                });
            }
        }
    });

    return result;
}

export function applyEquivalences(equivalences: Equivalence[], store: $rdf.Store): $rdf.Statement[] {
    let result: $rdf.Statement[] = [];
    equivalences.forEach(equivalence => {
        result = result.concat(applyEquivalence(equivalence, store));
    });
    return result;
}