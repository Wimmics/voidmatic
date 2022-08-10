import $ from 'jquery';
const $rdf = require('rdflib');
const EventEmitter = require('events');

var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
var XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
var DCAT = $rdf.Namespace("http://www.w3.org/ns/dcat#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var PROV = $rdf.Namespace("http://www.w3.org/ns/prov#");
var SCHEMA = $rdf.Namespace("http://schema.org/");
var VOID = $rdf.Namespace("http://rdfs.org/ns/void#");
var SD = $rdf.Namespace("http://www.w3.org/ns/sparql-service-description#");
var DCE = $rdf.Namespace("http://purl.org/dc/elements/1.1/");
var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
var SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
var PAV = $rdf.Namespace("http://purl.org/pav/");
var MOD = $rdf.Namespace("https://w3id.org/mod#");

const exampleDataset = $rdf.sym('https://e.g/dataset');

$(() => {
    var store = $rdf.graph();
    var dataCol = $('#dataCol');
    var navCol = $('#navCol');
    var contentDisplay = $("#displayTextArea");
    var uniqueIdCounter = 0;

    class CategoryCore extends EventEmitter {
        constructor(config = { recommended: false, categoryTitle: "", legend: "", idPrefix: "id", minArity: 0, maxArity: Infinity, fields: [] }) {
            super();
            this.recommended = config.recommended;
            this.categoryTitle = config.categoryTitle;
            this.legend = config.legend;
            this.idPrefix = config.idPrefix;
            this.minArity = config.minArity;
            this.maxArity = config.maxArity;
            this.fields = [];
            config.fields.forEach(fieldConfig => {
                this.addNewField(fieldConfig);
            })
        }

        addNewField(fieldConfig) {
            fieldConfig.parentCategory = this;
            this.fields.push(new FieldCore(fieldConfig));
        }
    }

    class CategoryView {

        constructor(config = { category: null }) {
            this.categoryCore = config.category;
            this.lines = [];

            this.categoryCore.fields.forEach(field => {
                if (this.categoryCore.minArity > 0) {
                    this.addLine()
                }
            });
            this.categoryId = this.categoryCore.idPrefix + "Category";

            var dataDiv = $(document.createElement('div'));
            dataDiv.addClass("row");
            dataDiv.attr("id", this.categoryId);
            this.jQueryContent = dataDiv;
            this.generateCategoryFields();
            this.navItem = this.generateNavItem();
        }

        addLine() {
            this.categoryCore.fields.forEach(field => {
                if(this.lines.length < this.categoryCore.maxArity) {
                    var fieldLine = null;
                    if(field instanceof SingleFieldCore) {
                        fieldLine = new SingleFieldInput({ core: field });
                    } else {
                        fieldLine = new MultipleFieldInput({ core: field });
                    }
                    this.lines.push(fieldLine);
                }
            })
        }

        refresh() {
            console.log(this.jQueryContent)
            this.jQueryContent.empty();
            this.jQueryContent = this.generateCategoryFields();

        }

        generateNavItem() {
            var navLink = $(document.createElement("a"));
            navLink.addClass('nav-link');
            navLink.addClass('dropdown-item');
            navLink.text(this.categoryCore.categoryTitle);
            navLink.attr("href", "#" + this.categoryId);
            return navLink;
        }

        generateCategoryFields() {
            var addButtonId = "add" + this.categoryCore.idPrefix + "Button";
            var removeButtonId = "remove" + this.categoryCore.idPrefix + "Button";

            var catTitle = $(document.createElement('h3'));
            catTitle.addClass("text-center");
            catTitle.text(this.categoryCore.categoryTitle);

            var catControlRow = $(document.createElement('div'));
            catControlRow.addClass("row")
            var catLegendCol = $(document.createElement('div'));
            catLegendCol.addClass("col-10")
            var catLegend = $(document.createElement('p'));
            catLegend.text(this.categoryCore.legend);
            catLegendCol.append(catLegend);
            catControlRow.append(catLegendCol);
            var catAddLineCol = $(document.createElement('div'));
            catAddLineCol.addClass("col-1");
            var catAddLineButton = $(document.createElement('button'));
            catAddLineButton.addClass("btn");
            catAddLineButton.attr('type', "button");
            catAddLineButton.attr("id", addButtonId);
            catAddLineCol.append(catAddLineButton);
            var catAddLineButtonImage = $(document.createElement('i'));
            catAddLineButtonImage.addClass("bi")
            catAddLineButtonImage.addClass("bi-file-plus")
            catAddLineButton.append(catAddLineButtonImage);
            var catRemoveLineCol = $(document.createElement('div'));
            catRemoveLineCol.addClass("col-1");
            var catRemoveLineButton = $(document.createElement('button'));
            catRemoveLineButton.addClass("btn");
            catRemoveLineButton.attr('type', "button");
            catRemoveLineButton.attr("id", removeButtonId);
            catRemoveLineCol.append(catRemoveLineButton);
            var catRemoveLineButtonImage = $(document.createElement('i'));
            catRemoveLineButtonImage.addClass("bi")
            catRemoveLineButtonImage.addClass("bi-file-minus")
            catRemoveLineButton.append(catRemoveLineButtonImage);
            catControlRow.append(catAddLineCol);
            catControlRow.append(catRemoveLineCol);

            var catFieldRow = $(document.createElement('div'));
            catFieldRow.addClass("row")
            var catFieldCol = $(document.createElement('div'));
            catFieldCol.addClass("col")

            this.jQueryContent.append(catTitle);
            this.jQueryContent.append(catControlRow);
            this.jQueryContent.append(catFieldRow);
            catFieldRow.append(catFieldCol);

            this.lines.forEach(field => {
                catFieldCol.append(field.generateJQueryContent());
            });

            this.refreshLines = () => {
                catFieldCol.empty();
                this.lines.forEach(field => {
                    catFieldCol.append(field.generateJQueryContent());
                });
            }

            catAddLineButton.on("click", () => {
                console.log("ADD")
                console.log(this.categoryCore)
                this.addLine();
                this.refreshLines();
            });

            catRemoveLineButton.on("click", () => {
                console.log("REMOVE")
                if (this.categoryCore.minArity < this.lines.length) {
                    this.lines.pop();
                }
                this.refreshLines();
            });
        }
    }

    class FieldCore extends EventEmitter {
        constructor(config = { placeholder: "", dataValidationFunction: (inputVal) => { }, dataCreationFunction: (inputVal) => { }, dataExtractionFunction: () => { }, parentCategory: null }) {
            super();
            this.placeholder = config.placeholder;
            this.dataValidationFunction = (inputVal) => {
                var result = false;
                try {
                    result = config.dataValidationFunction(inputVal);
                    return result;
                } catch (e) {
                    return result;
                }
            }
            this.dataCreationFunction = (inputVal) => {
                if (this.dataValidationFunction(inputVal)) {
                    return config.dataCreationFunction(inputVal);
                }
                return store.toNT();
            };
            this.dataExtractionFunction = () => {
                try {
                    return config.dataExtractionFunction();
                } catch (e) {
                    this.emit("error", e);
                    return [];
                }
            }
            this.parentCategory = config.parentCategory;
        }
    }

    class SingleFieldCore extends FieldCore {

    }

    class MultipleFieldCore extends FieldCore {
        constructor(config = { placeholder: [], dataValidationFunction: (inputValArray) => { }, dataCreationFunction: (inputVal) => { }, dataExtractionFunction: () => { }, parentCategory: null }) {
            super();
            this.placeholder = config.placeholder;
            this.dataValidationFunction = (inputVal) => {
                var result = inputValArray.map(value => false );
                try {
                    result = config.dataValidationFunction(inputValArray);
                    return result;
                } catch (e) {
                    return result;
                }
            }
            this.dataCreationFunction = (inputVal) => {
                if (this.dataValidationFunction(inputVal)) {
                    return config.dataCreationFunction(inputVal);
                }
                return store.toNT();
            };
            this.dataExtractionFunction = () => {
                try {
                    return config.dataExtractionFunction();
                } catch (e) {
                    this.emit("error", e);
                    return [];
                }
            }
            this.parentCategory = config.parentCategory;
        }

    } 

    class FieldInput {
        constructor(config = { core: null }) {
            this.fieldCore = config.core;
            this.index = uniqueIdCounter++;
            this.metadataFieldIdPrefix = this.fieldCore.parentCategory.idPrefix + "Field";
            this.fieldValue = "";

            this.fieldCore.addListener("error", error => {
                console.log(error);
            });
            this.inputId = this.metadataFieldIdPrefix + this.index;
        }

        dataValidationFunction = (inputVal) => {
            var result = this.fieldCore.dataValidationFunction(inputVal);
            setButtonValidatedState(this.inputIdButton, result);
            if(result) {
                this.fieldValue = inputVal;
            }
            return result;
        } 

        dataCreationFunction = (inputVal) => {
            if (this.dataValidationFunction(inputVal)) {
                return this.fieldCore.dataCreationFunction(inputVal);
            }
            return store.toNT();
        }

        dataExtractionFunction = () => {
            return this.fieldCore.dataExtractionFunction();
        }

        validateContent = () => {
            contentDisplay.val(this.dataCreationFunction(this.fieldValue));
        }

        generateJQueryContent = () => {
        }

    }

    class SingleFieldInput extends FieldInput {
        constructor(config = { core: null }) {
            super(config)
            this.fieldValue = "";
            
            this.inputIdField = this.inputId + "Textfield";
            this.inputIdButton = this.inputId + "Button";
        }

        generateJQueryContent = () => {
            var lineDiv = $(document.createElement('div'));
            var textInput = $(document.createElement('input'))
            var lineLabel = $(document.createElement('label'));
            textInput.attr('type', 'text');
            textInput.addClass('form-control');
            textInput.attr('id', this.inputIdField);
            textInput.val(this.fieldValue);
            lineLabel.attr('for', this.inputIdField)
            lineLabel.text(this.fieldCore.placeholder);

            var lineFieldCol = $(document.createElement('div'));
            lineFieldCol.addClass('col-11');
            var lineValidButtonCol = $(document.createElement('div'));
            lineValidButtonCol.addClass('col-1');
            var lineValidButton = $(document.createElement('button'));
            lineValidButton.attr("type", "button");
            lineValidButton.attr("id", this.inputIdButton)
            lineValidButton.addClass("btn");
            lineValidButton.addClass("btn-light");
            lineValidButton.text("Validate");
            lineValidButtonCol.append(lineValidButton);

            lineDiv.addClass('row');
            lineDiv.append(lineFieldCol);
            lineDiv.append(lineValidButtonCol);
            lineFieldCol.addClass('form-floating');
            lineFieldCol.append(textInput);
            lineFieldCol.append(lineLabel);
            textInput.on("change", () => {
                this.fieldValue = textInput.val();
                this.validateContent();
            })

            lineValidButton.on("click", () => {
                this.fieldValue = textInput.val();
                this.validateContent();
            });
            
            if(this.fieldValue.length > 0) {
                this.validateContent();
            }

            return lineDiv;
        }
    }

    class MultipleFieldInput extends FieldInput {
        constructor(config = { core: null }) {
            super(config)
            this.fieldValue = "";
            
            this.inputIdField = this.inputId + "Textfield";
            this.inputIdButton = this.inputId + "Button";
        }

        generateJQueryContent = () => {
            var lineDiv = $(document.createElement('div'));
            var textInput = $(document.createElement('input'))
            var lineLabel = $(document.createElement('label'));
            textInput.attr('type', 'text');
            textInput.addClass('form-control');
            textInput.attr('id', this.inputIdField);
            textInput.val(this.fieldValue);
            lineLabel.attr('for', this.inputIdField)
            lineLabel.text(this.fieldCore.placeholder);

            var lineFieldCol = $(document.createElement('div'));
            lineFieldCol.addClass('col-11');
            var lineValidButtonCol = $(document.createElement('div'));
            lineValidButtonCol.addClass('col-1');
            var lineValidButton = $(document.createElement('button'));
            lineValidButton.attr("type", "button");
            lineValidButton.attr("id", this.inputIdButton)
            lineValidButton.addClass("btn");
            lineValidButton.addClass("btn-light");
            lineValidButton.text("Validate");
            lineValidButtonCol.append(lineValidButton);

            lineDiv.addClass('row');
            lineDiv.append(lineFieldCol);
            lineDiv.append(lineValidButtonCol);
            lineFieldCol.addClass('form-floating');
            lineFieldCol.append(textInput);
            lineFieldCol.append(lineLabel);
            textInput.on("change", () => {
                this.fieldValue = textInput.val();
                this.validateContent();
            })

            lineValidButton.on("click", () => {
                this.fieldValue = textInput.val();
                this.validateContent();
            });
            
            if(this.fieldValue.length > 0) {
                this.validateContent();
            }

            return lineDiv;
        }
    }

    function setButtonValidatedState(inputId, validated, message) {
        if (validated) {
            $('#' + inputId).removeClass("btn-light")
            $('#' + inputId).removeClass("btn-warning")
            $('#' + inputId).removeClass("btn-danger")
            $('#' + inputId).addClass("btn-success")
        }
        else {
            $('#' + inputId).removeClass("btn-light")
            $('#' + inputId).removeClass("btn-warning")
            $('#' + inputId).addClass("btn-danger")
            $('#' + inputId).removeClass("btn-success")
        }
        if (message != undefined) {
            console.log("Popover " + inputId)
            console.log(inputId)
            var popover = new bootstrap.Popover($('#' + inputId), { content: message, trigger: "click" })

        }
    }

    function isLiteral(value) {
        try {
            return value != undefined && value.length > 0 && $rdf.isLiteral($rdf.lit(value));
        } catch (e) {
            return false;
        }
    }

    function isURI(value) {
        try {
            return value != undefined && value.length > 0 && $rdf.isNamedNode($rdf.sym(value));
        } catch (e) {
            return false;
        }
    }

    function isNotBlank(value) {
        try {
            return isURI(value) || isLiteral(value) ;
        } catch (e) {
            return false;
        }
    }

    function isDatetime(value) {
        try {
            return isLiteral(value);
        } catch (e) {
            return false;
        }
    }

    function isDuration(value) {
        try {
            return isLiteral(value);
        } catch (e) {
            return false;
        }
    }


    var inputMetadata = [
        {
            recommended: true,
            categoryTitle: "Title",
            legend: "Short title for the knowledge base and its content.",
            idPrefix: "title",
            minArity: 1,
            maxArity: Infinity,
            fields: [
                new MultipleFieldCore({
                    placeholder: ["Short title for the knowledge base", "Language tag of the title"],
                    dataCreationFunction: (inputVal, inputTag) => {
                        if(inputTag.length > 0) {
                            store.add(exampleDataset, DCT('title'), $rdf.lit(inputVal, inputTag));
                        } else {
                            store.add(exampleDataset, DCT('title'), $rdf.lit(inputVal));
                        }
                        return store.toNT();
                    },
                    dataValidationFunction: (inputVal, inputTag) => {
                        return isLiteral(inputVal);
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Creator",
            legend: "Represents the different actors involved in the creation of the dataset.",
            idPrefix: "creator",
            minArity: 1,
            maxArity: Infinity,
            fields: [
                new SingleFieldCore({
                    placeholder: "Creator's name or URI",
                    dataValidationFunction: (inputVal) => {
                        var result = isLiteral(inputVal);
                        return result;
                    },
                    dataCreationFunction: (inputVal) => {
                        store.add(exampleDataset, DCT('creator'), inputVal);
                        return store.toNT();
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Endpoint URL",
            legend: "URL of the SPARQL endpoint.",
            idPrefix: "endpoint",
            minArity: 1,
            maxArity: Infinity,
            fields: [
                new SingleFieldCore({
                    placeholder: "Endpoint's URL",
                    dataValidationFunction: (inputVal) => {
                        return isURI(inputVal);
                    },
                    dataCreationFunction: (inputVal) => {
                        store.add(exampleDataset, VOID('sparqlEndpoint'), $rdf.sym(inputVal));
                        return store.toNT();
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Description",
            legend: "Long description of the knowledge base and its content.",
            idPrefix: "description",
            minArity: 1,
            maxArity: Infinity,
            fields: [
                new MultipleFieldCore({
                    placeholder: ["Long description of the knowledge base", "Language tag for the description (optional)"],
                    dataCreationFunction: (inputVal, inputLang) => {
                        if(inputLang.length > 0) {
                            store.add(exampleDataset, DCT('description'), $rdf.lit(inputVal, inputLang));
                        } else {
                            store.add(exampleDataset, DCT('description'), $rdf.lit(inputVal));
                        }
                        return store.toNT();
                    },
                    dataValidationFunction: (inputVal, inputLang) => {
                        return isLiteral(inputVal);
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Publication date",
            legend: "Publication date of the knowledge base.",
            idPrefix: "publication",
            minArity: 1,
            maxArity: 1,
            fields: [
                new SingleFieldCore({
                    placeholder: "Publication date of the knowledge base",
                    dataCreationFunction: (inputVal) => {
                        store.add(exampleDataset, DCT('issued'), $rdf.lit(inputVal));
                        return store.toNT();
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal);
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Vocabularies",
            legend: "URIs of the vocabularies used in the knowledge base.",
            idPrefix: "vocabulary",
            minArity: 1,
            maxArity: Infinity,
            fields: [
                new SingleFieldCore({
                    placeholder: "Vocabularies used in the knowledge base",
                    dataCreationFunction: (inputVal) => {
                        store.add(exampleDataset, VOID('vocabulary'), $rdf.sym(inputVal));
                        return store.toNT();
                    },
                    dataValidationFunction: (inputVal) => {
                        return isURI(inputVal);
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Languages",
            legend: "Language tags used in the literals of the knowledge base.",
            idPrefix: "language",
            minArity: 1,
            maxArity: Infinity,
            fields: [
                new SingleFieldCore({
                    placeholder: "Language tags used in the literals of the knowledge base",
                    dataCreationFunction: (inputVal) => {
                        store.add(exampleDataset, DCT('language'), $rdf.lit(inputVal));
                        return store.toNT();
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal);
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Keywords",
            legend: "Keywords describing the content of the knowledge base.",
            idPrefix: "keyword",
            minArity: 1,
            maxArity: Infinity,
            fields: [
                new SingleFieldCore({
                    placeholder: "Keyworks used to describe the knowledge base",
                    dataCreationFunction: (inputVal) => {
                        console.log(isLiteral(inputVal) + " " + isURI(inputVal));
                        if (isLiteral(inputVal)) {
                            store.add(exampleDataset, DCAT('keyword'), $rdf.lit(inputVal));
                        }
                        if (isURI(inputVal)) {
                            store.add(exampleDataset, DCAT('theme'), $rdf.sym(inputVal));
                        }
                        return store.toNT();
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal) || isURI(inputVal);
                    }
                })
            ]
        },
        {
            recommended: true,
            categoryTitle: "Version",
            legend: "Current version number of the knowledge base.",
            idPrefix: "version",
            minArity: 1,
            maxArity: 1,
            fields: [
                new SingleFieldCore({
                    placeholder: "Current version of the knowledge base",
                    dataCreationFunction: (inputVal) => {
                        store.add(exampleDataset, DCAT('version'), $rdf.lit(inputVal));
                        return store.toNT();
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal);
                    }
                })
            ]
        }
    ];

    function generateFields() {
        inputMetadata.forEach(catMetadata => {
            var catMetadataView = new CategoryView({ category: new CategoryCore(catMetadata) })
            dataCol.append(catMetadataView.jQueryContent)
            navCol.append(catMetadataView.navItem);
        })
    }

    generateFields()
});
