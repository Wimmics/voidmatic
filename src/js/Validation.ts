import * as $rdf from 'rdflib';
import dayjs from 'dayjs';

export function isLiteral(value) {
    try {
        return value != undefined && value.length > 0 && $rdf.isLiteral($rdf.lit(value));
    } catch (e) {
        return false;
    }
}

export function isURI(value) {
    try {
        return value != undefined && value.length > 0 && $rdf.isNamedNode($rdf.sym(value));
    } catch (e) {
        return false;
    }
}

export function isNotBlank(value) {
    try {
        return isURI(value) || isLiteral(value);
    } catch (e) {
        return false;
    }
}

export function isDatetime(value) {
    try {
        return isLiteral(value) && dayjs(value).isValid();
    } catch (e) {
        return false;
    }
}

export function isDuration(value) {
    try {
        return isLiteral(value) && dayjs(inputVal).isValid() && dayjs.isDuration(dayjs(inputVal));
    } catch (e) {
        return false;
    }
}

export function isInteger(value) {
    try {
        return isLiteral(value) && Number.isInteger(Number.parseInt(value));
    } catch (e) {
        return false;
    }
}

export function isPositiveInteger(value) {
    try {
        return isInteger(value) && (Number.parseInt(value) > 0);
    } catch (e) {
        return false;
    }
}
