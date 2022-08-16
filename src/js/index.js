import $ from 'jquery';
import { Statement } from 'rdflib';
import * as bootstrap from 'bootstrap'

const $rdf = require('rdflib');
const EventEmitter = require('events');

var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
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
    var dataCol = $('#dataCol');
    var navCol = $('#navCol');
    var uniqueIdCounter = 0;

    class CategoryCore {
        constructor(config = { recommended: false, categoryTitle: "", legend: "", idPrefix: "id", minArity: 0, maxArity: Infinity, fields: [] }) {
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
            this.fields.push(fieldConfig);
        }
    }

    class CategoryView extends EventEmitter {

        constructor(config = { category: null }) {
            super();
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
                        fieldLine = new SingleFieldView({ core: field, parentCategoryView:this });
                    } else if(field instanceof MultipleFieldCore) {
                        fieldLine = new MultipleFieldView({ core: field, parentCategoryView:this });
                    } else {
                        console.error(field)
                        throw new Error("Unknown line type ")
                    }
                    this.lines.push(fieldLine);
                
                    fieldLine.on("add", (statement, source) => {
                        this.emit("add", statement, source);
                    })
                
                    fieldLine.on("remove", (statement, source) => {
                        this.emit("remove", statement, source);
                    })
                
                    fieldLine.on("invalidValue", (statement, source) => {
                        this.emit("invalidValue", statement, source);
                    })
                }
            })
        }

        refresh() {
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

            this.refreshLines = () => {
                catFieldCol.empty();
                this.lines.forEach(field => {
                    catFieldCol.append(field.generateJQueryContent());
                });
                if(this.lines.length == this.categoryCore.maxArity) {
                    catAddLineButton.prop("disabled", true);
                } else {
                    catAddLineButton.prop("disabled", false);
                }
                if(this.lines.length == this.categoryCore.minArity) {
                    catRemoveLineButton.prop("disabled", true);
                } else {
                    catRemoveLineButton.prop("disabled", false);
                }
            }

            this.refreshLines();

            catAddLineButton.on("click", () => {
                console.log("ADD")
                this.addLine();
                this.refreshLines();
            });

            catRemoveLineButton.on("click", () => {
                console.log("REMOVE")
                if (this.categoryCore.minArity < this.lines.length) {
                    if(this.lines.at(-1).getData() != undefined) {
                        this.emit("remove", this.lines.at(-1).getData(), this.lines.at(-1));
                    }
                    this.lines.pop();
                }
                this.refreshLines();
            });
        }
    }

    class FieldCore {
        constructor(config = { placeholder: "", dataValidationFunction: (inputVal) => { }, dataCreationFunction: (inputVal) => { }, dataExtractionFunction: () => { }, parentCategory: null, defaultValue: null, advice:"" }) {
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
            this.defaultValue = config.defaultValue;
            this.advice = config.advice;
        }
    }

    class SingleFieldCore extends FieldCore {

    }

    class MultipleFieldCore extends FieldCore {
        constructor(config = { placeholder: [], bootstrapFieldColWidth:[], dataValidationFunction: (inputValArray) => { }, dataCreationFunction: (inputValArray) => { }, dataExtractionFunction: () => { }, parentCategory: null, defaultValue:[] }) {
            super();
            this.placeholder = config.placeholder;
            this.bootstrapFieldColWidth = config.bootstrapFieldColWidth;
            this.dataValidationFunction = inputValArray => {
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
            this.defaultValue = config.defaultValue;
            this.parentCategory = config.parentCategory;
        }

    } 

    class FieldView extends EventEmitter {
        constructor(config = { core: null, parentCategoryView:null }) {
            super();
            this.fieldCore = config.core;
            this.parentCategoryView = config.parentCategoryView;
            this.index = uniqueIdCounter++;
            this.metadataFieldIdPrefix = this.fieldCore.parentCategory.idPrefix + "Field";
            this.fieldValue = this.fieldCore.defaultValue;
            this.inputId = this.metadataFieldIdPrefix + this.index;
        }

        getValue() {
            return this.fieldValue;
        }

        hasValidValue() {
            return this.fieldCore.dataValidationFunction(this.getValue());
        }

        getRDFData() {
            return this.validateContent();
        }

        dataValidationFunction = (inputVal) => {
            var result = this.fieldCore.dataValidationFunction(inputVal);
            this.setValidationState(result);
            if(result) {
                this.fieldValue = inputVal;
            }
            return result;
        }

        setValidationState = valid => {
        }

        dataExtractionFunction = () => {
            return this.fieldCore.dataExtractionFunction();
        }

        validateContent = () => {
            var validated = this.dataValidationFunction(this.fieldValue);
            if(validated) {
                var statement = this.fieldCore.dataCreationFunction(this.fieldValue);
                this.emit("add", statement, this);
                return statement;
            } else {
                this.emit("invalidValue", this.fieldCore.advice, this);
            }
        }

        updateContent = newValue => {
            var oldValueValidated = this.fieldCore.dataValidationFunction(this.fieldValue);
            if(oldValueValidated) {
                var statement = this.fieldCore.dataCreationFunction(this.fieldValue);
                this.emit("remove", statement, this);
            }
            this.fieldValue = newValue;
            this.validateContent();
        }

        generateJQueryContent = () => {
        }

    }

    class SingleFieldView extends FieldView {
        constructor(config = { core: null }) {
            super(config)
            
            this.inputIdField = this.inputId + "Textfield";
            this.inputIdButton = this.inputId + "Button";
        }

        setValidationState = valid => {
            setButtonValidatedState(this.inputIdButton, valid);
            var field = $('#'+this.inputIdField);
            if(valid) {
                field.removeClass("border-danger");
                field.addClass("border-success")
            } else {
                field.addClass("border-danger");
                field.removeClass("border-success")
            }
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
                this.updateContent(textInput.val());
            })

            lineValidButton.on("click", () => {
                this.updateContent(textInput.val());
            });
            
            if(this.fieldValue.length > 0) {
                this.validateContent();
            }

            return lineDiv;
        }
    }

    class MultipleFieldView extends FieldView {
        constructor(config = { core: null }) {
            super(config)
            
            this.numberOfFields = this.fieldCore.placeholder.length;
            this.bootstrapFieldColWidth = config.core.bootstrapFieldColWidth;
            this.fieldValue = this.fieldCore.defaultValue;

            this.inputIdFields = [];
            for(var i = 0; i < this.numberOfFields; i++) {
                this.inputIdFields.push(this.inputId + "Textfield" + i);
            }
            this.inputIdButton = this.inputId + "Button";
        }

        setValidationState = valid => {
            setButtonValidatedState(this.inputIdButton, valid);
            this.inputIdFields.forEach(id => {
                var field = $('#'+id);
                if(valid) {
                    field.removeClass("border-danger");
                    field.addClass("border-success")
                } else {
                    field.addClass("border-danger");
                    field.removeClass("border-success")
                }
            })
        }

        generateJQueryContent = () => {
            var lineDiv = $(document.createElement('div'));

            var lineValidButtonCol = $(document.createElement('div'));
            lineValidButtonCol.addClass('col-1');
            var lineValidButton = $(document.createElement('button'));
            lineValidButton.attr("type", "button");
            lineValidButton.attr("id", this.inputIdButton)
            lineValidButton.addClass("btn");
            lineValidButton.addClass("btn-light");
            lineValidButton.text("Validate");
            lineValidButtonCol.append(lineValidButton);

            var fields = [];

            for(var i = 0; i < this.numberOfFields; i++) {
                var lineFieldCol = $(document.createElement('div'));
                lineFieldCol.addClass('col-' + this.bootstrapFieldColWidth[i]);
                
                var textInput = $(document.createElement('input'))
                var lineLabel = $(document.createElement('label'));
                textInput.attr('type', 'text');
                textInput.addClass('form-control');
                textInput.attr('id', this.inputIdFields[i]);
                textInput.val(this.fieldValue[i]);
                lineLabel.attr('for', this.inputIdFields[i])
                lineLabel.text(this.fieldCore.placeholder[i]);

                fields.push(textInput);
                textInput.on("change", () => {
                    this.updateContent(fields.map(field => field.val()));
                })
                
                lineFieldCol.addClass('form-floating');
                lineFieldCol.append(textInput);
                lineFieldCol.append(lineLabel);
    
                lineDiv.append(lineFieldCol);
            }

            lineDiv.addClass('row');
            lineDiv.append(lineValidButtonCol);

            lineValidButton.on("click", () => {
                this.updateContent(fields.map(field => field.val()));
            });
            
            if(fields.map(field => (field.val().length > 0)).reduce( (previous, current) => previous || current , false)) {
                this.fieldValue = fields.map(field => field.val());
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
                    placeholder: ["Short title for the knowledge base", "Language tag (optional)"],
                    advice: "The short title must be non-empty",
                    defaultValue: ["", "en"],
                    bootstrapFieldColWidth : [8, 3],
                    dataCreationFunction: argArray => {
                        var inputVal = argArray[0];
                        var inputTag = argArray[1];
                        if(inputTag.length > 0) {
                            return new Statement(exampleDataset, DCT('title'), $rdf.lit(inputVal, inputTag));
                        } else {
                            return new Statement(exampleDataset, DCT('title'), $rdf.lit(inputVal));
                        }
                    },
                    dataValidationFunction: valuesArray => {
                        var inputVal = valuesArray[0];
                        var inputTag = valuesArray[1];
                        var result = isLiteral(inputVal) && (isLiteral(inputTag) || inputTag.length == 0);
                        return result;
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
                    defaultValue: "",
                    advice: "The creator must be non-empty",
                    dataValidationFunction: (inputVal) => {
                        var result = isLiteral(inputVal);
                        return result;
                    },
                    dataCreationFunction: (inputVal) => {
                        return new Statement(exampleDataset, DCT('creator'), inputVal);
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
                    defaultValue: "",
                    dataValidationFunction: (inputVal) => {
                        return isURI(inputVal);
                    },
                    dataCreationFunction: (inputVal) => {
                        return new Statement(exampleDataset, VOID('sparqlEndpoint'), $rdf.sym(inputVal));
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
                    placeholder: ["Long description of the knowledge base", "Language tag (optional)"],
                    defaultValue: ["", "en"],
                    advice: "The description must be non-empty",
                    bootstrapFieldColWidth : [8, 3],
                    dataCreationFunction: argArray => {
                        var inputVal = argArray[0];
                        var inputLang = argArray[1];
                        if(inputLang.length > 0) {
                            return new Statement(exampleDataset, DCT('description'), $rdf.lit(inputVal, inputLang));
                        } else {
                            return new Statement(exampleDataset, DCT('description'), $rdf.lit(inputVal));
                        }
                    },
                    dataValidationFunction: valuesArray => {
                        var inputVal = valuesArray[0];
                        var inputTag = valuesArray[1];
                        var result = isLiteral(inputVal) && (isLiteral(inputTag) || inputTag.length == 0);
                        return result;
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
                    defaultValue: "",
                    advice: "The date must be non-empty and in the correct format",
                    dataCreationFunction: (inputVal) => {
                        return new Statement(exampleDataset, DCT('issued'), $rdf.lit(inputVal));
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
                    defaultValue: "",
                    advice: "The vocabulary must be an URI",
                    dataCreationFunction: (inputVal) => {
                        return new Statement(exampleDataset, VOID('vocabulary'), $rdf.sym(inputVal));
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
                    defaultValue: "",
                    advice: "The vocabulary must be non empty",
                    dataCreationFunction: (inputVal) => {
                        return new Statement(exampleDataset, DCT('language'), $rdf.lit(inputVal));
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
                    defaultValue: "",
                    advice: "The keyword must be non empty",
                    dataCreationFunction: (inputVal) => {
                        if (isLiteral(inputVal)) {
                            return new Statement(exampleDataset, DCAT('keyword'), $rdf.lit(inputVal));
                        }
                        if (isURI(inputVal)) {
                            return new Statement(exampleDataset, DCAT('theme'), $rdf.sym(inputVal));
                        }
                        return null;
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
                    defaultValue: "1.0",
                    advice: "The version must be non empty",
                    dataCreationFunction: (inputVal) => {
                        return new Statement(exampleDataset, DCAT('version'), $rdf.lit(inputVal));
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal);
                    },
                    dataExtractionFunction: () => {

                    }
                })
            ]
        }
    ];

    let controlInstance;

    class Control {
        constructor() {
            if(controlInstance) {
                throw new Error("Control already instanced")
            }
            controlInstance = this;

            this.store = $rdf.graph();
            this.contentDisplay = $("#displayTextArea");
            this.categoryViews = [];

            this.store.add(exampleDataset, RDF("type"), DCAT("Dataset"));

            this.generateFields();

            this.refreshStore();
        }

        generateFields() {
            inputMetadata.forEach(catMetadata => {
                var catMetadataView = new CategoryView({ category: new CategoryCore(catMetadata) })
                this.categoryViews.push(catMetadataView);
                dataCol.append(catMetadataView.jQueryContent)
                navCol.append(catMetadataView.navItem);

                catMetadataView.on("add", (statement, source) => {
                    console.log("add " , statement)
                    this.store.add(statement);
                    this.refreshStore();
                });

                catMetadataView.on("remove", (statement, source) => {
                    console.log("remove " , statement)
                    if(this.store.holdsStatement(statement)) {
                        this.store.remove(statement);
                        this.refreshStore();
                    }
                });
            })
        }

        refreshStore() {
            this.categoryViews.forEach(view => {
                this.contentDisplay.val(this.store.toNT());
            })
        }
    }
    new Control();
});
