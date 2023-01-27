import * as RDFUtils from "./RDFUtils.js";
import { SingleFieldCore, MultipleFieldCore } from './Model.js';
import { controlInstance } from "./Control.js";

const EventEmitter = require('events');
import Autocomplete from "bootstrap5-autocomplete";
Autocomplete.init();
import { v4 as uuid } from 'uuid';
import $ from 'jquery';

export class CategoryView extends EventEmitter {

    constructor(config = { category: null }) {
        super();
        this.categoryCore = config.category;
        this.lines = new Map();

        this.categoryCore.fields.forEach(field => {
            if (this.categoryCore.minArity > 0) {
                for(var nbLine = 0; nbLine < this.categoryCore.minArity; nbLine++) {
                    this.addLine()
                }
            }
        });
        this.categoryId = this.categoryCore.idPrefix + "Category";

        var dataDiv = $(document.createElement('div'));
        dataDiv.addClass("row");
        var catAnchorDiv = $(document.createElement('span'));
        catAnchorDiv.addClass("category-anchor");
        catAnchorDiv.attr("id", this.categoryId);
        var navBarHeight = $("#title-row").height();
        catAnchorDiv.css("height", navBarHeight + "px")
        catAnchorDiv.css("margin-top", "-" + navBarHeight + "px")
        dataDiv.append(catAnchorDiv)
        this.jQueryContent = dataDiv;
        this.generateCategoryFields();
        this.navItem = this.generateNavItem();
    }

    refreshDisplay() {
        RDFUtils.serializeStoreToTurtlePromise(this.displayStore).then(str => {
            this.setDisplay(str);
        })
    }

    setDisplay(content) {
        this.displayContent.text(content);
    }

    addLine() {
        this.categoryCore.fields.forEach(field => {
            if (this.underMaximumNumberOfLine()) {
                var fieldLine = null;
                if (field instanceof SingleFieldCore) {
                    fieldLine = new SingleFieldView({ core: field, parentCategoryView: this });
                } else if (field instanceof MultipleFieldCore) {
                    fieldLine = new MultipleFieldView({ core: field, parentCategoryView: this });
                } else {
                    console.error(field)
                    throw new Error("Unknown line type ")
                }
                this.lines.set(fieldLine.inputId, fieldLine);

                fieldLine.on("add", (statements, source) => {
                    this.emit("add", statements, source);
                });

                fieldLine.on("remove", (statements, source) => {
                    this.emit("remove", statements, source);
                });

                fieldLine.on("suggestion", (statements, source) => {
                    this.emit("suggestion", statements, source);
                });

                fieldLine.on("error", (message, source) => {
                    this.showError(message);
                })
            }
        })
    }

    removeLine(lineId) {
        if (this.aboveMinimumNumberOfLines()) {
            if (this.lines.get(lineId) != undefined && this.lines.get(lineId).getRDFData() != undefined) {
                this.emit("remove", this.lines.get(lineId).getRDFData(), this.lines.get(lineId));
            }
            this.lines.delete(lineId);
        }
        this.refreshLines();
    }

    aboveMinimumNumberOfLines() {
        return this.categoryCore.minArity < this.lines.size
    }

    underMaximumNumberOfLine() {
        return this.lines.size < this.categoryCore.maxArity;
    }

    refresh() {
        this.jQueryContent.empty();
        this.jQueryContent = this.generateCategoryFields();
    }

    generateNavItem() {
        return generateNavItem(this.categoryCore.categoryTitle, this.categoryId);
    }

    generateCategoryFields() {
        var addButtonId = "add" + this.categoryCore.idPrefix + "Button";
        var removeButtonId = "remove" + this.categoryCore.idPrefix + "Button";

        var catCard = $(document.createElement('div'));
        catCard.addClass("card");
        catCard.addClass("mb-4");
        catCard.addClass("border-secondary");
        var catCardBody = $(document.createElement('div'));
        catCardBody.addClass("card-body")
        catCardBody.addClass("col-12")

        var catTitle = $(document.createElement('h3'));
        catTitle.addClass('card-title');
        catTitle.addClass("text-center");
        catTitle.addClass("gx-0");
        catTitle.addClass('display-6');
        catTitle.text(this.categoryCore.categoryTitle);

        var catControlRow = $(document.createElement('div'));
        catControlRow.addClass("row")
        var catLegendCol = $(document.createElement('div'));
        var catLegend = $(document.createElement('p'));
        catLegend.html(this.categoryCore.legend);
        catLegendCol.append(catLegend);
        catControlRow.append(catLegendCol);

        var catAddLineCol = $(document.createElement('div'));
        var catAddLineButton = $(document.createElement('a'));
        catAddLineButton.addClass("btn");
        catAddLineButton.attr("id", addButtonId);
        catAddLineCol.append(catAddLineButton);
        var catAddLineButtonImage = $(document.createElement('i'));
        catAddLineButtonImage.addClass("bi")
        catAddLineButtonImage.addClass("bi-file-plus")
        catAddLineButtonImage.addClass("fs-4");
        catAddLineButton.append(catAddLineButtonImage);
        var offsetCol = $(document.createElement('div'));
        offsetCol.addClass("col-11");
        catAddLineCol.addClass("col-1");
        var catLineControlRow = $(document.createElement('div'));
        catLineControlRow.addClass("row");
        catLineControlRow.append(offsetCol);
        catLineControlRow.append(catAddLineCol);

        var catExtractLineCol = $(document.createElement('div'));
        var lineComputeButton = $(document.createElement('a'));
        lineComputeButton.attr("type", "button");
        lineComputeButton.attr("id", this.inputIdButton)
        lineComputeButton.attr("tabindex", 0);
        lineComputeButton.addClass("btn");
        lineComputeButton.addClass("btn-light");
        lineComputeButton.text("Extract");
        lineComputeButton.attr("title", "Metadatamatic will try to extract the information from the SPARQL endpoint.");
        catExtractLineCol.append(lineComputeButton);
        if (this.categoryCore.computable) {
            catLegendCol.addClass("col-11")
            catExtractLineCol.addClass("col-1")
        } else {
            catLegendCol.addClass("col-12")
        }
        if (this.categoryCore.computable) {
            catControlRow.append(catExtractLineCol);
        }

        var catFieldRow = $(document.createElement('div'));
        catFieldRow.addClass("row")
        var catFieldCol = $(document.createElement('div'));
        catFieldCol.addClass("col-12")
        catFieldRow.append(catFieldCol);

        var catErrorDisplayRow = $(document.createElement('div'));
        catErrorDisplayRow.addClass("row")
        var catErrorDisplayCol = $(document.createElement('div'));
        catErrorDisplayCol.addClass("col");
        var catErrorDisplayP = $(document.createElement('p'));
        catErrorDisplayP.addClass("text-bg-danger");
        catErrorDisplayP.addClass("rounded");
        catErrorDisplayRow.append(catErrorDisplayCol);
        catErrorDisplayCol.append(catErrorDisplayP);

        catErrorDisplayCol.on("click", () => {
            if (catErrorDisplayCol.hasClass("collapse.show")) {
                catErrorDisplayCol.removeClass("collapse.show");
                catErrorDisplayCol.addClass("collapse");
                catErrorDisplayP.text("");
            }
        });
        this.showError = message => {
            console.error(message)
            catErrorDisplayP.text(message);
            catErrorDisplayCol.removeClass("collapse");
            catErrorDisplayCol.addClass("collapse.show");
        }

        // Display field
        this.displayId = this.categoryCore.idPrefix + "Display";
        this.displayPre = $(document.createElement('pre'));
        this.displayPre.addClass("language-turtle");
        this.displayContent = $(document.createElement('code'));
        this.displayContent.prop("id", this.displayId);
        this.displayContent.addClass("language-turtle");
        this.displayContent.attr("title", "Content generated for this category.");
        this.displayPre.append(this.displayContent);
        this.displayStore = RDFUtils.createStore();
        this.on("add", statements => {
            this.displayStore.addAll(statements);
            this.refreshDisplay();
        });
        this.on("remove", statements => {
            statements.forEach(statement => {
                if (this.displayStore.holdsStatement(statement)) {
                    this.displayStore.removeStatement(statement);
                }
            })
            this.refreshDisplay();
        });

        this.jQueryContent.append(catCard);
        catCard.append(catTitle);
        catCard.append(catCardBody);
        catCardBody.append(catControlRow);
        catCardBody.append(catErrorDisplayRow)
        catCardBody.append(catFieldRow);
        catCardBody.append(catLineControlRow);
        catCardBody.append(this.displayPre);

        this.refreshLines = () => {
            catFieldCol.empty();
            this.lines.forEach((field, fieldId) => {
                catFieldCol.append(field.generateJQueryContent());
            });
            if (this.lines.size == this.categoryCore.maxArity) {
                catAddLineButton.addClass("d-none");
            } else {
                catAddLineButton.removeClass("d-none");
            }
        }

        this.refreshLines();

        lineComputeButton.on("click", () => {
            this.categoryCore.fields.forEach(field => {
                if (field.dataExtractionFunction != undefined) {
                    try {
                        var extractedValuesPromise = field.dataExtractionFunction();
                        lineComputeButton.removeClass("btn-light");
                        lineComputeButton.addClass("btn-warning");
                        lineComputeButton.addClass("disabled");
                        extractedValuesPromise.then(extractedValues => {
                            extractedValues.forEach(value => {
                                var statement = field.dataCreationFunction(value);
                                controlInstance.addStatement(statement);
                            })
                            lineComputeButton.removeClass("btn-warning");
                            lineComputeButton.addClass("btn-success");
                            lineComputeButton.removeClass("disabled");
                        })
                            .catch(e => {
                                lineComputeButton.removeClass("btn-warning");
                                lineComputeButton.addClass("btn-danger");
                                lineComputeButton.removeClass("disabled");

                                this.showError(new Error("Could not retrieve the data. Have you tried to force the endpoint url into HTTPS ?"));
                                console.error(e);
                            });
                    } catch (e) {
                        this.showError(new Error("Error during data retrieval: " + e.message));
                        console.error(e);
                    }
                }
            })
        })

        catAddLineButton.on("click", () => {
            this.addLine();
            this.refreshLines();
        });
    }
}

export class FieldView extends EventEmitter {
    constructor(config = { core: null, parentCategoryView: null }) {
        super();
        this.fieldCore = config.core;
        this.parentCategoryView = config.parentCategoryView;
        this.index = uuid();
        this.metadataFieldIdPrefix = this.fieldCore.parentCategory.idPrefix + "Field";
        this.fieldValue = this.fieldCore.defaultValue;
        this.inputId = this.metadataFieldIdPrefix + this.index;
        this.tooltip = null;
    }

    getValue() {
        return this.fieldValue;
    }

    hasValidValue() {
        try {
            return this.fieldCore.dataValidationFunction(this.getValue());
        } catch (e) {
            return false;
        }
    }

    getRDFData() {
        var validated = false;
        try {
            validated = this.dataValidationFunction(this.fieldValue);
        } catch (e) {
            this.emit("error", e, this);
        }
        if (validated) {
            var statements = this.fieldCore.dataCreationFunction(this.fieldValue);
            return statements;
        } else {
            return [];
        }
    }

    dataValidationFunction = (inputVal) => {
        try {
            var result = false;
            try {
                result = this.fieldCore.dataValidationFunction(inputVal);
            } catch (e) {
                this.emit("error", e, this);
            }
            this.setValidationState(result);
            if (result) {
                this.fieldValue = inputVal;
            }
            return result;
        } catch (e) {
            this.emit("error", e, this);
        }
    }

    setValidationState = valid => {
    }

    dataExtractionFunction = () => {
        var result = [];
        try {
            result = this.fieldCore.dataExtractionFunction();
        } catch (e) {
            this.emit("error", e);
        }
        return result;
    }

    validateContent = () => {
        var validated = this.dataValidationFunction(this.fieldValue);
        if (validated) {
            var statements = this.fieldCore.dataCreationFunction(this.fieldValue);
            this.emit("add", statements, this);
            return statements;
        } else {
            this.emit("error", this.fieldCore.advice, this);
        }
    }

    updateContent = newValue => {
        var oldValueValidated = false;
        try {
            oldValueValidated = this.fieldCore.dataValidationFunction(this.fieldValue);
        } catch (e) {
            this.emit("error", e, this);
        }
        if (oldValueValidated) {
            var statement = this.fieldCore.dataCreationFunction(this.fieldValue);
            this.emit("remove", statement, this);
        }
        this.fieldValue = newValue;
        this.validateContent();
    }

    generateJQueryContent = () => {
    }

}

export class SingleFieldView extends FieldView {
    constructor(config = { core: null }) {
        super(config)

        this.inputIdField = this.inputId + "Textfield";
        this.inputIdButton = this.inputId + "Button";
        this.inputIdRemoveButton = this.inputId + "RemoveButton";
    }

    setValidationState = valid => {
        setButtonValidatedState(this.inputIdButton, valid);
        var field = $('#' + this.inputIdField);
        if (valid) {
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
        lineLabel.text(this.fieldCore.placeholder);
        textInput.attr('autocomplete', "off");
        lineLabel.attr('for', this.inputIdField)

        var lineFieldCol = $(document.createElement('div'));
        var lineValidButtonCol = $(document.createElement('div'));
        lineFieldCol.addClass('col-10');
        lineValidButtonCol.addClass('col-1');
        var lineValidButton = $(document.createElement('a'));
        lineValidButton.attr("type", "button");
        lineValidButton.attr("id", this.inputIdButton)
        lineValidButton.attr("tabindex", 0);
        lineValidButton.addClass("btn");
        lineValidButton.addClass("btn-light");
        lineValidButton.addClass("text-truncate");
        lineValidButton.text("Validate");
        lineValidButton.attr("title", this.fieldCore.placeholder);
        lineValidButtonCol.append(lineValidButton);
        var lineRemoveButtonCol = $(document.createElement('div'));
        lineRemoveButtonCol.addClass('col-1');
        var lineRemoveButton = $(document.createElement('a'));
        lineRemoveButton.addClass("btn");
        lineRemoveButton.addClass("text-truncate");
        lineRemoveButton.attr("id", this.inputIdRemoveButton)
        lineRemoveButton.attr("tabindex", 0);
        var lineRemoveLineButtonImage = $(document.createElement('i'));
        lineRemoveLineButtonImage.addClass("bi")
        lineRemoveLineButtonImage.addClass("bi-file-minus")
        lineRemoveLineButtonImage.addClass("fs-4");
        lineRemoveButton.append(lineRemoveLineButtonImage);
        lineRemoveButtonCol.append(lineRemoveButton);
        if (this.parentCategoryView.lines.size == this.parentCategoryView.categoryCore.minArity) {
            lineRemoveButton.addClass("d-none");
        } else {
            lineRemoveButton.removeClass("d-none");
        }

        lineDiv.addClass('row');
        lineDiv.append(lineFieldCol);
        lineDiv.append(lineValidButtonCol);
        lineDiv.append(lineRemoveButtonCol);
        lineFieldCol.addClass('form-floating');
        lineFieldCol.append(textInput);
        lineFieldCol.append(lineLabel);

        if (this.fieldCore.dataSuggestionFunction != undefined) {
            var items = this.fieldCore.dataSuggestionFunction();
            new Autocomplete(textInput.get(0), {
                items: items,
                labelField: "label",
                valueField: "value",
                fullWidth: true,
                suggestionsThreshold: 1,
                onRenderItem: (item, label) => {
                    return label + ' (' + item.value + ')';
                },
                onSelectItem(item) {
                    textInput.val(item.value);
                }
            });
        }

        textInput.on("focusin", event => {
            lineLabel.addClass("visually-hidden");
        })

        textInput.on("focusout", event => {
            lineLabel.removeClass("visually-hidden");
        })

        textInput.on("change", () => {
            this.updateContent(textInput.val());
        })

        lineValidButton.on("click", () => {
            this.updateContent(textInput.val());
        });

        lineRemoveButton.on("click", () => {
            this.parentCategoryView.removeLine(this.inputId);
        });

        return lineDiv;
    }
}

export class MultipleFieldView extends FieldView {
    constructor(config = { core: null }) {
        super(config)

        this.numberOfFields = config.core.bootstrapFieldColWidth.length;
        this.bootstrapFieldColWidth = config.core.bootstrapFieldColWidth;
        this.fieldValue = this.fieldCore.defaultValue;

        this.inputIdFields = [];
        for (var i = 0; i < this.numberOfFields; i++) {
            this.inputIdFields.push(this.inputId + "Field" + i);
        }
        this.inputIdButton = this.inputId + "Button";

    }

    setValidationState = valid => {
        setButtonValidatedState(this.inputIdButton, valid);
        this.inputIdFields.forEach(id => {
            var field = $('#' + id);
            if (valid) {
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
        lineValidButton.attr("title", this.fieldCore.placeholder[0]);
        lineValidButtonCol.append(lineValidButton);
        var lineRemoveButtonCol = $(document.createElement('div'));
        lineRemoveButtonCol.addClass('col-1');
        var lineRemoveButton = $(document.createElement('a'));
        lineRemoveButton.addClass("btn");
        lineRemoveButton.addClass("text-truncate");
        lineRemoveButton.attr("id", this.inputIdRemoveButton)
        lineRemoveButton.attr("tabindex", 0);
        var lineRemoveLineButtonImage = $(document.createElement('i'));
        lineRemoveLineButtonImage.addClass("bi")
        lineRemoveLineButtonImage.addClass("bi-file-minus")
        lineRemoveLineButtonImage.addClass("fs-4");
        lineRemoveButton.append(lineRemoveLineButtonImage);
        lineRemoveButtonCol.append(lineRemoveButton);
        if (this.parentCategoryView.lines.size == this.parentCategoryView.categoryCore.minArity) {
            lineRemoveButton.addClass("d-none");
        } else {
            lineRemoveButton.removeClass("d-none");
        }

        var fields = [];

        for (var i = 0; i < this.numberOfFields; i++) {
            var lineFieldCol = $(document.createElement('div'));
            lineFieldCol.addClass('col-' + this.bootstrapFieldColWidth[i]);

            var textInput = $(document.createElement('input'))
            var lineLabel = $(document.createElement('label'));
            var textInputId = this.inputIdFields[i];
            var lineLabelId = textInputId + "Label";
            textInput.attr('type', 'text');
            textInput.addClass('form-control');
            textInput.attr('id', textInputId);
            textInput.val(this.fieldValue[i]);
            textInput.attr("autocomplete", "off");
            lineLabel.attr('for', textInputId)
            lineLabel.text(this.fieldCore.placeholder[i]);
            lineLabel.attr('id', lineLabelId);

            fields.push(textInput);

            lineFieldCol.addClass('form-floating');
            lineFieldCol.append(textInput);
            lineFieldCol.append(lineLabel);

            lineDiv.append(lineFieldCol);

            if (this.fieldCore.dataSuggestionFunction != undefined) {
                var items = this.fieldCore.dataSuggestionFunction()[i];
                if (items.length > 0) {
                    new Autocomplete(textInput.get(0), {
                        items: items,
                        labelField: "label",
                        valueField: "value",
                        fullWidth: true,
                        suggestionsThreshold: 1,
                        onRenderItem: (item, label) => {
                            return label + ' (' + item.value + ')';
                        },
                        onSelectItem(item) {
                            textInput.val(item.value);
                        }
                    });
                }
            }

            textInput.on("change", () => {
                this.updateContent(fields.map(field => field.val()));
            })

            textInput.on("focusin", event => {
                var targetLabelId = $(event.target).attr("id") + "Label";
                $("#" + targetLabelId).addClass("visually-hidden");
            })

            textInput.on("focusout", event => {
                var targetLabelId = $(event.target).attr("id") + "Label";
                $("#" + targetLabelId).removeClass("visually-hidden");
            })
        }

        lineDiv.addClass('row');
        lineDiv.append(lineValidButtonCol);
        lineDiv.append(lineRemoveButtonCol);

        lineValidButton.on("click", () => {
            this.updateContent(fields.map(field => field.val()));
        });

        lineRemoveButton.on("click", () => {
            this.parentCategoryView.removeLine(this.inputId);
        });

        return lineDiv;
    }
}

export function setButtonValidatedState(inputId, validated, message) {
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

export function generateNavItem(text, id) {
    var navItem = $(document.createElement("div"));
    var navLink = $(document.createElement("a"));
    navLink.addClass('navbar-link');
    navLink.addClass('btn');
    navLink.text(text);
    navLink.attr("href", "#" + id);
    navItem.addClass('navbar-item')
    navItem.append(navLink)
    return navItem;
}