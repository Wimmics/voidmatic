import * as RDFUtils from "./RDFUtils.ts";
import * as Query from "./QueryUtils.ts";
import { inputMetadata } from './Categories.ts';
import { CategoryCore } from './Model.ts';
import { CategoryView, generateNavItem } from "./View.ts";

import $ from 'jquery';
import * as $rdf from 'rdflib';
import { saveAs } from 'file-saver';
import { v4 as uuid } from 'uuid';

export let controlInstance;

export class Control {

    store: $rdf.Store;
    contentDisplay: JQuery<HTMLElement>;
    categoryViews: CategoryView[];
    metadataCategoryViewMap: Map<CategoryCore, CategoryView>;
    forceHTTPSFlag: boolean;
    sessionId: string;

    constructor() {
        if (controlInstance) {
            throw new Error("Control already instanced")
        }
        controlInstance = this;

        var navCol = $('#navCol');

        this.store = RDFUtils.createStore();
        this.contentDisplay = $("#displayTextArea");
        this.categoryViews = [];
        this.metadataCategoryViewMap = new Map();
        this.forceHTTPSFlag = true;
        this.sessionId = uuid();

        this.generateFields();

        $("#downloadButton").on("click", () => {
            RDFUtils.serializeStoreToTurtlePromise(this.store).then(fileContent => {
                saveAs(new Blob([fileContent], { "type": "text/turtle" }), "description.ttl")
            })
        });

        $("#saturationButton").on("click", () => {
            const equivalences = this.generateEquivalenceTriples();
            this.store.addAll(equivalences);
            this.refreshStore()
        });

        $('#forceHTTPScheckbox').on("change", () => {
            var checkboxValue = $('#forceHTTPScheckbox').prop("checked");
            this.forceHTTPSFlag = checkboxValue;
        })

        this.addStatement(new $rdf.Statement(RDFUtils.exampleDataset, RDFUtils.RDF("type"), RDFUtils.DCAT("Dataset")));

    }

    standardizeEndpointURL(endpointURL) {
        if (this.forceHTTPSFlag) {
            return endpointURL.replace("http://", "https://");
        } else {
            return endpointURL;
        }
    }

    /**
     * Generates triples in known vocabularies according to IndeGx equivalences.
     * TODO: Make it using SPARQL or defined in each field.
     */
    generateEquivalenceTriples() {
        var result: $rdf.Statement[] = [];

        const dcatDatasetInstanceStatement = this.store.anyStatementMatching(null, RDFUtils.RDF("type"), RDFUtils.DCAT("Dataset"));
        if (dcatDatasetInstanceStatement != undefined) {
            const subject = dcatDatasetInstanceStatement.subject;
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.SCHEMA("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.DCMITYPE("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.VOID("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.SD("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.PROV("Entity")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.SKOS("Concept")))
        }

        const dctTitleStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("title"), null);
        if (dctTitleStatement != undefined) {
            const subject = dctTitleStatement.subject;
            const object = dctTitleStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("name"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.RDFS("label"), object))
        }

        const dctDescriptionStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("description"), null);
        if (dctDescriptionStatement != undefined) {
            const subject = dctDescriptionStatement.subject;
            const object = dctDescriptionStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("description"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.OWL("comment"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.SKOS("note"), object))
        }

        const dctCreatorStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("creator"), null);
        if (dctCreatorStatement != undefined) {
            const subject = dctCreatorStatement.subject;
            const object = dctCreatorStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("creator"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PROV("wasAttributedTo"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PAV("authoredBy"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PAV("createdBy"), object))
        }

        const dctPublicationStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("issued"), null);
        if (dctPublicationStatement != undefined) {
            const subject = dctPublicationStatement.subject;
            const object = dctPublicationStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("datePublished"), object))
        }

        const voidVocabularyStatement = this.store.anyStatementMatching(null, RDFUtils.VOID("vocabulary"), null);
        if (voidVocabularyStatement != undefined) {
            const subject = voidVocabularyStatement.subject;
            const object = voidVocabularyStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.DCT("conformsTo"), object))
        }

        const voidSparqlEndpointStatement = this.store.anyStatementMatching(null, RDFUtils.VOID("sparqlEndpoint"), null);
        if (voidSparqlEndpointStatement != undefined) {
            const subject = voidSparqlEndpointStatement.subject;
            const object = voidSparqlEndpointStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("contentURL"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.DCAT("endpointURL"), object))
        }

        const dcatVersionStatement = this.store.anyStatementMatching(null, RDFUtils.DCAT("version"), null);
        if (dcatVersionStatement != undefined) {
            const subject = dcatVersionStatement.subject;
            const object = dcatVersionStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("version"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.DCT("hasVersion"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PAV("version"), object))
        }

        const dctLanguageStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("language"), null);
        if (dctLanguageStatement != undefined) {
            const subject = dctLanguageStatement.subject;
            const object = dctLanguageStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("inLanguage"), object))
        }

        return result;
    }

    listNodesStore(s, p, o) {
        return this.store.each(s, p, o);
    }

    addStatement(statement) {
        this.addAllStatements([statement])
    }

    addAllStatements(statements) {
        this.store.add(statements);
        this.refreshStore();
    }

    removeStatement(statement) {
        if (this.store.holdsStatement(statement)) {
            this.store.remove(statement);
            this.refreshStore();
        }
    }

    removeAllStatements(statements) {
        statements.forEach(statement => {
            if (this.store.holdsStatement(statement)) {
                this.store.remove(statement);
            }
            this.refreshStore();
        })
    }

    setDisplay(str) {
        this.contentDisplay.text(str);
    }

    generateFields() {
        var dataCol = $('#dataCol');
        var navCol = $('#navCol');

        inputMetadata.forEach(catMetadata => {
            var catMetadataView = new CategoryView({ category: catMetadata });
            this.categoryViews.push(catMetadataView);
            const categoryJquery = catMetadataView.generateJQueryContent();
            console.log(categoryJquery.html());
            dataCol.append(categoryJquery)
            navCol.append(catMetadataView.navItem);

            catMetadataView.on("add", (statements, source) => {
                this.addAllStatements(statements);
                this.sendMetadatatoServer();
            });

            catMetadataView.on("remove", (statements, source) => {
                this.removeAllStatements(statements);
                this.sendMetadatatoServer();
            });

            catMetadataView.on("error", (message, source) => {
                console.error(message);
            })

            catMetadataView.on("change", () => {
                dataCol.empty();
                navCol.empty();
                this.generateFields();
            })

            this.metadataCategoryViewMap.set(catMetadata.idPrefix, catMetadataView);
        })

        navCol.append(generateNavItem("Description of the dataset", "displayTextArea"));
    }

    refreshStore() {
        RDFUtils.serializeStoreToTurtlePromise(this.store).then(str => {
            controlInstance.setDisplay(str);
        })
    }

    sendMetadatatoServer() {
        if (this.store.holds(null, RDFUtils.VOID("sparqlEndpoint"), null)) {
            RDFUtils.serializeStoreToNTriplesPromise(this.store).then(str => {
                const finalUrl = "https://prod-dekalog.inria.fr/description?uuid=" + this.sessionId + "&description=" + encodeURIComponent(str.replaceAll("\n", " "));
                return Query.fetchJSONPromise(finalUrl).catch(error => { })
            }).catch(error => { })
        }
    }
}