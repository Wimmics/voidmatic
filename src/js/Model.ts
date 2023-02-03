import { Statement } from "rdflib";


export class FieldState {
    state: "Valid" | "Invalid" | "None";
    message: string;

    constructor(state: "Valid" | "Invalid" | "None", message: string) {
        this.state = state;
        this.message = message;
    }

    static valid() {
        return new FieldState("Valid", "");
    }

    static invalid(message: string) {
        return new FieldState("Invalid", message);
    }

    static none() {
        return new FieldState("None", "");
    }

    static isValid(fieldState: FieldState) {
        return fieldState.state.localeCompare("Valid") == 0;
    }

    static isInvalid(fieldState: FieldState) {
        return fieldState.state.localeCompare("Invalid") == 0;
    }

    static isNone(fieldState: FieldState) {
        return fieldState.state.localeCompare("None") == 0;
    }
}

export interface CoreElement {

}

export class CategoryCore implements CoreElement {

    recommended: boolean;
    categoryTitle: string;
    legend: string;
    idPrefix: string;
    minArity: number;
    maxArity: number;
    computable: boolean;
    fields: FieldCore[];

    constructor(config = { recommended: false, categoryTitle: "", legend: "", idPrefix: "id", minArity: 0, maxArity: Infinity, computable: false, fields: [] }) {
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

export interface FieldConfig {
    placeholder: string;
    dataValidationFunction: (inputVal: string[]) => FieldState;
    dataCreationFunction: (inputVal: string[]) => Statement[];
    dataExtractionFunction: () => string[];
    dataSuggestionFunction: () => string[];
    parentCategory: CategoryCore | null;
    defaultValue: any;
    advice: string;
    bootstrapFieldColWidth?: number[];
}

export class FieldCore implements CoreElement {

    placeholder: string;
    dataValidationFunction: (inputVal: string[]) => FieldState;
    dataCreationFunction: (inputVal: string[]) => Statement[];
    dataExtractionFunction: () => string[];
    dataSuggestionFunction: () => string[];
    parentCategory: CategoryCore | null;
    defaultValue: string[];
    advice: string;
    bootstrapFieldColWidth: number[] | undefined;

    constructor(config: FieldConfig) {
        this.placeholder = config.placeholder;
        this.dataValidationFunction = (inputVal: string[]) : FieldState => {
            var result = FieldState.none() ;
            try {
                result = config.dataValidationFunction(inputVal);
            } catch (e) {
                throw e;
            }
            return result;
        };
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
        if(config.bootstrapFieldColWidth != undefined) {
            this.bootstrapFieldColWidth = config.bootstrapFieldColWidth;
        } else {
            config.bootstrapFieldColWidth = [12];
        }
    }
}