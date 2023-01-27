

export class CategoryCore {
    constructor(config = { recommended: false, categoryTitle: "", legend: "", idPrefix: "id", minArity: 0, maxArity: Infinity, fields: [] }) {
        this.recommended = config.recommended;
        this.categoryTitle = config.categoryTitle;
        this.legend = config.legend;
        this.idPrefix = config.idPrefix;
        this.minArity = config.minArity;
        this.maxArity = config.maxArity;
        this.computable = config.computable;
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

export class FieldCore {
    constructor(config = { placeholder: "", dataValidationFunction: (inputVal) => { }, dataCreationFunction: (inputVal) => [], dataExtractionFunction: () => { }, dataSuggestionFunction: () => [], parentCategory: null, defaultValue: null, advice: "" }) {
        this.placeholder = config.placeholder;
        this.dataValidationFunction = (inputVal) => {
            var result = false;
            try {
                result = config.dataValidationFunction(inputVal);
            } catch (e) {
                throw e;
            }
            return result;
        }
        this.dataCreationFunction = (inputVal) => {
            if (this.dataValidationFunction(inputVal)) {
                return config.dataCreationFunction(inputVal);
            }
        };
        if (config.dataExtractionFunction != undefined) {
            this.dataExtractionFunction = () => {
                try {
                    return config.dataExtractionFunction();
                } catch (e) {
                    throw e;
                }
            }
        }
        if (config.dataSuggestionFunction != undefined) {
            this.dataSuggestionFunction = () => {
                try {
                    return config.dataSuggestionFunction();
                } catch (e) {
                    throw e;
                }
            }
        }
        this.parentCategory = config.parentCategory;
        this.defaultValue = config.defaultValue;
        this.advice = config.advice;
    }
}

export class SingleFieldCore extends FieldCore {

}

export class MultipleFieldCore extends FieldCore {
    constructor(config = { placeholder: [], bootstrapFieldColWidth: [11, 1], dataValidationFunction: (inputValArray) => { }, dataCreationFunction: (inputValArray) => { }, dataExtractionFunction: () => { }, parentCategory: null, defaultValue: [] }) {
        super(config);
        this.bootstrapFieldColWidth = config.bootstrapFieldColWidth;
    }

}