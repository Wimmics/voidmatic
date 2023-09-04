function e(e,t,n,r){Object.defineProperty(e,t,{get:n,set:r,enumerable:!0,configurable:!0})}var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},n=t.parcelRequire688c;n.register("5MOo6",function(e,t){/**
 * A JavaScript implementation of the JSON-LD API.
 *
 * @author Dave Longley
 *
 * @license BSD 3-Clause License
 * Copyright (c) 2011-2022 Digital Bazaar, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * Neither the name of the Digital Bazaar, Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */var r=n("h0LIu"),a=n("6a1Di"),i=n("85rA0"),o=n("iZefq");let l=i.IdentifierIssuer;var s=n("3Yszg"),d=n("bnToR"),c=n("fl0q4"),u=n("a4Pom").expand,p=n("98lVF").flatten,h=n("1Wow0").fromRDF,f=n("klPaf").toRDF,v=n("fm7xk"),g=v.frameMergedOrDefault,y=v.cleanupNull,m=n("guzPY"),x=m.isArray,b=m.isObject,w=m.isString,j=n("dEapz").isSubjectReference,I=n("frGHZ").expandIri,N=n("frGHZ").getInitialContext,S=n("frGHZ").process,E=n("frGHZ").processingMode,O=n("gNObS"),k=O.compact,D=O.compactIri,C=n("8xjSk"),L=C.createNodeMap,R=C.createMergedNodeMap,A=C.mergeNodeMaps,T=n("8qp2g"),_=T.logEventHandler,P=T.logWarningEventHandler,M=T.safeEventHandler,J=T.setDefaultEventHandler,H=T.setupEventHandler,B=T.strictEventHandler,q=T.unhandledEventHandler;/* eslint-disable indent */// attaches jsonld API to the given object
let F=function(e){/** Registered RDF dataset parsers hashed by content-type. */let t={},v=new d({max:100});function m(t,{documentLoader:n=e.documentLoader,...r}){// fail if obsolete options present
if(t&&"compactionMap"in t)throw new s('"compactionMap" not supported.',"jsonld.OptionsError");if(t&&"expansionMap"in t)throw new s('"expansionMap" not supported.',"jsonld.OptionsError");return Object.assign({},{documentLoader:n},r,t,{eventHandler:H({options:t})})}// end of jsonld API `wrapper` factory
return(/* Core API *//**
 * Performs JSON-LD compaction.
 *
 * @param input the JSON-LD input to compact.
 * @param ctx the context to compact with.
 * @param [options] options to use:
 *          [base] the base IRI to use.
 *          [compactArrays] true to compact arrays to single values when
 *            appropriate, false not to (default: true).
 *          [compactToRelative] true to compact IRIs to be relative to document
 *            base, false to keep absolute (default: true)
 *          [graph] true to always output a top-level graph (default: false).
 *          [expandContext] a context to expand with.
 *          [skipExpansion] true to assume the input is expanded and skip
 *            expansion, false not to, defaults to false.
 *          [documentLoader(url, options)] the document loader.
 *          [framing] true if compaction is occuring during a framing operation.
 *          [safe] true to use safe mode. (default: false)
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the compacted output.
 */e.compact=async function(t,n,r){let a;if(arguments.length<2)throw TypeError("Could not compact, too few arguments.");if(null===n)throw new s("The compaction context must not be null.","jsonld.CompactError",{code:"invalid local context"});// nothing to compact
if(null===t)return null;// set default options
(r=m(r,{base:w(t)?t:"",compactArrays:!0,compactToRelative:!0,graph:!1,skipExpansion:!1,link:!1,issuer:new l("_:b"),contextResolver:new o({sharedCache:v})})).link&&// API, it should only be called from framing
(r.skipExpansion=!0),r.compactToRelative||delete r.base,a=r.skipExpansion?t:await e.expand(t,r);// process context
let d=await e.processContext(N(r),n,r),c=await k({activeCtx:d,element:a,options:r});r.compactArrays&&!r.graph&&x(c)?1===c.length?c=c[0]:0===c.length&&(c={}):r.graph&&b(c)&&(c=[c]),b(n)&&"@context"in n&&(n=n["@context"]),x(// build output context
n=i.clone(n))||(n=[n]);// remove empty contexts
let u=n;n=[];for(let e=0;e<u.length;++e)(!b(u[e])||Object.keys(u[e]).length>0)&&n.push(u[e]);// remove array if only one context
let p=n.length>0;// add context and/or @graph
if(1===n.length&&(n=n[0]),x(c)){// use '@graph' keyword
let e=D({activeCtx:d,iri:"@graph",relativeTo:{vocab:!0}}),t=c;c={},p&&(c["@context"]=n),c[e]=t}else if(b(c)&&p){// reorder keys so @context is first
let e=c;for(let t in c={"@context":n},e)c[t]=e[t]}return c},/**
 * Performs JSON-LD expansion.
 *
 * @param input the JSON-LD input to expand.
 * @param [options] the options to use:
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [keepFreeFloatingNodes] true to keep free-floating nodes,
 *            false not to, defaults to false.
 *          [documentLoader(url, options)] the document loader.
 *          [safe] true to use safe mode. (default: false)
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the expanded output.
 */e.expand=async function(t,n){let r;if(arguments.length<1)throw TypeError("Could not expand, too few arguments.");// set default options
n=m(n,{keepFreeFloatingNodes:!1,contextResolver:new o({sharedCache:v})});// build set of objects that may have @contexts to resolve
let a={},l=[];// if an `expandContext` has been given ensure it gets resolved
if("expandContext"in n){let e=i.clone(n.expandContext);b(e)&&"@context"in e?a.expandContext=e:a.expandContext={"@context":e},l.push(a.expandContext)}if(w(t)){// load remote doc
let i=await e.get(t,n);r=i.documentUrl,a.input=i.document,i.contextUrl&&(// context included in HTTP link header and must be resolved
a.remoteContext={"@context":i.contextUrl},l.push(a.remoteContext))}else a.input=i.clone(t);"base"in n||(n.base=r||"");// process any additional contexts
let s=N(n);for(let e of l)s=await S({activeCtx:s,localCtx:e,options:n});// expand resolved input
let d=await u({activeCtx:s,element:a.input,options:n});return b(d)&&"@graph"in d&&1===Object.keys(d).length?d=d["@graph"]:null===d&&(d=[]),x(d)||(d=[d]),d},/**
 * Performs JSON-LD flattening.
 *
 * @param input the JSON-LD to flatten.
 * @param ctx the context to use to compact the flattened output, or null.
 * @param [options] the options to use:
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [documentLoader(url, options)] the document loader.
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the flattened output.
 */e.flatten=async function(t,n,r){if(arguments.length<1)return TypeError("Could not flatten, too few arguments.");n="function"==typeof n?null:n||null,// set default options
r=m(r,{base:w(t)?t:"",contextResolver:new o({sharedCache:v})});// expand input
let a=await e.expand(t,r),i=p(a);if(null===n)return i;// compact result (force @graph option to true, skip expansion)
r.graph=!0,r.skipExpansion=!0;let l=await e.compact(i,n,r);return l},/**
 * Performs JSON-LD framing.
 *
 * @param input the JSON-LD input to frame.
 * @param frame the JSON-LD frame to use.
 * @param [options] the framing options.
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [embed] default @embed flag: '@last', '@always', '@never', '@link'
 *            (default: '@last').
 *          [explicit] default @explicit flag (default: false).
 *          [requireAll] default @requireAll flag (default: true).
 *          [omitDefault] default @omitDefault flag (default: false).
 *          [documentLoader(url, options)] the document loader.
 *          [safe] true to use safe mode. (default: false)
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the framed output.
 */e.frame=async function(t,n,r){if(arguments.length<2)throw TypeError("Could not frame, too few arguments.");// if frame is a string, attempt to dereference remote document
if(// set default options
r=m(r,{base:w(t)?t:"",embed:"@once",explicit:!1,requireAll:!1,omitDefault:!1,bnodesToClear:[],contextResolver:new o({sharedCache:v})}),w(n)){// load remote doc
let t=await e.get(n,r);if(n=t.document,t.contextUrl){// inject link header @context into frame
let e=n["@context"];e?x(e)?e.push(t.contextUrl):e=[e,t.contextUrl]:e=t.contextUrl,n["@context"]=e}}let a=n&&n["@context"]||{},i=await e.processContext(N(r),a,r);r.hasOwnProperty("omitGraph")||(r.omitGraph=E(i,1.1)),r.hasOwnProperty("pruneBlankNodeIdentifiers")||(r.pruneBlankNodeIdentifiers=E(i,1.1));// expand input
let l=await e.expand(t,r),s={...r};s.isFrame=!0,s.keepFreeFloatingNodes=!0;let d=await e.expand(n,s),c=Object.keys(n).map(e=>I(i,e,{vocab:!0}));s.merged=!c.includes("@graph"),s.is11=E(i,1.1);// do framing
let u=g(l,d,s);s.graph=!r.omitGraph,s.skipExpansion=!0,s.link={},s.framing=!0;let p=await e.compact(u,a,s);return(// replace @null with null, compacting arrays
s.link={},p=y(p,s))},/**
 * **Experimental**
 *
 * Links a JSON-LD document's nodes in memory.
 *
 * @param input the JSON-LD document to link.
 * @param [ctx] the JSON-LD context to apply.
 * @param [options] the options to use:
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [documentLoader(url, options)] the document loader.
 *          [safe] true to use safe mode. (default: false)
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the linked output.
 */e.link=async function(t,n,r){// API matches running frame with a wildcard frame and embed: '@link'
// get arguments
let a={};return n&&(a["@context"]=n),a["@embed"]="@link",e.frame(t,a,r)},/**
 * Performs RDF dataset normalization on the given input. The input is JSON-LD
 * unless the 'inputFormat' option is used. The output is an RDF dataset
 * unless the 'format' option is used.
 *
 * Note: Canonicalization sets `safe` to `true` and `base` to `null` by
 * default in order to produce safe outputs and "fail closed" by default. This
 * is different from the other API transformations in this version which
 * allow unsafe defaults (for cryptographic usage) in order to comply with the
 * JSON-LD 1.1 specification.
 *
 * @param input the input to normalize as JSON-LD or as a format specified by
 *          the 'inputFormat' option.
 * @param [options] the options to use:
 *          [algorithm] the normalization algorithm to use, `URDNA2015` or
 *            `URGNA2012` (default: `URDNA2015`).
 *          [base] the base IRI to use (default: `null`).
 *          [expandContext] a context to expand with.
 *          [skipExpansion] true to assume the input is expanded and skip
 *            expansion, false not to, defaults to false.
 *          [inputFormat] the format if input is not JSON-LD:
 *            'application/n-quads' for N-Quads.
 *          [format] the format if output is a string:
 *            'application/n-quads' for N-Quads.
 *          [documentLoader(url, options)] the document loader.
 *          [useNative] true to use a native canonize algorithm
 *          [safe] true to use safe mode. (default: true).
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the normalized output.
 */e.normalize=e.canonize=async function(t,n){if(arguments.length<1)throw TypeError("Could not canonize, too few arguments.");if("inputFormat"in// set default options
(n=m(n,{base:w(t)?t:null,algorithm:"URDNA2015",skipExpansion:!1,safe:!0,contextResolver:new o({sharedCache:v})}))){if("application/n-quads"!==n.inputFormat&&"application/nquads"!==n.inputFormat)throw new s("Unknown canonicalization input format.","jsonld.CanonizeError");// TODO: `await` for async parsers
let e=c.parse(t);// do canonicalization
return r.canonize(e,n)}// convert to RDF dataset then do normalization
let a={...n};delete a.format,a.produceGeneralizedRdf=!1;let i=await e.toRDF(t,a);// do canonicalization
return r.canonize(i,n)},/**
 * Converts an RDF dataset to JSON-LD.
 *
 * @param dataset a serialized string of RDF in a format specified by the
 *          format option or an RDF dataset to convert.
 * @param [options] the options to use:
 *          [format] the format if dataset param must first be parsed:
 *            'application/n-quads' for N-Quads (default).
 *          [rdfParser] a custom RDF-parser to use to parse the dataset.
 *          [useRdfType] true to use rdf:type, false to use @type
 *            (default: false).
 *          [useNativeTypes] true to convert XSD types into native types
 *            (boolean, integer, double), false not to (default: false).
 *          [rdfDirection] 'i18n-datatype' to support RDF transformation of
 *             @direction (default: null).
 *          [safe] true to use safe mode. (default: false)
 *
 * @return a Promise that resolves to the JSON-LD document.
 */e.fromRDF=async function(e,n){if(arguments.length<1)throw TypeError("Could not convert from RDF, too few arguments.");// set default options
n=m(n,{format:w(e)?"application/n-quads":void 0});let{format:r}=n,{rdfParser:a}=n;// handle special format
if(r){if(!// check supported formats
(a=a||t[r]))throw new s("Unknown input format.","jsonld.UnknownFormat",{format:r})}else a=()=>e;// rdfParser must be synchronous or return a promise, no callback support
let i=await a(e);return h(i,n)},/**
 * Outputs the RDF dataset found in the given JSON-LD object.
 *
 * @param input the JSON-LD input.
 * @param [options] the options to use:
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [skipExpansion] true to assume the input is expanded and skip
 *            expansion, false not to, defaults to false.
 *          [format] the format to use to output a string:
 *            'application/n-quads' for N-Quads.
 *          [produceGeneralizedRdf] true to output generalized RDF, false
 *            to produce only standard RDF (default: false).
 *          [documentLoader(url, options)] the document loader.
 *          [safe] true to use safe mode. (default: false)
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the RDF dataset.
 */e.toRDF=async function(t,n){let r;if(arguments.length<1)throw TypeError("Could not convert to RDF, too few arguments.");r=// set default options
(n=m(n,{base:w(t)?t:"",skipExpansion:!1,contextResolver:new o({sharedCache:v})})).skipExpansion?t:await e.expand(t,n);// output RDF dataset
let a=f(r,n);if(n.format){if("application/n-quads"===n.format||"application/nquads"===n.format)return c.serialize(a);throw new s("Unknown output format.","jsonld.UnknownFormat",{format:n.format})}return a},/**
 * **Experimental**
 *
 * Recursively flattens the nodes in the given JSON-LD input into a merged
 * map of node ID => node. All graphs will be merged into the default graph.
 *
 * @param input the JSON-LD input.
 * @param [options] the options to use:
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [issuer] a jsonld.IdentifierIssuer to use to label blank nodes.
 *          [documentLoader(url, options)] the document loader.
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the merged node map.
 */e.createNodeMap=async function(t,n){if(arguments.length<1)throw TypeError("Could not create node map, too few arguments.");// set default options
n=m(n,{base:w(t)?t:"",contextResolver:new o({sharedCache:v})});// expand input
let r=await e.expand(t,n);return R(r,n)},/**
 * **Experimental**
 *
 * Merges two or more JSON-LD documents into a single flattened document.
 *
 * @param docs the JSON-LD documents to merge together.
 * @param ctx the context to use to compact the merged result, or null.
 * @param [options] the options to use:
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [issuer] a jsonld.IdentifierIssuer to use to label blank nodes.
 *          [mergeNodes] true to merge properties for nodes with the same ID,
 *            false to ignore new properties for nodes with the same ID once
 *            the ID has been defined; note that this may not prevent merging
 *            new properties where a node is in the `object` position
 *            (default: true).
 *          [documentLoader(url, options)] the document loader.
 *          [safe] true to use safe mode. (default: false)
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the merged output.
 */e.merge=async function(t,n,r){if(arguments.length<1)throw TypeError("Could not merge, too few arguments.");if(!x(t))throw TypeError('Could not merge, "docs" must be an array.');n="function"==typeof n?null:n||null,// set default options
r=m(r,{contextResolver:new o({sharedCache:v})});// expand all documents
let a=await Promise.all(t.map(t=>{let n={...r};return e.expand(t,n)})),s=!0;"mergeNodes"in r&&(s=r.mergeNodes);let d=r.issuer||new l("_:b"),c={"@default":{}};for(let e=0;e<a.length;++e){// uniquely relabel blank nodes
let t=i.relabelBlankNodes(a[e],{issuer:new l("_:b"+e+"-")}),n=s||0===e?c:{"@default":{}};if(L(t,n,"@default",d),n!==c)for(let e in n){let t=n[e];if(!(e in c)){c[e]=t;continue}let r=c[e];for(let e in t)e in r||(r[e]=t[e])}}// add all non-default graphs to default graph
let u=A(c),p=[],h=Object.keys(u).sort();for(let e=0;e<h.length;++e){let t=u[h[e]];j(t)||p.push(t)}if(null===n)return p;// compact result (force @graph option to true, skip expansion)
r.graph=!0,r.skipExpansion=!0;let f=await e.compact(p,n,r);return f},/**
 * The default document loader for external documents.
 *
 * @param url the URL to load.
 *
 * @return a promise that resolves to the remote document.
 */Object.defineProperty(e,"documentLoader",{get:()=>e._documentLoader,set:t=>e._documentLoader=t}),// default document loader not implemented
e.documentLoader=async e=>{throw new s("Could not retrieve a JSON-LD document from the URL. URL dereferencing not implemented.","jsonld.LoadDocumentError",{code:"loading document failed",url:e})},/**
 * Gets a remote JSON-LD document using the default document loader or
 * one given in the passed options.
 *
 * @param url the URL to fetch.
 * @param [options] the options to use:
 *          [documentLoader] the document loader to use.
 *
 * @return a Promise that resolves to the retrieved remote document.
 */e.get=async function(t,n){let r;r="function"==typeof n.documentLoader?n.documentLoader:e.documentLoader;let a=await r(t);try{if(!a.document)throw new s("No remote document found at the given URL.","jsonld.NullRemoteDocument");w(a.document)&&(a.document=JSON.parse(a.document))}catch(e){throw new s("Could not retrieve a JSON-LD document from the URL.","jsonld.LoadDocumentError",{code:"loading document failed",cause:e,remoteDoc:a})}return a},/**
 * Processes a local context, resolving any URLs as necessary, and returns a
 * new active context.
 *
 * @param activeCtx the current active context.
 * @param localCtx the local context to process.
 * @param [options] the options to use:
 *          [documentLoader(url, options)] the document loader.
 *          [safe] true to use safe mode. (default: false)
 *          [contextResolver] internal use only.
 *
 * @return a Promise that resolves to the new active context.
 */e.processContext=async function(e,t,n){return(// return initial context early for null context
(// set default options
n=m(n,{base:"",contextResolver:new o({sharedCache:v})}),null===t)?N(n):(b(// get URLs in localCtx
t=i.clone(t))&&"@context"in t||(t={"@context":t}),S({activeCtx:e,localCtx:t,options:n})))},// backwards compatibility
e.getContextValue=n("frGHZ").getContextValue,/**
 * Document loaders.
 */e.documentLoaders={},/**
 * Assigns the default document loader for external document URLs to a built-in
 * default. Supported types currently include: 'xhr' and 'node'.
 *
 * @param type the type to set.
 * @param [params] the parameters required to use the document loader.
 */e.useDocumentLoader=function(t){if(!(t in e.documentLoaders))throw new s('Unknown document loader type: "'+t+'"',"jsonld.UnknownDocumentLoader",{type:t});// set document loader
e.documentLoader=e.documentLoaders[t].apply(e,Array.prototype.slice.call(arguments,1))},/**
 * Registers an RDF dataset parser by content-type, for use with
 * jsonld.fromRDF. An RDF dataset parser will always be given one parameter,
 * a string of input. An RDF dataset parser can be synchronous or
 * asynchronous (by returning a promise).
 *
 * @param contentType the content-type for the parser.
 * @param parser(input) the parser function (takes a string as a parameter
 *          and either returns an RDF dataset or a Promise that resolves to one.
 */e.registerRDFParser=function(e,n){t[e]=n},/**
 * Unregisters an RDF dataset parser by content-type.
 *
 * @param contentType the content-type for the parser.
 */e.unregisterRDFParser=function(e){delete t[e]},// register the N-Quads RDF parser
e.registerRDFParser("application/n-quads",c.parse),e.registerRDFParser("application/nquads",c.parse),/* URL API */e.url=n("c0VXR"),/* Events API and handlers */e.logEventHandler=_,e.logWarningEventHandler=P,e.safeEventHandler=M,e.setDefaultEventHandler=J,e.strictEventHandler=B,e.unhandledEventHandler=q,/* Utility API */e.util=i,// backwards compatibility
Object.assign(e,i),// reexpose API as jsonld.promises for backwards compatability
e.promises=e,// backwards compatibility
e.RequestQueue=n("jUcZG"),/* WebIDL API */e.JsonLdProcessor=n("eds65")(e),a.setupGlobals(e),a.setupDocumentLoaders(e),e)},z=function(){return F(function(){return z()})};// wrap the main jsonld API instance
F(z),// export API
e.exports=z}),n.register("h0LIu",function(e,t){/**
 * An implementation of the RDF Dataset Normalization specification.
 *
 * @author Dave Longley
 *
 * Copyright 2010-2021 Digital Bazaar, Inc.
 */e.exports=n("7fpTx")}),n.register("7fpTx",function(t,r){let a;e(t.exports,"NQuads",()=>i,e=>i=e),e(t.exports,"IdentifierIssuer",()=>o,e=>o=e),e(t.exports,"_rdfCanonizeNative",()=>l,e=>l=e),e(t.exports,"canonize",()=>s,e=>s=e),e(t.exports,"_canonizeSync",()=>d,e=>d=e);var i,o,l,s,d,c=n("dVoAc"),u=n("iA9G8"),p=n("5mJZl"),h=n("1phhp");try{a=n("kjyEk")}catch(e){}// return a dataset from input dataset or legacy dataset
function f(e/*, options*/){return(// back-compat with legacy dataset
Array.isArray(e)?e:i.legacyDatasetToQuads(e))}i=n("73eeT"),o=n("dvul9"),l=function(e){return e&&(a=e),a},s=async function(e,t){let n=f(e,t);if(t.useNative){if(!a)throw Error("rdf-canonize-native not available");if(t.createMessageDigest)throw Error('"createMessageDigest" cannot be used with "useNative".');return new Promise((e,r)=>a.canonize(n,t,(t,n)=>t?r(t):e(n)))}if("URDNA2015"===t.algorithm)return new c(t).main(n);if("URGNA2012"===t.algorithm){if(t.createMessageDigest)throw Error('"createMessageDigest" cannot be used with "URGNA2012".');return new u(t).main(n)}if(!("algorithm"in t))throw Error("No RDF Dataset Canonicalization algorithm specified.");throw Error("Invalid RDF Dataset Canonicalization algorithm: "+t.algorithm)},d=function(e,t){let n=f(e,t);if(t.useNative){if(!a)throw Error("rdf-canonize-native not available");if(t.createMessageDigest)throw Error('"createMessageDigest" cannot be used with "useNative".');return a.canonizeSync(n,t)}if("URDNA2015"===t.algorithm)return new p(t).main(n);if("URGNA2012"===t.algorithm){if(t.createMessageDigest)throw Error('"createMessageDigest" cannot be used with "URGNA2012".');return new h(t).main(n)}if(!("algorithm"in t))throw Error("No RDF Dataset Canonicalization algorithm specified.");throw Error("Invalid RDF Dataset Canonicalization algorithm: "+t.algorithm)}}),n.register("dVoAc",function(e,t){var r=n("dvul9"),a=n("jnHNj"),i=n("9NKOE"),o=n("73eeT");function l(e,t){return e.hash<t.hash?-1:e.hash>t.hash?1:0}e.exports=class{constructor({createMessageDigest:e=()=>new a("sha256"),canonicalIdMap:t=new Map,maxDeepIterations:n=1/0}={}){this.name="URDNA2015",this.blankNodeInfo=new Map,this.canonicalIssuer=new r("_:c14n",t),this.createMessageDigest=e,this.maxDeepIterations=n,this.quads=null,this.deepIterations=null}// 4.4) Normalization Algorithm
async main(e){// 1) Create the normalization state.
// 2) For every quad in input dataset:
for(let t of(this.deepIterations=new Map,this.quads=e,e))// 2.1) For each blank node that occurs in the quad, add a reference
// to the quad using the blank node identifier in the blank node to
// quads map, creating a new entry if necessary.
this._addBlankNodeQuadInfo({quad:t,component:t.subject}),this._addBlankNodeQuadInfo({quad:t,component:t.object}),this._addBlankNodeQuadInfo({quad:t,component:t.graph});// 3) Create a list of non-normalized blank node identifiers
// non-normalized identifiers and populate it using the keys from the
// blank node to quads map.
// Note: We use a map here and it was generated during step 2.
// 4) `simple` flag is skipped -- loop is optimized away. This optimization
// is permitted because there was a typo in the hash first degree quads
// algorithm in the URDNA2015 spec that was implemented widely making it
// such that it could not be fixed; the result was that the loop only
// needs to be run once and the first degree quad hashes will never change.
// 5.1-5.2 are skipped; first degree quad hashes are generated just once
// for all non-normalized blank nodes.
// 5.3) For each blank node identifier identifier in non-normalized
// identifiers:
let t=new Map,n=[...this.blankNodeInfo.keys()],a=0;for(let e of n)++a%100==0&&await this._yield(),// steps 5.3.1 and 5.3.2:
await this._hashAndTrackBlankNode({id:e,hashToBlankNodes:t});// 5.4) For each hash to identifier list mapping in hash to blank
// nodes map, lexicographically-sorted by hash:
let i=[...t.keys()].sort(),s=[];for(let e of i){// 5.4.1) If the length of identifier list is greater than 1,
// continue to the next mapping.
let n=t.get(e);if(n.length>1){s.push(n);continue}// 5.4.2) Use the Issue Identifier algorithm, passing canonical
// issuer and the single blank node identifier in identifier
// list, identifier, to issue a canonical replacement identifier
// for identifier.
let r=n[0];this.canonicalIssuer.getId(r);// Note: These steps are skipped, optimized away since the loop
// only needs to be run once.
// 5.4.3) Remove identifier from non-normalized identifiers.
// 5.4.4) Remove hash from the hash to blank nodes map.
// 5.4.5) Set simple to true.
}// 6) For each hash to identifier list mapping in hash to blank nodes map,
// lexicographically-sorted by hash:
// Note: sort optimized away, use `nonUnique`.
for(let e of s){// 6.1) Create hash path list where each item will be a result of
// running the Hash N-Degree Quads algorithm.
let t=[];// 6.2) For each blank node identifier identifier in identifier list:
for(let n of e){// 6.2.1) If a canonical identifier has already been issued for
// identifier, continue to the next identifier.
if(this.canonicalIssuer.hasId(n))continue;// 6.2.2) Create temporary issuer, an identifier issuer
// initialized with the prefix _:b.
let e=new r("_:b");// 6.2.3) Use the Issue Identifier algorithm, passing temporary
// issuer and identifier, to issue a new temporary blank node
// identifier for identifier.
e.getId(n);// 6.2.4) Run the Hash N-Degree Quads algorithm, passing
// temporary issuer, and append the result to the hash path list.
let a=await this.hashNDegreeQuads(n,e);t.push(a)}for(let e of(// 6.3) For each result in the hash path list,
// lexicographically-sorted by the hash in result:
t.sort(l),t)){// 6.3.1) For each blank node identifier, existing identifier,
// that was issued a temporary identifier by identifier issuer
// in result, issue a canonical identifier, in the same order,
// using the Issue Identifier algorithm, passing canonical
// issuer and existing identifier.
let t=e.issuer.getOldIds();for(let e of t)this.canonicalIssuer.getId(e)}}/* Note: At this point all blank nodes in the set of RDF quads have been
    assigned canonical identifiers, which have been stored in the canonical
    issuer. Here each quad is updated by assigning each of its blank nodes
    its new identifier. */// 7) For each quad, quad, in input dataset:
let d=[];for(let e of this.quads){// 7.1) Create a copy, quad copy, of quad and replace any existing
// blank node identifiers using the canonical identifiers
// previously issued by canonical issuer.
// Note: We optimize away the copy here.
let t=o.serializeQuadComponents(this._componentWithCanonicalId(e.subject),e.predicate,this._componentWithCanonicalId(e.object),this._componentWithCanonicalId(e.graph));// 7.2) Add quad copy to the normalized dataset.
d.push(t)}// 8) Return the normalized dataset.
return(// sort normalized output
d.sort(),d.join(""))}// 4.6) Hash First Degree Quads
async hashFirstDegreeQuads(e){// 1) Initialize nquads to an empty list. It will be used to store quads in
// N-Quads format.
let t=[],n=this.blankNodeInfo.get(e),r=n.quads;// 3) For each quad `quad` in `quads`:
for(let n of r){// 3.1) Serialize the quad in N-Quads format with the following special
// rule:
// 3.1.1) If any component in quad is an blank node, then serialize it
// using a special identifier as follows:
let r={subject:null,predicate:n.predicate,object:null,graph:null};// 3.1.2) If the blank node's existing blank node identifier matches
// the reference blank node identifier then use the blank node
// identifier _:a, otherwise, use the blank node identifier _:z.
r.subject=this.modifyFirstDegreeComponent(e,n.subject,"subject"),r.object=this.modifyFirstDegreeComponent(e,n.object,"object"),r.graph=this.modifyFirstDegreeComponent(e,n.graph,"graph"),t.push(o.serializeQuad(r))}// 4) Sort nquads in lexicographical order.
t.sort();// 5) Return the hash that results from passing the sorted, joined nquads
// through the hash algorithm.
let a=this.createMessageDigest();for(let e of t)a.update(e);return n.hash=await a.digest(),n.hash}// 4.7) Hash Related Blank Node
async hashRelatedBlankNode(e,t,n,r){let a;a=this.canonicalIssuer.hasId(e)?this.canonicalIssuer.getId(e):n.hasId(e)?n.getId(e):this.blankNodeInfo.get(e).hash;// 2) Initialize a string input to the value of position.
// Note: We use a hash object instead.
let i=this.createMessageDigest();// 5) Return the hash that results from passing input through the hash
// algorithm.
return i.update(r),"g"!==r&&i.update(this.getRelatedPredicate(t)),// 4) Append identifier to input.
i.update(a),i.digest()}// 4.8) Hash N-Degree Quads
async hashNDegreeQuads(e,t){let n=this.deepIterations.get(e)||0;if(n>this.maxDeepIterations)throw Error(`Maximum deep iterations (${this.maxDeepIterations}) exceeded.`);this.deepIterations.set(e,n+1);// 1) Create a hash to related blank nodes map for storing hashes that
// identify related blank nodes.
// Note: 2) and 3) handled within `createHashToRelated`
let r=this.createMessageDigest(),a=await this.createHashToRelated(e,t),o=[...a.keys()].sort();for(let e of o){let n;// 5.1) Append the related hash to the data to hash.
r.update(e);// 5.2) Create a string chosen path.
let o="",l=new i(a.get(e)),s=0;for(;l.hasNext();){let e=l.next();++s%3==0&&await this._yield();// 5.4.1) Create a copy of issuer, issuer copy.
let r=t.clone(),a="",i=[],d=!1;for(let t of e)// 5.4.4.3) If chosen path is not empty and the length of path
// is greater than or equal to the length of chosen path and
// path is lexicographically greater than chosen path, then
// skip to the next permutation.
// Note: Comparing path length to chosen path length can be optimized
// away; only compare lexicographically.
if(this.canonicalIssuer.hasId(t)?a+=this.canonicalIssuer.getId(t):(r.hasId(t)||i.push(t),// 5.4.4.2.2) Use the Issue Identifier algorithm, passing
// issuer copy and related and append the result to path.
a+=r.getId(t)),0!==o.length&&a>o){d=!0;break}if(!d){// 5.4.5) For each related in recursion list:
for(let e of i){// 5.4.5.1) Set result to the result of recursively executing
// the Hash N-Degree Quads algorithm, passing related for
// identifier and issuer copy for path identifier issuer.
let t=await this.hashNDegreeQuads(e,r);// 5.4.5.5) If chosen path is not empty and the length of path
// is greater than or equal to the length of chosen path and
// path is lexicographically greater than chosen path, then
// skip to the next permutation.
// Note: Comparing path length to chosen path length can be optimized
// away; only compare lexicographically.
if(// 5.4.5.3) Append <, the hash in result, and > to path.
a+=r.getId(e)+`<${t.hash}>`,// 5.4.5.4) Set issuer copy to the identifier issuer in
// result.
r=t.issuer,0!==o.length&&a>o){d=!0;break}}!d&&(0===o.length||a<o)&&(o=a,n=r)}}// 5.5) Append chosen path to data to hash.
r.update(o),// 5.6) Replace issuer, by reference, with chosen issuer.
t=n}// 6) Return issuer and the hash that results from passing data to hash
// through the hash algorithm.
return{hash:await r.digest(),issuer:t}}// helper for modifying component during Hash First Degree Quads
modifyFirstDegreeComponent(e,t){return"BlankNode"!==t.termType?t:{termType:"BlankNode",value:t.value===e?"_:a":"_:z"}}// helper for getting a related predicate
getRelatedPredicate(e){return`<${e.predicate.value}>`}// helper for creating hash to related blank nodes map
async createHashToRelated(e,t){// 1) Create a hash to related blank nodes map for storing hashes that
// identify related blank nodes.
let n=new Map,r=this.blankNodeInfo.get(e).quads,a=0;for(let i of r)++a%100==0&&await this._yield(),// 3.1) For each component in quad, if component is the subject, object,
// and graph name and it is a blank node that is not identified by
// identifier:
// steps 3.1.1 and 3.1.2 occur in helpers:
await Promise.all([this._addRelatedBlankNodeHash({quad:i,component:i.subject,position:"s",id:e,issuer:t,hashToRelated:n}),this._addRelatedBlankNodeHash({quad:i,component:i.object,position:"o",id:e,issuer:t,hashToRelated:n}),this._addRelatedBlankNodeHash({quad:i,component:i.graph,position:"g",id:e,issuer:t,hashToRelated:n})]);return n}async _hashAndTrackBlankNode({id:e,hashToBlankNodes:t}){// 5.3.1) Create a hash, hash, according to the Hash First Degree
// Quads algorithm.
let n=await this.hashFirstDegreeQuads(e),r=t.get(n);r?r.push(e):t.set(n,[e])}_addBlankNodeQuadInfo({quad:e,component:t}){if("BlankNode"!==t.termType)return;let n=t.value,r=this.blankNodeInfo.get(n);r?r.quads.add(e):this.blankNodeInfo.set(n,{quads:new Set([e]),hash:null})}async _addRelatedBlankNodeHash({quad:e,component:t,position:n,id:r,issuer:a,hashToRelated:i}){if(!("BlankNode"===t.termType&&t.value!==r))return;// 3.1.1) Set hash to the result of the Hash Related Blank Node
// algorithm, passing the blank node identifier for component as
// related, quad, path identifier issuer as issuer, and position as
// either s, o, or g based on whether component is a subject, object,
// graph name, respectively.
let o=t.value,l=await this.hashRelatedBlankNode(o,e,a,n),s=i.get(l);s?s.push(o):i.set(l,[o])}// canonical ids for 7.1
_componentWithCanonicalId(e){return"BlankNode"!==e.termType||e.value.startsWith(this.canonicalIssuer.prefix)?e:{termType:"BlankNode",value:this.canonicalIssuer.getId(e.value)}}async _yield(){return new Promise(e=>setImmediate(e))}}}),n.register("dvul9",function(e,t){e.exports=class e{/**
   * Creates a new IdentifierIssuer. A IdentifierIssuer issues unique
   * identifiers, keeping track of any previously issued identifiers.
   *
   * @param prefix the prefix to use ('<prefix><counter>').
   * @param existing an existing Map to use.
   * @param counter the counter to use.
   */constructor(e,t=new Map,n=0){this.prefix=e,this._existing=t,this.counter=n}/**
   * Copies this IdentifierIssuer.
   *
   * @return a copy of this IdentifierIssuer.
   */clone(){let{prefix:t,_existing:n,counter:r}=this;return new e(t,new Map(n),r)}/**
   * Gets the new identifier for the given old identifier, where if no old
   * identifier is given a new identifier will be generated.
   *
   * @param [old] the old identifier to get the new identifier for.
   *
   * @return the new identifier.
   */getId(e){// return existing old identifier
let t=e&&this._existing.get(e);if(t)return t;// get next identifier
let n=this.prefix+this.counter;return this.counter++,e&&this._existing.set(e,n),n}/**
   * Returns true if the given old identifer has already been assigned a new
   * identifier.
   *
   * @param old the old identifier to check.
   *
   * @return true if the old identifier has been assigned a new identifier,
   *   false if not.
   */hasId(e){return this._existing.has(e)}/**
   * Returns all of the IDs that have been issued new IDs in the order in
   * which they were issued new IDs.
   *
   * @return the list of old IDs that has been issued new IDs in order.
   */getOldIds(){return[...this._existing.keys()]}}}),n.register("jnHNj",function(e,t){n("jGbML");let r=self.crypto||self.msCrypto;e.exports=class{/**
   * Creates a new MessageDigest.
   *
   * @param algorithm the algorithm to use.
   */constructor(e){// check if crypto.subtle is available
// check is here rather than top-level to only fail if class is used
if(!(r&&r.subtle))throw Error("crypto.subtle not found.");if("sha256"===e)this.algorithm={name:"SHA-256"};else if("sha1"===e)this.algorithm={name:"SHA-1"};else throw Error(`Unsupported algorithm "${e}".`);this._content=""}update(e){this._content+=e}async digest(){let e=new TextEncoder().encode(this._content),t=new Uint8Array(await r.subtle.digest(this.algorithm,e)),n="";for(let e=0;e<t.length;++e)n+=t[e].toString(16).padStart(2,"0");return n}}}),n.register("jGbML",function(e,r){var a=n("hPtJY");!function(e,t){if(!e.setImmediate){var n,r,i,o,l,s=1,d={},c=!1,u=e.document,p=Object.getPrototypeOf&&Object.getPrototypeOf(e);// Spec says greater than zero
p=p&&p.setTimeout?p:e,"[object process]"===({}).toString.call(e.process)?l=function(e){a.nextTick(function(){f(e)})}:function(){// The test against `importScripts` prevents this implementation from being installed inside a web worker,
// where `global.postMessage` means something completely different and can't be used for this purpose.
if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=n,t}}()?(n="setImmediate$"+Math.random()+"$",r=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(n)&&f(+t.data.slice(n.length))},e.addEventListener?e.addEventListener("message",r,!1):e.attachEvent("onmessage",r),l=function(t){e.postMessage(n+t,"*")}):e.MessageChannel?((i=new MessageChannel).port1.onmessage=function(e){f(e.data)},l=function(e){i.port2.postMessage(e)}):u&&"onreadystatechange"in u.createElement("script")?(o=u.documentElement,l=function(e){// Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
// into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
var t=u.createElement("script");t.onreadystatechange=function(){f(e),t.onreadystatechange=null,o.removeChild(t),t=null},o.appendChild(t)}):l=function(e){setTimeout(f,0,e)},p.setImmediate=function(e){"function"!=typeof e&&(e=Function(""+e));for(var t=Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];// Copy function arguments
var r={callback:e,args:t};return d[s]=r,l(s),s++},p.clearImmediate=h}function h(e){delete d[e]}function f(e){// From the spec: "Wait until any invocations of this algorithm started before this one have completed."
// So if we're currently running a task, we'll need to delay this invocation.
if(c)// "too much recursion" error.
setTimeout(f,0,e);else{var t=d[e];if(t){c=!0;try{!function(e){var t=e.callback,n=e.args;switch(n.length){case 0:t();break;case 1:t(n[0]);break;case 2:t(n[0],n[1]);break;case 3:t(n[0],n[1],n[2]);break;default:t.apply(void 0,n)}}(t)}finally{h(e),c=!1}}}}}("undefined"==typeof self?void 0===t?e.exports:t:self)}),n.register("9NKOE",function(e,t){e.exports=class{/**
   * A Permuter iterates over all possible permutations of the given array
   * of elements.
   *
   * @param list the array of elements to iterate over.
   */constructor(e){// original array
this.current=e.sort(),// indicates whether there are more permutations
this.done=!1,// directional info for permutation algorithm
this.dir=new Map;for(let t=0;t<e.length;++t)this.dir.set(e[t],!0)}/**
   * Returns true if there is another permutation.
   *
   * @return true if there is another permutation, false if not.
   */hasNext(){return!this.done}/**
   * Gets the next permutation. Call hasNext() to ensure there is another one
   * first.
   *
   * @return the next permutation.
   */next(){// copy current permutation to return it
let{current:e,dir:t}=this,n=e.slice(),r=null,a=0,i=e.length;for(let n=0;n<i;++n){let o=e[n],l=t.get(o);(null===r||o>r)&&(l&&n>0&&o>e[n-1]||!l&&n<i-1&&o>e[n+1])&&(r=o,a=n)}// no more permutations
if(null===r)this.done=!0;else{// swap k and the element it is looking at
let n=t.get(r)?a-1:a+1;// reverse the direction of all elements larger than k
for(let i of(e[a]=e[n],e[n]=r,e))i>r&&t.set(i,!t.get(i))}return n}}}),n.register("73eeT",function(e,t){let n="http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",r="http://www.w3.org/2001/XMLSchema#string",a="NamedNode",i="BlankNode",o="Literal",l="DefaultGraph",s={};(()=>{let e="(?:<([^:]+:[^>]*)>)",t="A-Za-z\xc0-\xd6\xd8-\xf6\xf8-˿Ͱ-ͽͿ-῿‌-‍⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�_",n=t+"0-9-\xb7̀-ͯ‿-⁀",r="(_:(?:["+t+"0-9])(?:(?:["+n+".])*(?:["+n+"]))?)",a="[ \\t]+",i="[ \\t]*";// end of line and empty regexes
s.eoln=/(?:\r\n)|(?:\n)|(?:\r)/g,s.empty=RegExp("^"+i+"$"),// full quad regex
s.quad=RegExp("^"+i+("(?:"+e+"|")+r+")"+a+(e+a)+("(?:"+e+"|"+r+'|(?:"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"(?:(?:\\^\\^'+e)+")|(?:@([a-zA-Z]+(?:-[a-zA-Z0-9]+)*)))?))"+i+("(?:\\.|(?:(?:"+e+"|"+r)+")"+i+"\\.))"+i+"$")})(),e.exports=class e{/**
   * Parses RDF in the form of N-Quads.
   *
   * @param input the N-Quads input to parse.
   *
   * @return an RDF dataset (an array of quads per http://rdf.js.org/).
   */static parse(e){// build RDF dataset
let t=[],d={},u=e.split(s.eoln),p=0;for(let e of u){// skip empty lines
if(p++,s.empty.test(e))continue;// parse quad
let u=e.match(s.quad);if(null===u)throw Error("N-Quads parse error on line "+p+".");// create RDF quad
let h={subject:null,predicate:null,object:null,graph:null};// only add quad if it is unique in its graph
if(void 0!==u[1]?h.subject={termType:a,value:u[1]}:h.subject={termType:i,value:u[2]},// get predicate
h.predicate={termType:a,value:u[3]},void 0!==u[4]?h.object={termType:a,value:u[4]}:void 0!==u[5]?h.object={termType:i,value:u[5]}:(h.object={termType:o,value:void 0,datatype:{termType:a}},void 0!==u[7]?h.object.datatype.value=u[7]:void 0!==u[8]?(h.object.datatype.value=n,h.object.language=u[8]):h.object.datatype.value=r,h.object.value=u[6].replace(c,function(e,t,n,r){if(t)switch(t){case"t":return"	";case"b":return"\b";case"n":return"\n";case"r":return"\r";case"f":return"\f";case'"':return'"';case"'":return"'";case"\\":return"\\"}if(n)return String.fromCharCode(parseInt(n,16));if(r)throw Error("Unsupported U escape")})),void 0!==u[9]?h.graph={termType:a,value:u[9]}:void 0!==u[10]?h.graph={termType:i,value:u[10]}:h.graph={termType:l,value:""},h.graph.value in d){let e=!0,n=d[h.graph.value];for(let t of n)if(// compare subject and object types first as it is the quickest check
t.subject.termType===h.subject.termType&&t.object.termType===h.object.termType&&t.subject.value===h.subject.value&&t.predicate.value===h.predicate.value&&t.object.value===h.object.value&&(t.object.termType!==o||t.object.datatype.termType===h.object.datatype.termType&&t.object.language===h.object.language&&t.object.datatype.value===h.object.datatype.value)){e=!1;break}e&&(n.push(h),t.push(h))}else d[h.graph.value]=[h],t.push(h)}return t}/**
   * Converts an RDF dataset to N-Quads.
   *
   * @param dataset (array of quads) the RDF dataset to convert.
   *
   * @return the N-Quads string.
   */static serialize(t){Array.isArray(t)||(t=e.legacyDatasetToQuads(t));let n=[];for(let r of t)n.push(e.serializeQuad(r));return n.sort().join("")}/**
   * Converts RDF quad components to an N-Quad string (a single quad).
   *
   * @param {Object} s - N-Quad subject component.
   * @param {Object} p - N-Quad predicate component.
   * @param {Object} o - N-Quad object component.
   * @param {Object} g - N-Quad graph component.
   *
   * @return {string} the N-Quad.
   */static serializeQuadComponents(e,t,o,l){let s="";return e.termType===a?s+=`<${e.value}>`:s+=`${e.value}`,// predicate can only be NamedNode
s+=` <${t.value}> `,o.termType===a?s+=`<${o.value}>`:o.termType===i?s+=o.value:(s+=`"${o.value.replace(d,function(e){switch(e){case'"':return'\\"';case"\\":return"\\\\";case"\n":return"\\n";case"\r":return"\\r"}})}"`,o.datatype.value===n?o.language&&(s+=`@${o.language}`):o.datatype.value!==r&&(s+=`^^<${o.datatype.value}>`)),l.termType===a?s+=` <${l.value}>`:l.termType===i&&(s+=` ${l.value}`),s+=" .\n"}/**
   * Converts an RDF quad to an N-Quad string (a single quad).
   *
   * @param quad the RDF quad convert.
   *
   * @return the N-Quad string.
   */static serializeQuad(t){return e.serializeQuadComponents(t.subject,t.predicate,t.object,t.graph)}/**
   * Converts a legacy-formatted dataset to an array of quads dataset per
   * http://rdf.js.org/.
   *
   * @param dataset the legacy dataset to convert.
   *
   * @return the array of quads dataset.
   */static legacyDatasetToQuads(e){let t=[],s={"blank node":i,IRI:a,literal:o};for(let d in e){let c=e[d];c.forEach(e=>{let c={};for(let t in e){let i=e[t],l={termType:s[i.type],value:i.value};l.termType!==o||(l.datatype={termType:a},"datatype"in i&&(l.datatype.value=i.datatype),"language"in i?("datatype"in i||(l.datatype.value=n),l.language=i.language):"datatype"in i||(l.datatype.value=r)),c[t]=l}"@default"===d?c.graph={termType:l,value:""}:c.graph={termType:d.startsWith("_:")?i:a,value:d},t.push(c)})}return t}};let d=/["\\\n\r]/g,c=/(?:\\([tbnrf"'\\]))|(?:\\u([0-9A-Fa-f]{4}))|(?:\\U([0-9A-Fa-f]{8}))/g}),n.register("iA9G8",function(e,t){var r=n("jnHNj"),a=n("dVoAc");e.exports=class extends a{constructor(){super(),this.name="URGNA2012",this.createMessageDigest=()=>new r("sha1")}// helper for modifying component during Hash First Degree Quads
modifyFirstDegreeComponent(e,t,n){return"BlankNode"!==t.termType?t:"graph"===n?{termType:"BlankNode",value:"_:g"}:{termType:"BlankNode",value:t.value===e?"_:a":"_:z"}}// helper for getting a related predicate
getRelatedPredicate(e){return e.predicate.value}// helper for creating hash to related blank nodes map
async createHashToRelated(e,t){// 1) Create a hash to related blank nodes map for storing hashes that
// identify related blank nodes.
let n=new Map,r=this.blankNodeInfo.get(e).quads,a=0;for(let i of r){let r,o;if("BlankNode"===i.subject.termType&&i.subject.value!==e)o=i.subject.value,r="p";else{if("BlankNode"!==i.object.termType||i.object.value===e)continue;// 3.2) Otherwise, if quad's object is a blank node that does not match
// identifier, to the result of the Hash Related Blank Node algorithm,
// passing the blank node identifier for object as related, quad, path
// identifier issuer as issuer, and r as position.
o=i.object.value,r="r"}++a%100==0&&await this._yield();// 3.4) Add a mapping of hash to the blank node identifier for the
// component that matched (subject or object) to hash to related blank
// nodes map, adding an entry as necessary.
let l=await this.hashRelatedBlankNode(o,i,t,r),s=n.get(l);s?s.push(o):n.set(l,[o])}return n}}}),n.register("5mJZl",function(e,t){var r=n("dvul9"),a=n("jnHNj"),i=n("9NKOE"),o=n("73eeT");function l(e,t){return e.hash<t.hash?-1:e.hash>t.hash?1:0}e.exports=class{constructor({createMessageDigest:e=()=>new a("sha256"),canonicalIdMap:t=new Map,maxDeepIterations:n=1/0}={}){this.name="URDNA2015",this.blankNodeInfo=new Map,this.canonicalIssuer=new r("_:c14n",t),this.createMessageDigest=e,this.maxDeepIterations=n,this.quads=null,this.deepIterations=null}// 4.4) Normalization Algorithm
main(e){// 1) Create the normalization state.
// 2) For every quad in input dataset:
for(let t of(this.deepIterations=new Map,this.quads=e,e))// 2.1) For each blank node that occurs in the quad, add a reference
// to the quad using the blank node identifier in the blank node to
// quads map, creating a new entry if necessary.
this._addBlankNodeQuadInfo({quad:t,component:t.subject}),this._addBlankNodeQuadInfo({quad:t,component:t.object}),this._addBlankNodeQuadInfo({quad:t,component:t.graph});// 3) Create a list of non-normalized blank node identifiers
// non-normalized identifiers and populate it using the keys from the
// blank node to quads map.
// Note: We use a map here and it was generated during step 2.
// 4) `simple` flag is skipped -- loop is optimized away. This optimization
// is permitted because there was a typo in the hash first degree quads
// algorithm in the URDNA2015 spec that was implemented widely making it
// such that it could not be fixed; the result was that the loop only
// needs to be run once and the first degree quad hashes will never change.
// 5.1-5.2 are skipped; first degree quad hashes are generated just once
// for all non-normalized blank nodes.
// 5.3) For each blank node identifier identifier in non-normalized
// identifiers:
let t=new Map,n=[...this.blankNodeInfo.keys()];for(let e of n)this._hashAndTrackBlankNode({id:e,hashToBlankNodes:t});// 5.4) For each hash to identifier list mapping in hash to blank
// nodes map, lexicographically-sorted by hash:
let a=[...t.keys()].sort(),i=[];for(let e of a){// 5.4.1) If the length of identifier list is greater than 1,
// continue to the next mapping.
let n=t.get(e);if(n.length>1){i.push(n);continue}// 5.4.2) Use the Issue Identifier algorithm, passing canonical
// issuer and the single blank node identifier in identifier
// list, identifier, to issue a canonical replacement identifier
// for identifier.
let r=n[0];this.canonicalIssuer.getId(r);// Note: These steps are skipped, optimized away since the loop
// only needs to be run once.
// 5.4.3) Remove identifier from non-normalized identifiers.
// 5.4.4) Remove hash from the hash to blank nodes map.
// 5.4.5) Set simple to true.
}// 6) For each hash to identifier list mapping in hash to blank nodes map,
// lexicographically-sorted by hash:
// Note: sort optimized away, use `nonUnique`.
for(let e of i){// 6.1) Create hash path list where each item will be a result of
// running the Hash N-Degree Quads algorithm.
let t=[];// 6.2) For each blank node identifier identifier in identifier list:
for(let n of e){// 6.2.1) If a canonical identifier has already been issued for
// identifier, continue to the next identifier.
if(this.canonicalIssuer.hasId(n))continue;// 6.2.2) Create temporary issuer, an identifier issuer
// initialized with the prefix _:b.
let e=new r("_:b");// 6.2.3) Use the Issue Identifier algorithm, passing temporary
// issuer and identifier, to issue a new temporary blank node
// identifier for identifier.
e.getId(n);// 6.2.4) Run the Hash N-Degree Quads algorithm, passing
// temporary issuer, and append the result to the hash path list.
let a=this.hashNDegreeQuads(n,e);t.push(a)}for(let e of(// 6.3) For each result in the hash path list,
// lexicographically-sorted by the hash in result:
t.sort(l),t)){// 6.3.1) For each blank node identifier, existing identifier,
// that was issued a temporary identifier by identifier issuer
// in result, issue a canonical identifier, in the same order,
// using the Issue Identifier algorithm, passing canonical
// issuer and existing identifier.
let t=e.issuer.getOldIds();for(let e of t)this.canonicalIssuer.getId(e)}}/* Note: At this point all blank nodes in the set of RDF quads have been
    assigned canonical identifiers, which have been stored in the canonical
    issuer. Here each quad is updated by assigning each of its blank nodes
    its new identifier. */// 7) For each quad, quad, in input dataset:
let s=[];for(let e of this.quads){// 7.1) Create a copy, quad copy, of quad and replace any existing
// blank node identifiers using the canonical identifiers
// previously issued by canonical issuer.
// Note: We optimize away the copy here.
let t=o.serializeQuadComponents(this._componentWithCanonicalId({component:e.subject}),e.predicate,this._componentWithCanonicalId({component:e.object}),this._componentWithCanonicalId({component:e.graph}));// 7.2) Add quad copy to the normalized dataset.
s.push(t)}// 8) Return the normalized dataset.
return(// sort normalized output
s.sort(),s.join(""))}// 4.6) Hash First Degree Quads
hashFirstDegreeQuads(e){// 1) Initialize nquads to an empty list. It will be used to store quads in
// N-Quads format.
let t=[],n=this.blankNodeInfo.get(e),r=n.quads;// 3) For each quad `quad` in `quads`:
for(let n of r){// 3.1) Serialize the quad in N-Quads format with the following special
// rule:
// 3.1.1) If any component in quad is an blank node, then serialize it
// using a special identifier as follows:
let r={subject:null,predicate:n.predicate,object:null,graph:null};// 3.1.2) If the blank node's existing blank node identifier matches
// the reference blank node identifier then use the blank node
// identifier _:a, otherwise, use the blank node identifier _:z.
r.subject=this.modifyFirstDegreeComponent(e,n.subject,"subject"),r.object=this.modifyFirstDegreeComponent(e,n.object,"object"),r.graph=this.modifyFirstDegreeComponent(e,n.graph,"graph"),t.push(o.serializeQuad(r))}// 4) Sort nquads in lexicographical order.
t.sort();// 5) Return the hash that results from passing the sorted, joined nquads
// through the hash algorithm.
let a=this.createMessageDigest();for(let e of t)a.update(e);return n.hash=a.digest(),n.hash}// 4.7) Hash Related Blank Node
hashRelatedBlankNode(e,t,n,r){let a;a=this.canonicalIssuer.hasId(e)?this.canonicalIssuer.getId(e):n.hasId(e)?n.getId(e):this.blankNodeInfo.get(e).hash;// 2) Initialize a string input to the value of position.
// Note: We use a hash object instead.
let i=this.createMessageDigest();// 5) Return the hash that results from passing input through the hash
// algorithm.
return i.update(r),"g"!==r&&i.update(this.getRelatedPredicate(t)),// 4) Append identifier to input.
i.update(a),i.digest()}// 4.8) Hash N-Degree Quads
hashNDegreeQuads(e,t){let n=this.deepIterations.get(e)||0;if(n>this.maxDeepIterations)throw Error(`Maximum deep iterations (${this.maxDeepIterations}) exceeded.`);this.deepIterations.set(e,n+1);// 1) Create a hash to related blank nodes map for storing hashes that
// identify related blank nodes.
// Note: 2) and 3) handled within `createHashToRelated`
let r=this.createMessageDigest(),a=this.createHashToRelated(e,t),o=[...a.keys()].sort();for(let e of o){let n;// 5.1) Append the related hash to the data to hash.
r.update(e);// 5.2) Create a string chosen path.
let o="",l=new i(a.get(e));for(;l.hasNext();){let e=l.next(),r=t.clone(),a="",i=[],s=!1;for(let t of e)// 5.4.4.3) If chosen path is not empty and the length of path
// is greater than or equal to the length of chosen path and
// path is lexicographically greater than chosen path, then
// skip to the next permutation.
// Note: Comparing path length to chosen path length can be optimized
// away; only compare lexicographically.
if(this.canonicalIssuer.hasId(t)?a+=this.canonicalIssuer.getId(t):(r.hasId(t)||i.push(t),// 5.4.4.2.2) Use the Issue Identifier algorithm, passing
// issuer copy and related and append the result to path.
a+=r.getId(t)),0!==o.length&&a>o){s=!0;break}if(!s){// 5.4.5) For each related in recursion list:
for(let e of i){// 5.4.5.1) Set result to the result of recursively executing
// the Hash N-Degree Quads algorithm, passing related for
// identifier and issuer copy for path identifier issuer.
let t=this.hashNDegreeQuads(e,r);// 5.4.5.5) If chosen path is not empty and the length of path
// is greater than or equal to the length of chosen path and
// path is lexicographically greater than chosen path, then
// skip to the next permutation.
// Note: Comparing path length to chosen path length can be optimized
// away; only compare lexicographically.
if(// 5.4.5.3) Append <, the hash in result, and > to path.
a+=r.getId(e)+`<${t.hash}>`,// 5.4.5.4) Set issuer copy to the identifier issuer in
// result.
r=t.issuer,0!==o.length&&a>o){s=!0;break}}!s&&(0===o.length||a<o)&&(o=a,n=r)}}// 5.5) Append chosen path to data to hash.
r.update(o),// 5.6) Replace issuer, by reference, with chosen issuer.
t=n}// 6) Return issuer and the hash that results from passing data to hash
// through the hash algorithm.
return{hash:r.digest(),issuer:t}}// helper for modifying component during Hash First Degree Quads
modifyFirstDegreeComponent(e,t){return"BlankNode"!==t.termType?t:{termType:"BlankNode",value:t.value===e?"_:a":"_:z"}}// helper for getting a related predicate
getRelatedPredicate(e){return`<${e.predicate.value}>`}// helper for creating hash to related blank nodes map
createHashToRelated(e,t){// 1) Create a hash to related blank nodes map for storing hashes that
// identify related blank nodes.
let n=new Map,r=this.blankNodeInfo.get(e).quads;// 3) For each quad in quads:
for(let a of r)// 3.1) For each component in quad, if component is the subject, object,
// or graph name and it is a blank node that is not identified by
// identifier:
// steps 3.1.1 and 3.1.2 occur in helpers:
this._addRelatedBlankNodeHash({quad:a,component:a.subject,position:"s",id:e,issuer:t,hashToRelated:n}),this._addRelatedBlankNodeHash({quad:a,component:a.object,position:"o",id:e,issuer:t,hashToRelated:n}),this._addRelatedBlankNodeHash({quad:a,component:a.graph,position:"g",id:e,issuer:t,hashToRelated:n});return n}_hashAndTrackBlankNode({id:e,hashToBlankNodes:t}){// 5.3.1) Create a hash, hash, according to the Hash First Degree
// Quads algorithm.
let n=this.hashFirstDegreeQuads(e),r=t.get(n);r?r.push(e):t.set(n,[e])}_addBlankNodeQuadInfo({quad:e,component:t}){if("BlankNode"!==t.termType)return;let n=t.value,r=this.blankNodeInfo.get(n);r?r.quads.add(e):this.blankNodeInfo.set(n,{quads:new Set([e]),hash:null})}_addRelatedBlankNodeHash({quad:e,component:t,position:n,id:r,issuer:a,hashToRelated:i}){if(!("BlankNode"===t.termType&&t.value!==r))return;// 3.1.1) Set hash to the result of the Hash Related Blank Node
// algorithm, passing the blank node identifier for component as
// related, quad, path identifier issuer as issuer, and position as
// either s, o, or g based on whether component is a subject, object,
// graph name, respectively.
let o=t.value,l=this.hashRelatedBlankNode(o,e,a,n),s=i.get(l);s?s.push(o):i.set(l,[o])}// canonical ids for 7.1
_componentWithCanonicalId({component:e}){return"BlankNode"!==e.termType||e.value.startsWith(this.canonicalIssuer.prefix)?e:{termType:"BlankNode",value:this.canonicalIssuer.getId(e.value)}}}}),n.register("1phhp",function(e,t){var r=n("jnHNj"),a=n("5mJZl");e.exports=class extends a{constructor(){super(),this.name="URGNA2012",this.createMessageDigest=()=>new r("sha1")}// helper for modifying component during Hash First Degree Quads
modifyFirstDegreeComponent(e,t,n){return"BlankNode"!==t.termType?t:"graph"===n?{termType:"BlankNode",value:"_:g"}:{termType:"BlankNode",value:t.value===e?"_:a":"_:z"}}// helper for getting a related predicate
getRelatedPredicate(e){return e.predicate.value}// helper for creating hash to related blank nodes map
createHashToRelated(e,t){// 1) Create a hash to related blank nodes map for storing hashes that
// identify related blank nodes.
let n=new Map,r=this.blankNodeInfo.get(e).quads;// 3) For each quad in quads:
for(let a of r){let r,i;if("BlankNode"===a.subject.termType&&a.subject.value!==e)i=a.subject.value,r="p";else{if("BlankNode"!==a.object.termType||a.object.value===e)continue;// 3.2) Otherwise, if quad's object is a blank node that does not match
// identifier, to the result of the Hash Related Blank Node algorithm,
// passing the blank node identifier for object as related, quad, path
// identifier issuer as issuer, and r as position.
i=a.object.value,r="r"}// 3.4) Add a mapping of hash to the blank node identifier for the
// component that matched (subject or object) to hash to related blank
// nodes map, adding an entry as necessary.
let o=this.hashRelatedBlankNode(i,a,t,r),l=n.get(o);l?l.push(i):n.set(o,[i])}return n}}}),n.register("6a1Di",function(e,t){var r=n("a8tTH");let a={};e.exports=a,/**
 * Setup browser document loaders.
 *
 * @param jsonld the jsonld api.
 */a.setupDocumentLoaders=function(e){"undefined"!=typeof XMLHttpRequest&&(e.documentLoaders.xhr=r,// use xhr document loader by default
e.useDocumentLoader("xhr"))},/**
 * Setup browser globals.
 *
 * @param jsonld the jsonld api.
 */a.setupGlobals=function(e){void 0===globalThis.JsonLdProcessor&&Object.defineProperty(globalThis,"JsonLdProcessor",{writable:!0,enumerable:!1,configurable:!0,value:e.JsonLdProcessor})}}),n.register("a8tTH",function(e,t){var r=n("85rA0"),a=r.parseLinkHeader,i=r.buildHeaders,o=n("3Umbt").LINK_HEADER_CONTEXT,l=n("3Yszg"),s=n("jUcZG"),d=n("c0VXR").prependBase;let c=/(^|(\r\n))link:/i;/**
 * Creates a built-in XMLHttpRequest document loader.
 *
 * @param options the options to use:
 *          secure: require all URLs to use HTTPS.
 *          headers: an object (map) of headers which will be passed as request
 *            headers for the requested document. Accept is not allowed.
 *          [xhr]: the XMLHttpRequest API to use.
 *
 * @return the XMLHttpRequest document loader.
 */e.exports=({secure:e,headers:t={},xhr:n}={headers:{}})=>{t=i(t);let r=new s;return r.wrapLoader(u);async function u(r){let i,s;if(0!==r.indexOf("http:")&&0!==r.indexOf("https:"))throw new l('URL could not be dereferenced; only "http" and "https" URLs are supported.',"jsonld.InvalidUrl",{code:"loading document failed",url:r});if(e&&0!==r.indexOf("https"))throw new l('URL could not be dereferenced; secure mode is enabled and the URL\'s scheme is not "https".',"jsonld.InvalidUrl",{code:"loading document failed",url:r});try{i=await function(e,t,n){e=e||XMLHttpRequest;let r=new e;return new Promise((e,a)=>{for(let i in r.onload=()=>e(r),r.onerror=e=>a(e),r.open("GET",t,!0),n)r.setRequestHeader(i,n[i]);r.send()})}(n,r,t)}catch(e){throw new l("URL could not be dereferenced, an error occurred.","jsonld.LoadDocumentError",{code:"loading document failed",url:r,cause:e})}if(i.status>=400)throw new l("URL could not be dereferenced: "+i.statusText,"jsonld.LoadDocumentError",{code:"loading document failed",url:r,httpStatusCode:i.status});let p={contextUrl:null,documentUrl:r,document:i.response},h=null,f=i.getResponseHeader("Content-Type");if(c.test(i.getAllResponseHeaders())&&(s=i.getResponseHeader("Link")),s&&"application/ld+json"!==f){// only 1 related link header permitted
let e=a(s),t=e[o];if(Array.isArray(t))throw new l("URL could not be dereferenced, it has more than one associated HTTP Link Header.","jsonld.InvalidUrl",{code:"multiple context link headers",url:r});t&&(p.contextUrl=t.target),// "alternate" link header is a redirect
(h=e.alternate)&&"application/ld+json"==h.type&&!(f||"").match(/^application\/(\w*\+)?json$/)&&(p=await u(d(r,h.target)))}return p}}}),n.register("85rA0",function(e,t){var r=n("dEapz"),a=n("guzPY"),i=n("h0LIu").IdentifierIssuer,o=n("3Yszg");let l=/(?:<[^>]*?>|"[^"]*?"|[^,])+/g,s=/\s*<([^>]*?)>\s*(?:;\s*(.*))?/,d=/(.*?)=(?:(?:"([^"]*?)")|([^"]*?))\s*(?:(?:;\s*)|$)/g,c={headers:{accept:"application/ld+json, application/json"}},u={};e.exports=u,u.IdentifierIssuer=i,u.REGEX_BCP47=/^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/,u.REGEX_KEYWORD=/^@[a-zA-Z]+$/,/**
 * Clones an object, array, Map, Set, or string/number. If a typed JavaScript
 * object is given, such as a Date, it will be converted to a string.
 *
 * @param value the value to clone.
 *
 * @return the cloned value.
 */u.clone=function(e){if(e&&"object"==typeof e){let t;if(a.isArray(e)){t=[];for(let n=0;n<e.length;++n)t[n]=u.clone(e[n])}else if(e instanceof Map)for(let[n,r]of(t=new Map,e))t.set(n,u.clone(r));else if(e instanceof Set)for(let n of(t=new Set,e))t.add(u.clone(n));else if(a.isObject(e))for(let n in t={},e)t[n]=u.clone(e[n]);else t=e.toString();return t}return e},/**
 * Ensure a value is an array. If the value is an array, it is returned.
 * Otherwise, it is wrapped in an array.
 *
 * @param value the value to return as an array.
 *
 * @return the value as an array.
 */u.asArray=function(e){return Array.isArray(e)?e:[e]},/**
 * Builds an HTTP headers object for making a JSON-LD request from custom
 * headers and asserts the `accept` header isn't overridden.
 *
 * @param headers an object of headers with keys as header names and values
 *          as header values.
 *
 * @return an object of headers with a valid `accept` header.
 */u.buildHeaders=(e={})=>{let t=Object.keys(e).some(e=>"accept"===e.toLowerCase());if(t)throw RangeError('Accept header may not be specified; only "'+c.headers.accept+'" is supported.');return Object.assign({Accept:c.headers.accept},e)},/**
 * Parses a link header. The results will be key'd by the value of "rel".
 *
 * Link: <http://json-ld.org/contexts/person.jsonld>;
 * rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"
 *
 * Parses as: {
 *   'http://www.w3.org/ns/json-ld#context': {
 *     target: http://json-ld.org/contexts/person.jsonld,
 *     type: 'application/ld+json'
 *   }
 * }
 *
 * If there is more than one "rel" with the same IRI, then entries in the
 * resulting map for that "rel" will be arrays.
 *
 * @param header the link header to parse.
 */u.parseLinkHeader=e=>{let t={},n=e.match(l);for(let e=0;e<n.length;++e){let r=n[e].match(s);if(!r)continue;let a={target:r[1]},i=r[2];for(;r=d.exec(i);)a[r[1]]=void 0===r[2]?r[3]:r[2];let o=a.rel||"";Array.isArray(t[o])?t[o].push(a):t.hasOwnProperty(o)?t[o]=[t[o],a]:t[o]=a}return t},/**
 * Throws an exception if the given value is not a valid @type value.
 *
 * @param v the value to check.
 */u.validateTypeValue=(e,t)=>{if(!a.isString(e)&&!(a.isArray(e)&&e.every(e=>a.isString(e)))){if(t&&a.isObject(e))switch(Object.keys(e).length){case 0:// empty object is wildcard
return;case 1:// default entry is all strings
if("@default"in e&&u.asArray(e["@default"]).every(e=>a.isString(e)))return}throw new o('Invalid JSON-LD syntax; "@type" value must a string, an array of strings, an empty object, or a default object.',"jsonld.SyntaxError",{code:"invalid type value",value:e})}},/**
 * Returns true if the given subject has the given property.
 *
 * @param subject the subject to check.
 * @param property the property to look for.
 *
 * @return true if the subject has the given property, false if not.
 */u.hasProperty=(e,t)=>{if(e.hasOwnProperty(t)){let n=e[t];return!a.isArray(n)||n.length>0}return!1},/**
 * Determines if the given value is a property of the given subject.
 *
 * @param subject the subject to check.
 * @param property the property to check.
 * @param value the value to check.
 *
 * @return true if the value exists, false if not.
 */u.hasValue=(e,t,n)=>{if(u.hasProperty(e,t)){let i=e[t],o=r.isList(i);if(a.isArray(i)||o){o&&(i=i["@list"]);for(let e=0;e<i.length;++e)if(u.compareValues(n,i[e]))return!0}else if(!a.isArray(n))return u.compareValues(n,i)}return!1},/**
 * Adds a value to a subject. If the value is an array, all values in the
 * array will be added.
 *
 * @param subject the subject to add the value to.
 * @param property the property that relates the value to the subject.
 * @param value the value to add.
 * @param [options] the options to use:
 *        [propertyIsArray] true if the property is always an array, false
 *          if not (default: false).
 *        [valueIsArray] true if the value to be added should be preserved as
 *          an array (lists) (default: false).
 *        [allowDuplicate] true to allow duplicates, false not to (uses a
 *          simple shallow comparison of subject ID or value) (default: true).
 *        [prependValue] false to prepend value to any existing values.
 *          (default: false)
 */u.addValue=(e,t,n,r)=>{if("propertyIsArray"in(r=r||{})||(r.propertyIsArray=!1),"valueIsArray"in r||(r.valueIsArray=!1),"allowDuplicate"in r||(r.allowDuplicate=!0),"prependValue"in r||(r.prependValue=!1),r.valueIsArray)e[t]=n;else if(a.isArray(n)){0===n.length&&r.propertyIsArray&&!e.hasOwnProperty(t)&&(e[t]=[]),r.prependValue&&(n=n.concat(e[t]),e[t]=[]);for(let a=0;a<n.length;++a)u.addValue(e,t,n[a],r)}else if(e.hasOwnProperty(t)){// check if subject already has value if duplicates not allowed
let i=!r.allowDuplicate&&u.hasValue(e,t,n);a.isArray(e[t])||i&&!r.propertyIsArray||(e[t]=[e[t]]),i||(r.prependValue?e[t].unshift(n):e[t].push(n))}else e[t]=r.propertyIsArray?[n]:n},/**
 * Gets all of the values for a subject's property as an array.
 *
 * @param subject the subject.
 * @param property the property.
 *
 * @return all of the values for a subject's property as an array.
 */u.getValues=(e,t)=>[].concat(e[t]||[]),/**
 * Removes a property from a subject.
 *
 * @param subject the subject.
 * @param property the property.
 */u.removeProperty=(e,t)=>{delete e[t]},/**
 * Removes a value from a subject.
 *
 * @param subject the subject.
 * @param property the property that relates the value to the subject.
 * @param value the value to remove.
 * @param [options] the options to use:
 *          [propertyIsArray] true if the property is always an array, false
 *            if not (default: false).
 */u.removeValue=(e,t,n,r)=>{"propertyIsArray"in(r=r||{})||(r.propertyIsArray=!1);// filter out value
let a=u.getValues(e,t).filter(e=>!u.compareValues(e,n));0===a.length?u.removeProperty(e,t):1!==a.length||r.propertyIsArray?e[t]=a:e[t]=a[0]},/**
 * Relabels all blank nodes in the given JSON-LD input.
 *
 * @param input the JSON-LD input.
 * @param [options] the options to use:
 *          [issuer] an IdentifierIssuer to use to label blank nodes.
 */u.relabelBlankNodes=(e,t)=>{t=t||{};let n=t.issuer||new i("_:b");return(/**
 * Labels the blank nodes in the given value using the given IdentifierIssuer.
 *
 * @param issuer the IdentifierIssuer to use.
 * @param element the element with blank nodes to rename.
 *
 * @return the element.
 */function e(t,n){if(a.isArray(n))for(let r=0;r<n.length;++r)n[r]=e(t,n[r]);else if(r.isList(n))n["@list"]=e(t,n["@list"]);else if(a.isObject(n)){r.isBlankNode(n)&&(n["@id"]=t.getId(n["@id"]));// recursively apply to all keys
let a=Object.keys(n).sort();for(let r=0;r<a.length;++r){let i=a[r];"@id"!==i&&(n[i]=e(t,n[i]))}}return n}(n,e))},/**
 * Compares two JSON-LD values for equality. Two JSON-LD values will be
 * considered equal if:
 *
 * 1. They are both primitives of the same type and value.
 * 2. They are both @values with the same @value, @type, @language,
 *   and @index, OR
 * 3. They both have @ids they are the same.
 *
 * @param v1 the first value.
 * @param v2 the second value.
 *
 * @return true if v1 and v2 are considered equal, false if not.
 */u.compareValues=(e,t)=>// 1. equal primitives
    !!(e===t||r.isValue(e)&&r.isValue(t)&&e["@value"]===t["@value"]&&e["@type"]===t["@type"]&&e["@language"]===t["@language"]&&e["@index"]===t["@index"])||!!(a.isObject(e)&&"@id"in e&&a.isObject(t))&&"@id"in t&&e["@id"]===t["@id"],/**
 * Compares two strings first based on length and then lexicographically.
 *
 * @param a the first string.
 * @param b the second string.
 *
 * @return -1 if a < b, 1 if a > b, 0 if a === b.
 */u.compareShortestLeast=(e,t)=>e.length<t.length?-1:t.length<e.length?1:e===t?0:e<t?-1:1}),n.register("dEapz",function(e,t){var r=n("guzPY");let a={};e.exports=a,/**
 * Returns true if the given value is a subject with properties.
 *
 * @param v the value to check.
 *
 * @return true if the value is a subject with properties, false if not.
 */a.isSubject=e=>{// Note: A value is a subject if all of these hold true:
// 1. It is an Object.
// 2. It is not a @value, @set, or @list.
// 3. It has more than 1 key OR any existing key is not @id.
if(r.isObject(e)&&!("@value"in e||"@set"in e||"@list"in e)){let t=Object.keys(e).length;return t>1||!("@id"in e)}return!1},/**
 * Returns true if the given value is a subject reference.
 *
 * @param v the value to check.
 *
 * @return true if the value is a subject reference, false if not.
 */a.isSubjectReference=e=>// 1. It is an Object.
    // 2. It has a single key: @id.
    r.isObject(e)&&1===Object.keys(e).length&&"@id"in e,/**
 * Returns true if the given value is a @value.
 *
 * @param v the value to check.
 *
 * @return true if the value is a @value, false if not.
 */a.isValue=e=>// 1. It is an Object.
    // 2. It has the @value property.
    r.isObject(e)&&"@value"in e,/**
 * Returns true if the given value is a @list.
 *
 * @param v the value to check.
 *
 * @return true if the value is a @list, false if not.
 */a.isList=e=>// 1. It is an Object.
    // 2. It has the @list property.
    r.isObject(e)&&"@list"in e,/**
 * Returns true if the given value is a @graph.
 *
 * @return true if the value is a @graph, false if not.
 */a.isGraph=e=>r.isObject(e)&&"@graph"in e&&1===Object.keys(e).filter(e=>"@id"!==e&&"@index"!==e).length,/**
 * Returns true if the given value is a simple @graph.
 *
 * @return true if the value is a simple @graph, false if not.
 */a.isSimpleGraph=e=>a.isGraph(e)&&!("@id"in e),/**
 * Returns true if the given value is a blank node.
 *
 * @param v the value to check.
 *
 * @return true if the value is a blank node, false if not.
 */a.isBlankNode=e=>{// Note: A value is a blank node if all of these hold true:
// 1. It is an Object.
// 2. If it has an @id key that is not a string OR begins with '_:'.
// 3. It has no keys OR is not a @value, @set, or @list.
if(r.isObject(e)){if("@id"in e){let t=e["@id"];return!r.isString(t)||0===t.indexOf("_:")}return 0===Object.keys(e).length||!("@value"in e||"@set"in e||"@list"in e)}return!1}}),n.register("guzPY",function(e,t){let n={};e.exports=n,/**
 * Returns true if the given value is an Array.
 *
 * @param v the value to check.
 *
 * @return true if the value is an Array, false if not.
 */n.isArray=Array.isArray,/**
 * Returns true if the given value is a Boolean.
 *
 * @param v the value to check.
 *
 * @return true if the value is a Boolean, false if not.
 */n.isBoolean=e=>"boolean"==typeof e||"[object Boolean]"===Object.prototype.toString.call(e),/**
 * Returns true if the given value is a double.
 *
 * @param v the value to check.
 *
 * @return true if the value is a double, false if not.
 */n.isDouble=e=>n.isNumber(e)&&(-1!==String(e).indexOf(".")||Math.abs(e)>=1e21),/**
 * Returns true if the given value is an empty Object.
 *
 * @param v the value to check.
 *
 * @return true if the value is an empty Object, false if not.
 */n.isEmptyObject=e=>n.isObject(e)&&0===Object.keys(e).length,/**
 * Returns true if the given value is a Number.
 *
 * @param v the value to check.
 *
 * @return true if the value is a Number, false if not.
 */n.isNumber=e=>"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e),/**
 * Returns true if the given value is numeric.
 *
 * @param v the value to check.
 *
 * @return true if the value is numeric, false if not.
 */n.isNumeric=e=>!isNaN(parseFloat(e))&&isFinite(e),/**
 * Returns true if the given value is an Object.
 *
 * @param v the value to check.
 *
 * @return true if the value is an Object, false if not.
 */n.isObject=e=>"[object Object]"===Object.prototype.toString.call(e),/**
 * Returns true if the given value is a String.
 *
 * @param v the value to check.
 *
 * @return true if the value is a String, false if not.
 */n.isString=e=>"string"==typeof e||"[object String]"===Object.prototype.toString.call(e),/**
 * Returns true if the given value is undefined.
 *
 * @param v the value to check.
 *
 * @return true if the value is undefined, false if not.
 */n.isUndefined=e=>void 0===e}),n.register("3Yszg",function(e,t){e.exports=class extends Error{/**
   * Creates a JSON-LD Error.
   *
   * @param msg the error message.
   * @param type the error type.
   * @param details the error details.
   */constructor(e="An unspecified JSON-LD error occurred.",t="jsonld.Error",n={}){super(e),this.name=t,this.message=e,this.details=n}}}),n.register("3Umbt",function(e,t){let n="http://www.w3.org/1999/02/22-rdf-syntax-ns#",r="http://www.w3.org/2001/XMLSchema#";e.exports={// TODO: Deprecated and will be removed later. Use LINK_HEADER_CONTEXT.
LINK_HEADER_REL:"http://www.w3.org/ns/json-ld#context",LINK_HEADER_CONTEXT:"http://www.w3.org/ns/json-ld#context",RDF:n,RDF_LIST:n+"List",RDF_FIRST:n+"first",RDF_REST:n+"rest",RDF_NIL:n+"nil",RDF_TYPE:n+"type",RDF_PLAIN_LITERAL:n+"PlainLiteral",RDF_XML_LITERAL:n+"XMLLiteral",RDF_JSON_LITERAL:n+"JSON",RDF_OBJECT:n+"object",RDF_LANGSTRING:n+"langString",XSD:r,XSD_BOOLEAN:r+"boolean",XSD_DOUBLE:r+"double",XSD_INTEGER:r+"integer",XSD_STRING:r+"string"}}),n.register("jUcZG",function(e,t){e.exports=class{/**
   * Creates a simple queue for requesting documents.
   */constructor(){this._requests={}}wrapLoader(e){let t=this;return t._loader=e,function(){return t.add.apply(t,arguments)}}async add(e){let t=this._requests[e];if(t)return Promise.resolve(t);// queue URL and load it
t=this._requests[e]=this._loader(e);try{return await t}finally{delete this._requests[e]}}}}),n.register("c0VXR",function(e,t){var r=n("guzPY");let a={};e.exports=a,// define URL parser
// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
// with local jsonld.js modifications
a.parsers={simple:{// RFC 3986 basic parts
keys:["href","scheme","authority","path","query","fragment"],/* eslint-disable-next-line max-len */regex:/^(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/},full:{keys:["href","protocol","scheme","authority","auth","user","password","hostname","port","path","directory","file","query","fragment"],/* eslint-disable-next-line max-len */regex:/^(([a-zA-Z][a-zA-Z0-9+-.]*):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?(?:(((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/}},a.parse=(e,t)=>{let n={},r=a.parsers[t||"full"],i=r.regex.exec(e),o=r.keys.length;for(;o--;)n[r.keys[o]]=void 0===i[o]?null:i[o];return("https"===n.scheme&&"443"===n.port||"http"===n.scheme&&"80"===n.port)&&(n.href=n.href.replace(":"+n.port,""),n.authority=n.authority.replace(":"+n.port,""),n.port=null),n.normalizedPath=a.removeDotSegments(n.path),n},/**
 * Prepends a base IRI to the given relative IRI.
 *
 * @param base the base IRI.
 * @param iri the relative IRI.
 *
 * @return the absolute IRI.
 */a.prependBase=(e,t)=>{// skip IRI processing
if(null===e||a.isAbsolute(t))return t;(!e||r.isString(e))&&(e=a.parse(e||""));// parse given IRI
let n=a.parse(t),i={protocol:e.protocol||""};if(null!==n.authority)i.authority=n.authority,i.path=n.path,i.query=n.query;else if(i.authority=e.authority,""===n.path)i.path=e.path,null!==n.query?i.query=n.query:i.query=e.query;else{if(0===n.path.indexOf("/"))i.path=n.path;else{// merge paths
let t=e.path;(// append relative path to the end of the last directory from base
(t=t.substr(0,t.lastIndexOf("/")+1)).length>0||e.authority)&&"/"!==t.substr(-1)&&(t+="/"),t+=n.path,i.path=t}i.query=n.query}""!==n.path&&(i.path=a.removeDotSegments(i.path));// construct URL
let o=i.protocol;return null!==i.authority&&(o+="//"+i.authority),o+=i.path,null!==i.query&&(o+="?"+i.query),null!==n.fragment&&(o+="#"+n.fragment),""===o&&(o="./"),o},/**
 * Removes a base IRI from the given absolute IRI.
 *
 * @param base the base IRI.
 * @param iri the absolute IRI.
 *
 * @return the relative IRI if relative to base, otherwise the absolute IRI.
 */a.removeBase=(e,t)=>{// skip IRI processing
if(null===e)return t;(!e||r.isString(e))&&(e=a.parse(e||""));// establish base root
let n="";// IRI not relative to base
if(""!==e.href?n+=(e.protocol||"")+"//"+(e.authority||""):t.indexOf("//")&&(n+="//"),0!==t.indexOf(n))return t;// remove root from IRI and parse remainder
let i=a.parse(t.substr(n.length)),o=e.normalizedPath.split("/"),l=i.normalizedPath.split("/"),s=i.fragment||i.query?0:1;for(;o.length>0&&l.length>s&&o[0]===l[0];)o.shift(),l.shift();// use '../' for each non-matching base segment
let d="";if(o.length>0){// don't count the last segment (if it ends with '/' last path doesn't
// count and if it doesn't end with '/' it isn't a path)
o.pop();for(let e=0;e<o.length;++e)d+="../"}return(// prepend remaining segments
d+=l.join("/"),null!==i.query&&(d+="?"+i.query),null!==i.fragment&&(d+="#"+i.fragment),""===d&&(d="./"),d)},/**
 * Removes dot segments from a URL path.
 *
 * @param path the path to remove dot segments from.
 */a.removeDotSegments=e=>{// RFC 3986 5.2.4 (reworked)
// empty path shortcut
if(0===e.length)return"";let t=e.split("/"),n=[];for(;t.length>0;){let e=t.shift(),r=0===t.length;if("."===e){r&&n.push("");continue}if(".."===e){n.pop(),r&&n.push("");continue}n.push(e)}return("/"===e[0]&&n.length>0&&""!==n[0]&&n.unshift(""),1===n.length&&""===n[0])?"/":n.join("/")};// TODO: time better isAbsolute/isRelative checks using full regexes:
// http://jmrware.com/articles/2009/uri_regexp/URI_regex.html
// regex to check for absolute IRI (starting scheme and ':') or blank node IRI
let i=/^([A-Za-z][A-Za-z0-9+-.]*|_):[^\s]*$/;/**
 * Returns true if the given value is an absolute IRI or blank node IRI, false
 * if not.
 * Note: This weak check only checks for a correct starting scheme.
 *
 * @param v the value to check.
 *
 * @return true if the value is an absolute IRI, false if not.
 */a.isAbsolute=e=>r.isString(e)&&i.test(e),/**
 * Returns true if the given value is a relative IRI, false if not.
 * Note: this is a weak check.
 *
 * @param v the value to check.
 *
 * @return true if the value is a relative IRI, false if not.
 */a.isRelative=e=>r.isString(e)}),n.register("iZefq",function(e,t){var r=n("guzPY"),a=r.isArray,i=r.isObject,o=r.isString,l=n("85rA0").asArray,s=n("c0VXR").prependBase,d=n("3Yszg"),c=n("bXSXW");e.exports=class{/**
   * Creates a ContextResolver.
   *
   * @param sharedCache a shared LRU cache with `get` and `set` APIs.
   */constructor({sharedCache:e}){this.perOpCache=new Map,this.sharedCache=e}async resolve({activeCtx:e,context:t,documentLoader:n,base:r,cycles:s=new Set}){t&&i(t)&&t["@context"]&&(t=t["@context"]),// context is one or more contexts
t=l(t);// resolve each context in the array
let u=[];for(let l of t){if(o(l)){// see if `ctx` has been resolved before...
let t=this._get(l);t||(t=await this._resolveRemoteContext({activeCtx:e,url:l,documentLoader:n,base:r,cycles:s})),a(t)?u.push(...t):u.push(t);continue}if(null===l){// handle `null` context, nothing to cache
u.push(new c({document:null}));continue}i(l)||function(e){throw new d("Invalid JSON-LD syntax; @context must be an object.","jsonld.SyntaxError",{code:"invalid local context",context:e})}(t);// context is an object, get/create `ResolvedContext` for it
let p=JSON.stringify(l),h=this._get(p);h||(// create a new static `ResolvedContext` and cache it
h=new c({document:l}),this._cacheResolvedContext({key:p,resolved:h,tag:"static"})),u.push(h)}return u}_get(e){// get key from per operation cache; no `tag` is used with this cache so
// any retrieved context will always be the same during a single operation
let t=this.perOpCache.get(e);if(!t){// see if the shared cache has a `static` entry for this URL
let n=this.sharedCache.get(e);n&&(t=n.get("static"))&&this.perOpCache.set(e,t)}return t}_cacheResolvedContext({key:e,resolved:t,tag:n}){if(this.perOpCache.set(e,t),void 0!==n){let r=this.sharedCache.get(e);r||(r=new Map,this.sharedCache.set(e,r)),r.set(n,t)}return t}async _resolveRemoteContext({activeCtx:e,url:t,documentLoader:n,base:r,cycles:l}){// resolve relative URL and fetch context
t=s(r,t);let{context:d,remoteDoc:c}=await this._fetchContext({activeCtx:e,url:t,documentLoader:n,cycles:l});/**
 * Resolve all relative `@context` URLs in the given context by inline
 * replacing them with absolute URLs.
 *
 * @param context the context.
 * @param base the base IRI to use to resolve relative IRIs.
 */(function e({context:t,base:n}){if(!t)return;let r=t["@context"];if(o(r)){t["@context"]=s(n,r);return}if(a(r)){for(let t=0;t<r.length;++t){let a=r[t];if(o(a)){r[t]=s(n,a);continue}i(a)&&e({context:{"@context":a},base:n})}return}if(i(r))// ctx is an object, resolve any context URLs in terms
for(let t in r)e({context:r[t],base:n})})({context:d,base:// update base according to remote document and resolve any relative URLs
r=c.documentUrl||t});// resolve, cache, and return context
let u=await this.resolve({activeCtx:e,context:d,documentLoader:n,base:r,cycles:l});return this._cacheResolvedContext({key:t,resolved:u,tag:c.tag}),u}async _fetchContext({activeCtx:e,url:t,documentLoader:n,cycles:r}){let l,s;// check for max context URLs fetched during a resolve operation
if(r.size>10)throw new d("Maximum number of @context URLs exceeded.","jsonld.ContextUrlError",{code:"json-ld-1.0"===e.processingMode?"loading remote context failed":"context overflow",max:10});// check for context URL cycle
// shortcut to avoid extra work that would eventually hit the max above
if(r.has(t))throw new d("Cyclical @context URLs detected.","jsonld.ContextUrlError",{code:"json-ld-1.0"===e.processingMode?"recursive context inclusion":"context overflow",url:t});// track cycles
r.add(t);try{l=(s=await n(t)).document||null,o(l)&&(l=JSON.parse(l))}catch(e){throw new d("Dereferencing a URL did not result in a valid JSON-LD object. Possible causes are an inaccessible URL perhaps due to a same-origin policy (ensure the server uses CORS if you are using client-side JavaScript), too many redirects, a non-JSON response, or more than one HTTP Link Header was provided for a remote context.","jsonld.InvalidUrl",{code:"loading remote context failed",url:t,cause:e})}// ensure ctx is an object
if(!i(l))throw new d("Dereferencing a URL did not result in a JSON object. The response was valid JSON, but it was not a JSON object.","jsonld.InvalidUrl",{code:"invalid remote context",url:t});return l="@context"in l?{"@context":l["@context"]}:{"@context":{}},s.contextUrl&&(a(l["@context"])||(l["@context"]=[l["@context"]]),l["@context"].push(s.contextUrl)),{context:l,remoteDoc:s}}}}),n.register("bXSXW",function(e,t){var r=n("bnToR");e.exports=class{/**
   * Creates a ResolvedContext.
   *
   * @param document the context document.
   */constructor({document:e}){this.document=e,// TODO: enable customization of processed context cache
// TODO: limit based on size of processed contexts vs. number of them
this.cache=new r({max:10})}getProcessed(e){return this.cache.get(e)}setProcessed(e,t){this.cache.set(e,t)}}}),n.register("bnToR",function(e,t){var r=n("5qBd4");let a=Symbol("max"),i=Symbol("length"),o=Symbol("lengthCalculator"),l=Symbol("allowStale"),s=Symbol("maxAge"),d=Symbol("dispose"),c=Symbol("noDisposeOnSet"),u=Symbol("lruList"),p=Symbol("cache"),h=Symbol("updateAgeOnGet"),f=()=>1,v=(e,t,n)=>{let r=e[p].get(t);if(r){let t=r.value;if(g(e,t)){if(m(e,r),!e[l])return}else n&&(e[h]&&(r.value.now=Date.now()),e[u].unshiftNode(r));return t.value}},g=(e,t)=>{if(!t||!t.maxAge&&!e[s])return!1;let n=Date.now()-t.now;return t.maxAge?n>t.maxAge:e[s]&&n>e[s]},y=e=>{if(e[i]>e[a])for(let t=e[u].tail;e[i]>e[a]&&null!==t;){// We know that we're about to delete this one, and also
// what the next least recently used key will be, so just
// go ahead and set it now.
let n=t.prev;m(e,t),t=n}},m=(e,t)=>{if(t){let n=t.value;e[d]&&e[d](n.key,n.value),e[i]-=n.length,e[p].delete(n.key),e[u].removeNode(t)}};class x{constructor(e,t,n,r,a){this.key=e,this.value=t,this.length=n,this.now=r,this.maxAge=a||0}}let b=(e,t,n,r)=>{let a=n.value;g(e,a)&&(m(e,n),e[l]||(a=void 0)),a&&t.call(r,a.value,a.key,e)};e.exports=// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class{constructor(e){if("number"==typeof e&&(e={max:e}),e||(e={}),e.max&&("number"!=typeof e.max||e.max<0))throw TypeError("max must be a non-negative number");this[a]=e.max||1/0;let t=e.length||f;if(this[o]="function"!=typeof t?f:t,this[l]=e.stale||!1,e.maxAge&&"number"!=typeof e.maxAge)throw TypeError("maxAge must be a number");this[s]=e.maxAge||0,this[d]=e.dispose,this[c]=e.noDisposeOnSet||!1,this[h]=e.updateAgeOnGet||!1,this.reset()}// resize the cache when the max changes.
set max(e){if("number"!=typeof e||e<0)throw TypeError("max must be a non-negative number");this[a]=e||1/0,y(this)}get max(){return this[a]}set allowStale(e){this[l]=!!e}get allowStale(){return this[l]}set maxAge(e){if("number"!=typeof e)throw TypeError("maxAge must be a non-negative number");this[s]=e,y(this)}get maxAge(){return this[s]}// resize the cache when the lengthCalculator changes.
set lengthCalculator(e){"function"!=typeof e&&(e=f),e!==this[o]&&(this[o]=e,this[i]=0,this[u].forEach(e=>{e.length=this[o](e.value,e.key),this[i]+=e.length})),y(this)}get lengthCalculator(){return this[o]}get length(){return this[i]}get itemCount(){return this[u].length}rforEach(e,t){t=t||this;for(let n=this[u].tail;null!==n;){let r=n.prev;b(this,e,n,t),n=r}}forEach(e,t){t=t||this;for(let n=this[u].head;null!==n;){let r=n.next;b(this,e,n,t),n=r}}keys(){return this[u].toArray().map(e=>e.key)}values(){return this[u].toArray().map(e=>e.value)}reset(){this[d]&&this[u]&&this[u].length&&this[u].forEach(e=>this[d](e.key,e.value)),this[p]=new Map// hash of items by key
,this[u]=new r// list of items in order of use recency
,this[i]=0// length of items in the list
}dump(){return this[u].map(e=>!g(this,e)&&{k:e.key,v:e.value,e:e.now+(e.maxAge||0)}).toArray().filter(e=>e)}dumpLru(){return this[u]}set(e,t,n){if((n=n||this[s])&&"number"!=typeof n)throw TypeError("maxAge must be a number");let r=n?Date.now():0,l=this[o](t,e);if(this[p].has(e)){if(l>this[a])return m(this,this[p].get(e)),!1;let o=this[p].get(e),s=o.value;return this[d]&&!this[c]&&this[d](e,s.value),s.now=r,s.maxAge=n,s.value=t,this[i]+=l-s.length,s.length=l,this.get(e),y(this),!0}let h=new x(e,t,l,r,n);return(// oversized objects fall out of cache automatically.
h.length>this[a]?(this[d]&&this[d](e,t),!1):(this[i]+=h.length,this[u].unshift(h),this[p].set(e,this[u].head),y(this),!0))}has(e){if(!this[p].has(e))return!1;let t=this[p].get(e).value;return!g(this,t)}get(e){return v(this,e,!0)}peek(e){return v(this,e,!1)}pop(){let e=this[u].tail;return e?(m(this,e),e.value):null}del(e){m(this,this[p].get(e))}load(e){// reset the cache
this.reset();let t=Date.now();// A previous serialized cache has the most recent items first
for(let n=e.length-1;n>=0;n--){let r=e[n],a=r.e||0;if(0===a)this.set(r.k,r.v);else{let e=a-t;e>0&&this.set(r.k,r.v,e)}}}prune(){this[p].forEach((e,t)=>v(this,t,!1))}}}),n.register("5qBd4",function(e,t){function r(e){var t=this;if(t instanceof r||(t=new r),t.tail=null,t.head=null,t.length=0,e&&"function"==typeof e.forEach)e.forEach(function(e){t.push(e)});else if(arguments.length>0)for(var n=0,a=arguments.length;n<a;n++)t.push(arguments[n]);return t}function a(e,t,n,r){if(!(this instanceof a))return new a(e,t,n,r);this.list=r,this.value=e,t?(t.next=this,this.prev=t):this.prev=null,n?(n.prev=this,this.next=n):this.next=null}e.exports=r,r.Node=a,r.create=r,r.prototype.removeNode=function(e){if(e.list!==this)throw Error("removing node which does not belong to this list");var t=e.next,n=e.prev;return t&&(t.prev=n),n&&(n.next=t),e===this.head&&(this.head=t),e===this.tail&&(this.tail=n),e.list.length--,e.next=null,e.prev=null,e.list=null,t},r.prototype.unshiftNode=function(e){if(e!==this.head){e.list&&e.list.removeNode(e);var t=this.head;e.list=this,e.next=t,t&&(t.prev=e),this.head=e,this.tail||(this.tail=e),this.length++}},r.prototype.pushNode=function(e){if(e!==this.tail){e.list&&e.list.removeNode(e);var t=this.tail;e.list=this,e.prev=t,t&&(t.next=e),this.tail=e,this.head||(this.head=e),this.length++}},r.prototype.push=function(){for(var e,t=0,n=arguments.length;t<n;t++)e=arguments[t],this.tail=new a(e,this.tail,null,this),this.head||(this.head=this.tail),this.length++;return this.length},r.prototype.unshift=function(){for(var e,t=0,n=arguments.length;t<n;t++)e=arguments[t],this.head=new a(e,null,this.head,this),this.tail||(this.tail=this.head),this.length++;return this.length},r.prototype.pop=function(){if(this.tail){var e=this.tail.value;return this.tail=this.tail.prev,this.tail?this.tail.next=null:this.head=null,this.length--,e}},r.prototype.shift=function(){if(this.head){var e=this.head.value;return this.head=this.head.next,this.head?this.head.prev=null:this.tail=null,this.length--,e}},r.prototype.forEach=function(e,t){t=t||this;for(var n=this.head,r=0;null!==n;r++)e.call(t,n.value,r,this),n=n.next},r.prototype.forEachReverse=function(e,t){t=t||this;for(var n=this.tail,r=this.length-1;null!==n;r--)e.call(t,n.value,r,this),n=n.prev},r.prototype.get=function(e){for(var t=0,n=this.head;null!==n&&t<e;t++)n=n.next;if(t===e&&null!==n)return n.value},r.prototype.getReverse=function(e){for(var t=0,n=this.tail;null!==n&&t<e;t++)n=n.prev;if(t===e&&null!==n)return n.value},r.prototype.map=function(e,t){t=t||this;for(var n=new r,a=this.head;null!==a;)n.push(e.call(t,a.value,this)),a=a.next;return n},r.prototype.mapReverse=function(e,t){t=t||this;for(var n=new r,a=this.tail;null!==a;)n.push(e.call(t,a.value,this)),a=a.prev;return n},r.prototype.reduce=function(e,t){var n,r=this.head;if(arguments.length>1)n=t;else if(this.head)r=this.head.next,n=this.head.value;else throw TypeError("Reduce of empty list with no initial value");for(var a=0;null!==r;a++)n=e(n,r.value,a),r=r.next;return n},r.prototype.reduceReverse=function(e,t){var n,r=this.tail;if(arguments.length>1)n=t;else if(this.tail)r=this.tail.prev,n=this.tail.value;else throw TypeError("Reduce of empty list with no initial value");for(var a=this.length-1;null!==r;a--)n=e(n,r.value,a),r=r.prev;return n},r.prototype.toArray=function(){for(var e=Array(this.length),t=0,n=this.head;null!==n;t++)e[t]=n.value,n=n.next;return e},r.prototype.toArrayReverse=function(){for(var e=Array(this.length),t=0,n=this.tail;null!==n;t++)e[t]=n.value,n=n.prev;return e},r.prototype.slice=function(e,t){(t=t||this.length)<0&&(t+=this.length),(e=e||0)<0&&(e+=this.length);var n=new r;if(t<e||t<0)return n;e<0&&(e=0),t>this.length&&(t=this.length);for(var a=0,i=this.head;null!==i&&a<e;a++)i=i.next;for(;null!==i&&a<t;a++,i=i.next)n.push(i.value);return n},r.prototype.sliceReverse=function(e,t){(t=t||this.length)<0&&(t+=this.length),(e=e||0)<0&&(e+=this.length);var n=new r;if(t<e||t<0)return n;e<0&&(e=0),t>this.length&&(t=this.length);for(var a=this.length,i=this.tail;null!==i&&a>t;a--)i=i.prev;for(;null!==i&&a>e;a--,i=i.prev)n.push(i.value);return n},r.prototype.splice=function(e,t,...n){e>this.length&&(e=this.length-1),e<0&&(e=this.length+e);for(var r=0,i=this.head;null!==i&&r<e;r++)i=i.next;for(var o=[],r=0;i&&r<t;r++)o.push(i.value),i=this.removeNode(i);null===i&&(i=this.tail),i!==this.head&&i!==this.tail&&(i=i.prev);for(var r=0;r<n.length;r++)i=function(e,t,n){var r=t===e.head?new a(n,null,t,e):new a(n,t,t.next,e);return null===r.next&&(e.tail=r),null===r.prev&&(e.head=r),e.length++,r}(this,i,n[r]);return o},r.prototype.reverse=function(){for(var e=this.head,t=this.tail,n=e;null!==n;n=n.prev){var r=n.prev;n.prev=n.next,n.next=r}return this.head=t,this.tail=e,this};try{// add if support for Symbol.iterator is present
n("fcGo5")(r)}catch(e){}}),n.register("fcGo5",function(e,t){e.exports=function(e){e.prototype[Symbol.iterator]=function*(){for(let e=this.head;e;e=e.next)yield e.value}}}),n.register("fl0q4",function(e,t){// TODO: move `NQuads` to its own package
e.exports=n("h0LIu").NQuads}),n.register("a4Pom",function(e,t){var r=n("3Yszg"),a=n("guzPY"),i=a.isArray,o=a.isObject,l=a.isEmptyObject,s=a.isString,d=a.isUndefined,c=n("dEapz"),u=c.isList,p=c.isValue,h=c.isGraph,f=c.isSubject,v=n("frGHZ"),g=v.expandIri,y=v.getContextValue,m=v.isKeyword,x=v.process,b=v.processingMode,w=n("c0VXR").isAbsolute,j=n("85rA0"),I=j.REGEX_BCP47,N=j.REGEX_KEYWORD,S=j.addValue,E=j.asArray,O=j.getValues,k=j.validateTypeValue,D=n("8qp2g").handleEvent;let C={};/**
 * Drop empty object, top-level @value/@list, or object with only @id
 *
 * @param value Value to check.
 * @param count Number of properties in object.
 * @param options The expansion options.
 *
 * @return null if dropped, value otherwise.
 */function L({value:e,count:t,options:n}){if(0===t||"@value"in e||"@list"in e||1===t&&"@id"in e){// FIXME
if(n.eventHandler){// FIXME: one event or diff event for empty, @v/@l, {@id}?
let r,a;0===t?(r="empty object",a="Dropping empty object."):"@value"in e?(r="object with only @value",a="Dropping object with only @value."):"@list"in e?(r="object with only @list",a="Dropping object with only @list."):1===t&&"@id"in e&&(r="object with only @id",a="Dropping object with only @id."),D({event:{type:["JsonLdEvent"],code:r,level:"warning",message:a,details:{value:e}},options:n})}return null}return e}/**
 * Expand each key and value of element adding to result
 *
 * @param activeCtx the context to use.
 * @param activeProperty the property for the element.
 * @param expandedActiveProperty the expansion of activeProperty
 * @param element the element to expand.
 * @param expandedParent the expanded result into which to add values.
 * @param options the expansion options.
 * @param insideList true if the element is a list, false if not.
 * @param typeKey first key found expanding to @type.
 * @param typeScopedContext the context before reverting.
 */async function R({activeCtx:e,activeProperty:t,expandedActiveProperty:n,element:a,expandedParent:c,options:h={},insideList:v,typeKey:j,typeScopedContext:N}){let O;let A=Object.keys(a).sort(),_=[],P=a[j]&&"@json"===g(e,i(a[j])?a[j][0]:a[j],{vocab:!0},{...h,typeExpansion:!0});for(let v of A){let j,R=a[v];// skip @context
if("@context"===v)continue;// expand property
let A=g(e,v,{vocab:!0},h);// drop non-absolute IRI keys that aren't keywords
if(null===A||!(w(A)||m(A))){h.eventHandler&&D({event:{type:["JsonLdEvent"],code:"invalid property",level:"warning",message:"Dropping property that did not expand into an absolute IRI or keyword.",details:{property:v,expandedProperty:A}},options:h});continue}if(m(A)){if("@reverse"===n)throw new r("Invalid JSON-LD syntax; a keyword cannot be used as a @reverse property.","jsonld.SyntaxError",{code:"invalid reverse property map",value:R});if(A in c&&"@included"!==A&&"@type"!==A)throw new r("Invalid JSON-LD syntax; colliding keywords detected.","jsonld.SyntaxError",{code:"colliding keywords",keyword:A})}// syntax error if @id is not a string
if("@id"===A){if(!s(R)){if(!h.isFrame)throw new r('Invalid JSON-LD syntax; "@id" value must a string.',"jsonld.SyntaxError",{code:"invalid @id value",value:R});if(o(R))// empty object is a wildcard
{if(!l(R))throw new r('Invalid JSON-LD syntax; "@id" value an empty object or array of strings, if framing',"jsonld.SyntaxError",{code:"invalid @id value",value:R})}else if(i(R)){if(!R.every(e=>s(e)))throw new r('Invalid JSON-LD syntax; "@id" value an empty object or array of strings, if framing',"jsonld.SyntaxError",{code:"invalid @id value",value:R})}else throw new r('Invalid JSON-LD syntax; "@id" value an empty object or array of strings, if framing',"jsonld.SyntaxError",{code:"invalid @id value",value:R})}S(c,"@id",E(R).map(t=>{if(s(t)){let n=g(e,t,{base:!0},h);return h.eventHandler&&(null===n?null===t?D({event:{type:["JsonLdEvent"],code:"null @id value",level:"warning",message:"Null @id found.",details:{id:t}},options:h}):D({event:{type:["JsonLdEvent"],code:"reserved @id value",level:"warning",message:"Reserved @id found.",details:{id:t}},options:h}):w(n)||D({event:{type:["JsonLdEvent"],code:"relative @id reference",level:"warning",message:"Relative @id reference found.",details:{id:t,expandedId:n}},options:h})),n}return t}),{propertyIsArray:h.isFrame});continue}if("@type"===A){o(R)&&(R=Object.fromEntries(Object.entries(R).map(([e,t])=>[g(N,e,{vocab:!0}),E(t).map(e=>g(N,e,{base:!0,vocab:!0},{...h,typeExpansion:!0}))]))),k(R,h.isFrame),S(c,"@type",E(R).map(e=>{if(s(e)){let t=g(N,e,{base:!0,vocab:!0},{...h,typeExpansion:!0});return"@json"!==t&&!w(t)&&h.eventHandler&&D({event:{type:["JsonLdEvent"],code:"relative @type reference",level:"warning",message:"Relative @type reference found.",details:{type:e}},options:h}),t}return e}),{propertyIsArray:!!h.isFrame});continue}// Included blocks are treated as an array of separate object nodes sharing
// the same referencing active_property.
// For 1.0, it is skipped as are other unknown keywords
if("@included"===A&&b(e,1.1)){let n=E(await C.expand({activeCtx:e,activeProperty:t,element:R,options:h}));// Expanded values must be node objects
if(!n.every(e=>f(e)))throw new r("Invalid JSON-LD syntax; values of @included must expand to node objects.","jsonld.SyntaxError",{code:"invalid @included value",value:R});S(c,"@included",n,{propertyIsArray:!0});continue}// @graph must be an array or an object
if("@graph"===A&&!(o(R)||i(R)))throw new r('Invalid JSON-LD syntax; "@graph" value must not be an object or an array.',"jsonld.SyntaxError",{code:"invalid @graph value",value:R});if("@value"===A){// capture value for later
// "colliding keywords" check prevents this from being set twice
O=R,P&&b(e,1.1)?c["@value"]=R:S(c,"@value",R,{propertyIsArray:h.isFrame});continue}// @language must be a string
// it should match BCP47
if("@language"===A){if(null===R)continue;if(!s(R)&&!h.isFrame)throw new r('Invalid JSON-LD syntax; "@language" value must be a string.',"jsonld.SyntaxError",{code:"invalid language-tagged string",value:R});// ensure language tag matches BCP47
for(let e of // ensure language value is lowercase
R=E(R).map(e=>s(e)?e.toLowerCase():e))s(e)&&!e.match(I)&&h.eventHandler&&D({event:{type:["JsonLdEvent"],code:"invalid @language value",level:"warning",message:"@language value must be valid BCP47.",details:{language:e}},options:h});S(c,"@language",R,{propertyIsArray:h.isFrame});continue}// @direction must be "ltr" or "rtl"
if("@direction"===A){if(!s(R)&&!h.isFrame)throw new r('Invalid JSON-LD syntax; "@direction" value must be a string.',"jsonld.SyntaxError",{code:"invalid base direction",value:R});// ensure direction is "ltr" or "rtl"
for(let e of R=E(R))if(s(e)&&"ltr"!==e&&"rtl"!==e)throw new r('Invalid JSON-LD syntax; "@direction" must be "ltr" or "rtl".',"jsonld.SyntaxError",{code:"invalid base direction",value:R});S(c,"@direction",R,{propertyIsArray:h.isFrame});continue}// @index must be a string
if("@index"===A){if(!s(R))throw new r('Invalid JSON-LD syntax; "@index" value must be a string.',"jsonld.SyntaxError",{code:"invalid @index value",value:R});S(c,"@index",R);continue}// @reverse must be an object
if("@reverse"===A){if(!o(R))throw new r('Invalid JSON-LD syntax; "@reverse" value must be an object.',"jsonld.SyntaxError",{code:"invalid @reverse value",value:R});// properties double-reversed
if("@reverse"in(j=await C.expand({activeCtx:e,activeProperty:"@reverse",element:R,options:h})))for(let e in j["@reverse"])S(c,e,j["@reverse"][e],{propertyIsArray:!0});// FIXME: can this be merged with code below to simplify?
// merge in all reversed properties
let t=c["@reverse"]||null;for(let e in j){if("@reverse"===e)continue;null===t&&(t=c["@reverse"]={}),S(t,e,[],{propertyIsArray:!0});let n=j[e];for(let a=0;a<n.length;++a){let i=n[a];if(p(i)||u(i))throw new r('Invalid JSON-LD syntax; "@reverse" value must not be a @value or an @list.',"jsonld.SyntaxError",{code:"invalid reverse property value",value:j});S(t,e,i,{propertyIsArray:!0})}}continue}// nested keys
if("@nest"===A){_.push(v);continue}// use potential scoped context for key
let M=e,J=y(e,v,"@context");d(J)||(M=await x({activeCtx:e,localCtx:J,propagate:!0,overrideProtected:!0,options:h}));let H=y(M,v,"@container")||[];if(H.includes("@language")&&o(R)){let e=y(M,v,"@direction");// handle language map container (skip if value is not an object)
j=/**
 * Expands a language map.
 *
 * @param activeCtx the active context to use.
 * @param languageMap the language map to expand.
 * @param direction the direction to apply to values.
 * @param {Object} [options] - processing options.
 *
 * @return the expanded language map.
 */function(e,t,n,a){let o=[],l=Object.keys(t).sort();for(let d of l){let l=g(e,d,{vocab:!0},a),c=t[d];for(let e of(i(c)||(c=[c]),c)){if(null===e)continue;if(!s(e))throw new r("Invalid JSON-LD syntax; language map values must be strings.","jsonld.SyntaxError",{code:"invalid language map value",languageMap:t});let i={"@value":e};"@none"!==l&&(!d.match(I)&&a.eventHandler&&D({event:{type:["JsonLdEvent"],code:"invalid @language value",level:"warning",message:"@language value must be valid BCP47.",details:{language:d}},options:a}),i["@language"]=d.toLowerCase()),n&&(i["@direction"]=n),o.push(i)}}return o}(M,R,e,h)}else if(H.includes("@index")&&o(R)){// handle index container (skip if value is not an object)
let t=H.includes("@graph"),n=y(M,v,"@index")||"@index",r="@index"!==n&&g(e,n,{vocab:!0},h);j=await T({activeCtx:M,options:h,activeProperty:v,value:R,asGraph:t,indexKey:n,propertyIndex:r})}else if(H.includes("@id")&&o(R)){// handle id container (skip if value is not an object)
let e=H.includes("@graph");j=await T({activeCtx:M,options:h,activeProperty:v,value:R,asGraph:e,indexKey:"@id"})}else if(H.includes("@type")&&o(R))j=await T({// since container is `@type`, revert type scoped context when expanding
activeCtx:M.revertToPreviousContext(),options:h,activeProperty:v,value:R,asGraph:!1,indexKey:"@type"});else{// recurse into @list or @set
let r="@list"===A;if(r||"@set"===A){let e=t;r&&"@graph"===n&&(e=null),j=await C.expand({activeCtx:M,activeProperty:e,element:R,options:h,insideList:r})}else j="@json"===y(e,v,"@type")?{"@type":"@json","@value":R}:await C.expand({activeCtx:M,activeProperty:v,element:R,options:h,insideList:!1})}// drop null values if property is not @value
if(null!==j||"@value"===A){// convert expanded value to @graph if container specifies it
// and value is not, itself, a graph
// index cases handled above
if("@list"!==A&&!u(j)&&H.includes("@list")&&(j={"@list":E(j)}),H.includes("@graph")&&!H.some(e=>"@id"===e||"@index"===e)){if(// ensure expanded values are in an array
j=E(j),h.isFrame||(j=j.filter(e=>{let t=Object.keys(e).length;return null!==L({value:e,count:t,options:h})})),0===j.length)continue;// convert to graph
j=j.map(e=>({"@graph":E(e)}))}// FIXME: can this be merged with code above to simplify?
// merge in reverse properties
if(M.mappings.has(v)&&M.mappings.get(v).reverse){let e=c["@reverse"]=c["@reverse"]||{};j=E(j);for(let t=0;t<j.length;++t){let n=j[t];if(p(n)||u(n))throw new r('Invalid JSON-LD syntax; "@reverse" value must not be a @value or an @list.',"jsonld.SyntaxError",{code:"invalid reverse property value",value:j});S(e,A,n,{propertyIsArray:!0})}continue}// add value for property
// special keywords handled above
S(c,A,j,{propertyIsArray:!0})}}// @value must not be an object or an array (unless framing) or if @type is
// @json
if("@value"in c){if("@json"===c["@type"]&&b(e,1.1));else if((o(O)||i(O))&&!h.isFrame)throw new r('Invalid JSON-LD syntax; "@value" value must not be an object or an array.',"jsonld.SyntaxError",{code:"invalid value object value",value:O})}// expand each nested key
for(let l of _){let s=i(a[l])?a[l]:[a[l]];for(let a of s){if(!o(a)||Object.keys(a).some(t=>"@value"===g(e,t,{vocab:!0},h)))throw new r("Invalid JSON-LD syntax; nested value must be a node object.","jsonld.SyntaxError",{code:"invalid @nest value",value:a});await R({activeCtx:e,activeProperty:t,expandedActiveProperty:n,element:a,expandedParent:c,options:h,insideList:v,typeScopedContext:N,typeKey:j})}}}/**
 * Expands the given value by using the coercion and keyword rules in the
 * given context.
 *
 * @param activeCtx the active context to use.
 * @param activeProperty the active property the value is associated with.
 * @param value the value to expand.
 * @param {Object} [options] - processing options.
 *
 * @return the expanded value.
 */function A({activeCtx:e,activeProperty:t,value:n,options:r}){// nothing to expand
if(null==n)return null;// special-case expand @id and @type (skips '@id' expansion)
let a=g(e,t,{vocab:!0},r);if("@id"===a)return g(e,n,{base:!0},r);if("@type"===a)return g(e,n,{vocab:!0,base:!0},{...r,typeExpansion:!0});// get type definition from context
let i=y(e,t,"@type");// do @id expansion (automatic for @graph)
if(("@id"===i||"@graph"===a)&&s(n)){let a=g(e,n,{base:!0},r);return null===a&&n.match(N)&&r.eventHandler&&D({event:{type:["JsonLdEvent"],code:"reserved @id value",level:"warning",message:"Reserved @id found.",details:{id:t}},options:r}),{"@id":a}}// do @id expansion w/vocab
if("@vocab"===i&&s(n))return{"@id":g(e,n,{vocab:!0,base:!0},r)};// do not expand keyword values
if(m(a))return n;let o={};if(i&&!["@id","@vocab","@none"].includes(i))o["@type"]=i;else if(s(n)){// check for language tagging for strings
let n=y(e,t,"@language");null!==n&&(o["@language"]=n);let r=y(e,t,"@direction");null!==r&&(o["@direction"]=r)}return["boolean","number","string"].includes(typeof n)||(n=n.toString()),o["@value"]=n,o}async function T({activeCtx:e,options:t,activeProperty:n,value:a,asGraph:o,indexKey:l,propertyIndex:s}){let c=[],u=Object.keys(a).sort(),f="@type"===l;for(let v of u){let u;// if indexKey is @type, there may be a context defined for it
if(f){let n=y(e,v,"@context");d(n)||(e=await x({activeCtx:e,localCtx:n,propagate:!1,options:t}))}let m=a[v];for(let a of(i(m)||(m=[m]),m=await C.expand({activeCtx:e,activeProperty:n,element:m,options:t,insideList:!1,insideIndex:!0}),u=s?"@none"===v?"@none":A({activeCtx:e,activeProperty:l,value:v,options:t}):g(e,v,{vocab:!0},t),"@id"===l?v=g(e,v,{base:!0},t):f&&(v=u),m)){if(o&&!h(a)&&(a={"@graph":[a]}),"@type"===l)"@none"===u||(a["@type"]?a["@type"]=[v].concat(a["@type"]):a["@type"]=[v]);else if(p(a)&&!["@language","@type","@index"].includes(l))throw new r(`Invalid JSON-LD syntax; Attempt to add illegal key to value object: "${l}".`,"jsonld.SyntaxError",{code:"invalid value object",value:a});else s?"@none"!==u&&S(a,s,u,{propertyIsArray:!0,prependValue:!0}):"@none"===u||l in a||(a[l]=v);c.push(a)}}return c}e.exports=C,/**
 * Recursively expands an element using the given context. Any context in
 * the element will be removed. All context URLs must have been retrieved
 * before calling this method.
 *
 * @param activeCtx the context to use.
 * @param activeProperty the property for the element, null for none.
 * @param element the element to expand.
 * @param options the expansion options.
 * @param insideList true if the element is a list, false if not.
 * @param insideIndex true if the element is inside an index container,
 *          false if not.
 * @param typeScopedContext an optional type-scoped active context for
 *          expanding values of nodes that were expressed according to
 *          a type-scoped context.
 *
 * @return a Promise that resolves to the expanded value.
 */C.expand=async({activeCtx:e,activeProperty:t=null,element:n,options:a={},insideList:c=!1,insideIndex:u=!1,typeScopedContext:p=null})=>{// nothing to expand
if(null==n)return null;if("@default"===t&&(a=Object.assign({},a,{isFrame:!1})),!i(n)&&!o(n))return(// drop free-floating scalars that are not in lists
c||null!==t&&"@graph"!==g(e,t,{vocab:!0},a)?A({activeCtx:e,activeProperty:t,value:n,options:a}):(a.eventHandler&&D({event:{type:["JsonLdEvent"],code:"free-floating scalar",level:"warning",message:"Dropping free-floating scalar not in a list.",details:{value:n}},options:a}),null));// recursively expand array
if(i(n)){let r=[],o=y(e,t,"@container")||[];c=c||o.includes("@list");for(let o=0;o<n.length;++o){// expand element
let l=await C.expand({activeCtx:e,activeProperty:t,element:n[o],options:a,insideIndex:u,typeScopedContext:p});c&&i(l)&&(l={"@list":l}),null!==l&&(i(l)?r=r.concat(l):r.push(l))}return r}// recursively expand object:
// first, expand the active property
let h=g(e,t,{vocab:!0},a),f=y(e,t,"@context");// second, determine if any type-scoped context should be reverted; it
// should only be reverted when the following are all true:
// 1. `element` is not a value or subject reference
// 2. `insideIndex` is false
p=p||(e.previousContext?e:null);let v=Object.keys(n).sort(),m=!u;if(m&&p&&v.length<=2&&!v.includes("@context"))for(let t of v){let n=g(p,t,{vocab:!0},a);if("@value"===n){// value found, ensure type-scoped context is used to expand it
m=!1,e=p;break}if("@id"===n&&1===v.length){// subject reference found, do not revert
m=!1;break}}m&&(e=e.revertToPreviousContext()),d(f)||(e=await x({activeCtx:e,localCtx:f,propagate:!0,overrideProtected:!0,options:a})),"@context"in n&&(e=await x({activeCtx:e,localCtx:n["@context"],options:a})),// set the type-scoped context to the context on input, for use later
p=e;// Remember the first key found expanding to @type
let j=null;// look for scoped contexts on `@type`
for(let t of v){let r=g(e,t,{vocab:!0},a);if("@type"===r){// set scoped contexts from @type
// avoid sorting if possible
j=j||t;let r=n[t],i=Array.isArray(r)?r.length>1?r.slice().sort():r:[r];for(let t of i){let n=y(p,t,"@context");d(n)||(e=await x({activeCtx:e,localCtx:n,options:a,propagate:!1}))}}}// process each key and value in element, ignoring @nest content
let I={};await R({activeCtx:e,activeProperty:t,expandedActiveProperty:h,element:n,expandedParent:I,options:a,insideList:c,typeKey:j,typeScopedContext:p});let N=// get property count on expanded output
(v=Object.keys(I)).length;if("@value"in I){// @value must only have @language or @type
if("@type"in I&&("@language"in I||"@direction"in I))throw new r('Invalid JSON-LD syntax; an element containing "@value" may not contain both "@type" and either "@language" or "@direction".',"jsonld.SyntaxError",{code:"invalid value object",element:I});let t=N-1;if("@type"in I&&(t-=1),"@index"in I&&(t-=1),"@language"in I&&(t-=1),"@direction"in I&&(t-=1),0!==t)throw new r('Invalid JSON-LD syntax; an element containing "@value" may only have an "@index" property and either "@type" or either or both "@language" or "@direction".',"jsonld.SyntaxError",{code:"invalid value object",element:I});let n=null===I["@value"]?[]:E(I["@value"]),i=O(I,"@type");// drop null @values
if(b(e,1.1)&&i.includes("@json")&&1===i.length);else if(0===n.length)a.eventHandler&&D({event:{type:["JsonLdEvent"],code:"null @value value",level:"warning",message:"Dropping null @value value.",details:{value:I}},options:a}),I=null;else if(!n.every(e=>s(e)||l(e))&&"@language"in I)throw new r("Invalid JSON-LD syntax; only strings may be language-tagged.","jsonld.SyntaxError",{code:"invalid language-tagged value",element:I});else if(!i.every(e=>w(e)&&!(s(e)&&0===e.indexOf("_:"))||l(e)))throw new r('Invalid JSON-LD syntax; an element containing "@value" and "@type" must have an absolute IRI for the value of "@type".',"jsonld.SyntaxError",{code:"invalid typed value",element:I})}else if("@type"in I&&!i(I["@type"]))I["@type"]=[I["@type"]];else if("@set"in I||"@list"in I){// handle @set and @list
if(N>1&&!(2===N&&"@index"in I))throw new r('Invalid JSON-LD syntax; if an element has the property "@set" or "@list", then it can have at most one other property that is "@index".',"jsonld.SyntaxError",{code:"invalid set or list object",element:I});"@set"in I&&(N=(v=Object.keys(I=I["@set"])).length)}else 1===N&&"@language"in I&&(a.eventHandler&&D({event:{type:["JsonLdEvent"],code:"object with only @language",level:"warning",message:"Dropping object with only @language.",details:{value:I}},options:a}),I=null);return o(I)&&!a.keepFreeFloatingNodes&&!c&&(null===t||"@graph"===h||(y(e,t,"@container")||[]).includes("@graph"))&&(I=L({value:I,count:N,options:a})),I}}),n.register("frGHZ",function(e,t){var r=n("85rA0"),a=n("3Yszg"),i=n("guzPY"),o=i.isArray,l=i.isObject,s=i.isString,d=i.isUndefined,c=n("c0VXR"),u=c.isAbsolute,p=c.isRelative,h=c.prependBase,f=n("8qp2g").handleEvent,r=n("85rA0"),v=r.REGEX_BCP47,g=r.REGEX_KEYWORD,y=r.asArray,m=r.compareShortestLeast;let x=new Map,b={};/**
 * Expands a string to a full IRI. The string may be a term, a prefix, a
 * relative IRI, or an absolute IRI. The associated absolute IRI will be
 * returned.
 *
 * @param activeCtx the current active context.
 * @param value the string to expand.
 * @param relativeTo options for how to resolve relative IRIs:
 *          base: true to resolve against the base IRI, false not to.
 *          vocab: true to concatenate after @vocab, false not to.
 * @param localCtx the local context being processed (only given if called
 *          during context processing).
 * @param defined a map for tracking cycles in context definitions (only given
 *          if called during context processing).
 * @param {Object} [options] - processing options.
 *
 * @return the expanded value.
 */function w(e,t,n,r,a,i){// already expanded
if(null===t||!s(t)||b.isKeyword(t))return t;// ignore non-keyword things that look like a keyword
if(t.match(g))return null;if(r&&r.hasOwnProperty(t)&&!0!==a.get(t)&&b.createTermDefinition({activeCtx:e,localCtx:r,term:t,defined:a,options:i}),(n=n||{}).vocab){let n=e.mappings.get(t);// value is explicitly ignored with a null mapping
if(null===n)return null;if(l(n)&&"@id"in n)return n["@id"]}// split value into prefix:suffix
let o=t.indexOf(":");if(o>0){let n=t.substr(0,o),l=t.substr(o+1);// do not expand blank nodes (prefix of '_') or already-absolute
// IRIs (suffix of '//')
if("_"===n||0===l.indexOf("//"))return t;r&&r.hasOwnProperty(n)&&b.createTermDefinition({activeCtx:e,localCtx:r,term:n,defined:a,options:i});// use mapping if prefix is defined
let s=e.mappings.get(n);if(s&&s._prefix)return s["@id"]+l;// already absolute IRI
if(u(t))return t}// A flag that captures whether the iri being expanded is
// the value for an @type
//let typeExpansion = false;
//if(options !== undefined && options.typeExpansion !== undefined) {
//  typeExpansion = options.typeExpansion;
//}
if(n.vocab&&"@vocab"in e){// prepend vocab
let n=e["@vocab"]+t;// FIXME: needed? may be better as debug event.
/*
    if(options && options.eventHandler) {
      _handleEvent({
        event: {
          type: ['JsonLdEvent'],
          code: 'prepending @vocab during expansion',
          level: 'info',
          message: 'Prepending @vocab during expansion.',
          details: {
            type: '@vocab',
            vocab: activeCtx['@vocab'],
            value,
            result: prependedResult,
            typeExpansion
          }
        },
        options
      });
    }
    */// the null case preserves value as potentially relative
t=n}else if(n.base){// prepend base
let n,r;"@base"in e?e["@base"]?(r=h(i.base,e["@base"]),n=h(r,t)):(r=e["@base"],n=t):(r=i.base,n=h(i.base,t)),// FIXME: needed? may be better as debug event.
/*
    if(options && options.eventHandler) {
      _handleEvent({
        event: {
          type: ['JsonLdEvent'],
          code: 'prepending @base during expansion',
          level: 'info',
          message: 'Prepending @base during expansion.',
          details: {
            type: '@base',
            base,
            value,
            result: prependedResult,
            typeExpansion
          }
        },
        options
      });
    }
    */// the null case preserves value as potentially relative
t=n}// FIXME: duplicate? needed? maybe just enable in a verbose debug mode
/*
  if(!_isAbsoluteIri(value) && options && options.eventHandler) {
    // emit event indicating a relative IRI was found, which can result in it
    // being dropped when converting to other RDF representations
    _handleEvent({
      event: {
        type: ['JsonLdEvent'],
        code: 'relative IRI after expansion',
        // FIXME: what level?
        level: 'warning',
        message: 'Relative IRI after expansion.',
        details: {
          relativeIri: value,
          typeExpansion
        }
      },
      options
    });
    // NOTE: relative reference events emitted at calling sites as needed
  }
  */return t}e.exports=b,/**
 * Processes a local context and returns a new active context.
 *
 * @param activeCtx the current active context.
 * @param localCtx the local context to process.
 * @param options the context processing options.
 * @param propagate `true` if `false`, retains any previously defined term,
 *   which can be rolled back when the descending into a new node object.
 * @param overrideProtected `false` allows protected terms to be modified.
 *
 * @return a Promise that resolves to the new active context.
 */b.process=async({activeCtx:e,localCtx:t,options:n,propagate:r=!0,overrideProtected:i=!1,cycles:d=new Set})=>{l(t)&&"@context"in t&&o(t["@context"])&&(t=t["@context"]);let c=y(t);// no contexts in array, return current active context w/o changes
if(0===c.length)return e;// event handler for capturing events to replay when using a cached context
let g=[],m=[({event:e,next:t})=>{g.push(e),t()}];n.eventHandler&&m.push(n.eventHandler);// store original options to use when replaying events
let x=n;// shallow clone options with event capture handler
n={...n,eventHandler:m};// resolve contexts
let j=await n.contextResolver.resolve({activeCtx:e,context:t,documentLoader:n.documentLoader,base:n.base});l(j[0].document)&&"boolean"==typeof j[0].document["@propagate"]&&(r=j[0].document["@propagate"]);// process each context in order, update active context
// on each iteration to ensure proper caching
let I=e;for(let o of(r||I.previousContext||(// clone `rval` context before updating
(I=I.clone()).previousContext=e),j)){let{document:r}=o;// reset to initial context
if(// update active context to one computed from last iteration
e=I,null===r){// We can't nullify if there are protected terms and we're
// not allowing overrides (e.g. processing a property term scoped context)
if(!i&&0!==Object.keys(e.protected).length)throw new a("Tried to nullify a context with protected terms outside of a term definition.","jsonld.SyntaxError",{code:"invalid context nullification"});I=e=b.getInitialContext(n).clone();continue}// get processed context from cache if available
let c=o.getProcessed(e);if(c){if(x.eventHandler)for(let e of c.events)f({event:e,options:x});I=e=c.context;continue}// context must be an object by now, all URLs retrieved before this call
if(l(r)&&"@context"in r&&(r=r["@context"]),!l(r))throw new a("Invalid JSON-LD syntax; @context must be an object.","jsonld.SyntaxError",{code:"invalid local context",context:r});// TODO: there is likely a `previousContext` cloning optimization that
// could be applied here (no need to copy it under certain conditions)
// clone context before updating it
I=I.clone();// define context mappings for keys in local context
let y=new Map;// handle @version
if("@version"in r){if(1.1!==r["@version"])throw new a("Unsupported JSON-LD version: "+r["@version"],"jsonld.UnsupportedVersion",{code:"invalid @version value",context:r});if(e.processingMode&&"json-ld-1.0"===e.processingMode)throw new a("@version: "+r["@version"]+" not compatible with "+e.processingMode,"jsonld.ProcessingModeConflict",{code:"processing mode conflict",context:r});I.processingMode="json-ld-1.1",I["@version"]=r["@version"],y.set("@version",!0)}// handle @base
if(// if not set explicitly, set processingMode to "json-ld-1.1"
I.processingMode=I.processingMode||e.processingMode,"@base"in r){let e=r["@base"];if(null===e||u(e));else if(p(e))e=h(I["@base"],e);else throw new a('Invalid JSON-LD syntax; the value of "@base" in a @context must be an absolute IRI, a relative IRI, or null.',"jsonld.SyntaxError",{code:"invalid base IRI",context:r});I["@base"]=e,y.set("@base",!0)}// handle @vocab
if("@vocab"in r){let e=r["@vocab"];if(null===e)delete I["@vocab"];else if(s(e)){if(!u(e)&&b.processingMode(I,1))throw new a('Invalid JSON-LD syntax; the value of "@vocab" in a @context must be an absolute IRI.',"jsonld.SyntaxError",{code:"invalid vocab mapping",context:r});{let t=w(I,e,{vocab:!0,base:!0},void 0,void 0,n);!u(t)&&n.eventHandler&&f({event:{type:["JsonLdEvent"],code:"relative @vocab reference",level:"warning",message:"Relative @vocab reference found.",details:{vocab:t}},options:n}),I["@vocab"]=t}}else throw new a('Invalid JSON-LD syntax; the value of "@vocab" in a @context must be a string or null.',"jsonld.SyntaxError",{code:"invalid vocab mapping",context:r});y.set("@vocab",!0)}// handle @language
if("@language"in r){let e=r["@language"];if(null===e)delete I["@language"];else if(s(e))!e.match(v)&&n.eventHandler&&f({event:{type:["JsonLdEvent"],code:"invalid @language value",level:"warning",message:"@language value must be valid BCP47.",details:{language:e}},options:n}),I["@language"]=e.toLowerCase();else throw new a('Invalid JSON-LD syntax; the value of "@language" in a @context must be a string or null.',"jsonld.SyntaxError",{code:"invalid default language",context:r});y.set("@language",!0)}// handle @direction
if("@direction"in r){let t=r["@direction"];if("json-ld-1.0"===e.processingMode)throw new a("Invalid JSON-LD syntax; @direction not compatible with "+e.processingMode,"jsonld.SyntaxError",{code:"invalid context member",context:r});if(null===t)delete I["@direction"];else if("ltr"!==t&&"rtl"!==t)throw new a('Invalid JSON-LD syntax; the value of "@direction" in a @context must be null, "ltr", or "rtl".',"jsonld.SyntaxError",{code:"invalid base direction",context:r});else I["@direction"]=t;y.set("@direction",!0)}// handle @propagate
// note: we've already extracted it, here we just do error checking
if("@propagate"in r){let n=r["@propagate"];if("json-ld-1.0"===e.processingMode)throw new a("Invalid JSON-LD syntax; @propagate not compatible with "+e.processingMode,"jsonld.SyntaxError",{code:"invalid context entry",context:r});if("boolean"!=typeof n)throw new a("Invalid JSON-LD syntax; @propagate value must be a boolean.","jsonld.SyntaxError",{code:"invalid @propagate value",context:t});y.set("@propagate",!0)}// handle @import
if("@import"in r){let i=r["@import"];if("json-ld-1.0"===e.processingMode)throw new a("Invalid JSON-LD syntax; @import not compatible with "+e.processingMode,"jsonld.SyntaxError",{code:"invalid context entry",context:r});if(!s(i))throw new a("Invalid JSON-LD syntax; @import must be a string.","jsonld.SyntaxError",{code:"invalid @import value",context:t});// resolve contexts
let o=await n.contextResolver.resolve({activeCtx:e,context:i,documentLoader:n.documentLoader,base:n.base});if(1!==o.length)throw new a("Invalid JSON-LD syntax; @import must reference a single context.","jsonld.SyntaxError",{code:"invalid remote context",context:t});let l=o[0].getProcessed(e);if(l)// as a reference context, then processed_input might not
// be a dict.
r=l;else{let n=o[0].document;if("@import"in n)throw new a("Invalid JSON-LD syntax: imported context must not include @import.","jsonld.SyntaxError",{code:"invalid context entry",context:t});// merge ctx into importCtx and replace rval with the result
for(let e in n)r.hasOwnProperty(e)||(r[e]=n[e]);// Note: this could potenially conflict if the import
// were used in the same active context as a referenced
// context and an import. In this case, we
// could override the cached result, but seems unlikely.
o[0].setProcessed(e,r)}y.set("@import",!0)}// process all other keys
for(let e in // handle @protected; determine whether this sub-context is declaring
// all its terms to be "protected" (exceptions can be made on a
// per-definition basis)
y.set("@protected",r["@protected"]||!1),r)if(b.createTermDefinition({activeCtx:I,localCtx:r,term:e,defined:y,options:n,overrideProtected:i}),l(r[e])&&"@context"in r[e]){let t=r[e]["@context"],i=!0;if(s(t)){let e=h(n.base,t);d.has(e)?i=!1:d.add(e)}// parse context to validate
if(i)try{await b.process({activeCtx:I.clone(),localCtx:r[e]["@context"],overrideProtected:!0,options:n,cycles:d})}catch(t){throw new a("Invalid JSON-LD syntax; invalid scoped context.","jsonld.SyntaxError",{code:"invalid scoped context",context:r[e]["@context"],term:e})}}// cache processed result
o.setProcessed(e,{context:I,events:g})}return I},/**
 * Creates a term definition during context processing.
 *
 * @param activeCtx the current active context.
 * @param localCtx the local context being processed.
 * @param term the term in the local context to define the mapping for.
 * @param defined a map of defining/defined keys to detect cycles and prevent
 *          double definitions.
 * @param {Object} [options] - creation options.
 * @param overrideProtected `false` allows protected terms to be modified.
 */b.createTermDefinition=({activeCtx:e,localCtx:t,term:n,defined:r,options:i,overrideProtected:d=!1})=>{let c;if(r.has(n)){// term already defined
if(r.get(n))return;// cycle detected
throw new a("Cyclical context definition detected.","jsonld.CyclicalContext",{code:"cyclic IRI mapping",context:t,term:n})}if(// now defining term
r.set(n,!1),t.hasOwnProperty(n)&&(c=t[n]),"@type"===n&&l(c)&&"@set"===(c["@container"]||"@set")&&b.processingMode(e,1.1)){let e=["@container","@id","@protected"],r=Object.keys(c);if(0===r.length||r.some(t=>!e.includes(t)))throw new a("Invalid JSON-LD syntax; keywords cannot be overridden.","jsonld.SyntaxError",{code:"keyword redefinition",context:t,term:n})}else if(b.isKeyword(n))throw new a("Invalid JSON-LD syntax; keywords cannot be overridden.","jsonld.SyntaxError",{code:"keyword redefinition",context:t,term:n});else if(n.match(g)){i.eventHandler&&f({event:{type:["JsonLdEvent"],code:"reserved term",level:"warning",message:'Terms beginning with "@" are reserved for future use and dropped.',details:{term:n}},options:i});return}else if(""===n)throw new a("Invalid JSON-LD syntax; a term cannot be an empty string.","jsonld.SyntaxError",{code:"invalid term definition",context:t});// keep reference to previous mapping for potential `@protected` check
let p=e.mappings.get(n);e.mappings.has(n)&&e.mappings.delete(n);// convert short-hand value to object w/@id
let h=!1;if((s(c)||null===c)&&(h=!0,c={"@id":c}),!l(c))throw new a("Invalid JSON-LD syntax; @context term values must be strings or objects.","jsonld.SyntaxError",{code:"invalid term definition",context:t});// create new mapping
let v={};e.mappings.set(n,v),v.reverse=!1;// make sure term definition only has expected keywords
let y=["@container","@id","@language","@reverse","@type"];for(let n in b.processingMode(e,1.1)&&y.push("@context","@direction","@index","@nest","@prefix","@protected"),c)if(!y.includes(n))throw new a("Invalid JSON-LD syntax; a term definition must not contain "+n,"jsonld.SyntaxError",{code:"invalid term definition",context:t});// always compute whether term has a colon as an optimization for
// _compactIri
let m=n.indexOf(":");if(v._termHasColon=m>0,"@reverse"in c){if("@id"in c)throw new a("Invalid JSON-LD syntax; a @reverse term definition must not contain @id.","jsonld.SyntaxError",{code:"invalid reverse property",context:t});if("@nest"in c)throw new a("Invalid JSON-LD syntax; a @reverse term definition must not contain @nest.","jsonld.SyntaxError",{code:"invalid reverse property",context:t});let o=c["@reverse"];if(!s(o))throw new a("Invalid JSON-LD syntax; a @context @reverse value must be a string.","jsonld.SyntaxError",{code:"invalid IRI mapping",context:t});if(o.match(g)){i.eventHandler&&f({event:{type:["JsonLdEvent"],code:"reserved @reverse value",level:"warning",message:'@reverse values beginning with "@" are reserved for future use and dropped.',details:{reverse:o}},options:i}),p?e.mappings.set(n,p):e.mappings.delete(n);return}// expand and add @id mapping
let l=w(e,o,{vocab:!0,base:!1},t,r,i);if(!u(l))throw new a("Invalid JSON-LD syntax; a @context @reverse value must be an absolute IRI or a blank node identifier.","jsonld.SyntaxError",{code:"invalid IRI mapping",context:t});v["@id"]=l,v.reverse=!0}else if("@id"in c){let o=c["@id"];if(o&&!s(o))throw new a("Invalid JSON-LD syntax; a @context @id value must be an array of strings or a string.","jsonld.SyntaxError",{code:"invalid IRI mapping",context:t});if(null===o)v["@id"]=null;else if(!b.isKeyword(o)&&o.match(g)){i.eventHandler&&f({event:{type:["JsonLdEvent"],code:"reserved @id value",level:"warning",message:'@id values beginning with "@" are reserved for future use and dropped.',details:{id:o}},options:i}),p?e.mappings.set(n,p):e.mappings.delete(n);return}else if(o!==n){if(!u(// expand and add @id mapping
o=w(e,o,{vocab:!0,base:!1},t,r,i))&&!b.isKeyword(o))throw new a("Invalid JSON-LD syntax; a @context @id value must be an absolute IRI, a blank node identifier, or a keyword.","jsonld.SyntaxError",{code:"invalid IRI mapping",context:t});// if term has the form of an IRI it must map the same
if(n.match(/(?::[^:])|\//)){let l=new Map(r).set(n,!0),s=w(e,n,{vocab:!0,base:!1},t,l,i);if(s!==o)throw new a("Invalid JSON-LD syntax; term in form of IRI must expand to definition.","jsonld.SyntaxError",{code:"invalid IRI mapping",context:t})}v["@id"]=o,// indicate if this term may be used as a compact IRI prefix
v._prefix=h&&!v._termHasColon&&null!==o.match(/[:\/\?#\[\]@]$/)}}if(!("@id"in v)){// see if the term has a prefix
if(v._termHasColon){let a=n.substr(0,m);if(t.hasOwnProperty(a)&&b.createTermDefinition({activeCtx:e,localCtx:t,term:a,defined:r,options:i}),e.mappings.has(a)){// set @id based on prefix parent
let t=n.substr(m+1);v["@id"]=e.mappings.get(a)["@id"]+t}else v["@id"]=n}else if("@type"===n)v["@id"]=n;else{// non-IRIs *must* define @ids if @vocab is not available
if(!("@vocab"in e))throw new a("Invalid JSON-LD syntax; @context terms must define an @id.","jsonld.SyntaxError",{code:"invalid IRI mapping",context:t,term:n});// prepend vocab to term
v["@id"]=e["@vocab"]+n}}if((!0===c["@protected"]||!0===r.get("@protected")&&!1!==c["@protected"])&&(e.protected[n]=!0,v.protected=!0),// IRI mapping now defined
r.set(n,!0),"@type"in c){let n=c["@type"];if(!s(n))throw new a("Invalid JSON-LD syntax; an @context @type value must be a string.","jsonld.SyntaxError",{code:"invalid type mapping",context:t});if("@json"===n||"@none"===n){if(b.processingMode(e,1))throw new a(`Invalid JSON-LD syntax; an @context @type value must not be "${n}" in JSON-LD 1.0 mode.`,"jsonld.SyntaxError",{code:"invalid type mapping",context:t})}else if("@id"!==n&&"@vocab"!==n){if(!u(// expand @type to full IRI
n=w(e,n,{vocab:!0,base:!1},t,r,i)))throw new a("Invalid JSON-LD syntax; an @context @type value must be an absolute IRI.","jsonld.SyntaxError",{code:"invalid type mapping",context:t});if(0===n.indexOf("_:"))throw new a("Invalid JSON-LD syntax; an @context @type value must be an IRI, not a blank node identifier.","jsonld.SyntaxError",{code:"invalid type mapping",context:t})}// add @type to mapping
v["@type"]=n}if("@container"in c){// normalize container to an array form
let n=s(c["@container"])?[c["@container"]]:c["@container"]||[],r=["@list","@set","@index","@language"],i=!0,l=n.includes("@set");// JSON-LD 1.1 support
if(b.processingMode(e,1.1)){// check container length
if(r.push("@graph","@id","@type"),n.includes("@list")){if(1!==n.length)throw new a("Invalid JSON-LD syntax; @context @container with @list must have no other values","jsonld.SyntaxError",{code:"invalid container mapping",context:t})}else if(n.includes("@graph")){if(n.some(e=>"@graph"!==e&&"@id"!==e&&"@index"!==e&&"@set"!==e))throw new a("Invalid JSON-LD syntax; @context @container with @graph must have no other values other than @id, @index, and @set","jsonld.SyntaxError",{code:"invalid container mapping",context:t})}else i&=n.length<=(l?2:1);if(n.includes("@type")&&(// If mapping does not have an @type,
// set it to @id
v["@type"]=v["@type"]||"@id",!["@id","@vocab"].includes(v["@type"])))throw new a("Invalid JSON-LD syntax; container: @type requires @type to be @id or @vocab.","jsonld.SyntaxError",{code:"invalid type mapping",context:t})}else // in JSON-LD 1.0, container must not be an array (it must be a string,
// which is one of the validContainers)
i&=!o(c["@container"]),// check container length
i&=n.length<=1;if(// check against valid containers
i&=n.every(e=>r.includes(e)),!// @set not allowed with @list
(i&=!(l&&n.includes("@list"))))throw new a("Invalid JSON-LD syntax; @context @container value must be one of the following: "+r.join(", "),"jsonld.SyntaxError",{code:"invalid container mapping",context:t});if(v.reverse&&!n.every(e=>["@index","@set"].includes(e)))throw new a("Invalid JSON-LD syntax; @context @container value for a @reverse type definition must be @index or @set.","jsonld.SyntaxError",{code:"invalid reverse property",context:t});// add @container to mapping
v["@container"]=n}// property indexing
if("@index"in c){if(!("@container"in c)||!v["@container"].includes("@index"))throw new a(`Invalid JSON-LD syntax; @index without @index in @container: "${c["@index"]}" on term "${n}".`,"jsonld.SyntaxError",{code:"invalid term definition",context:t});if(!s(c["@index"])||0===c["@index"].indexOf("@"))throw new a(`Invalid JSON-LD syntax; @index must expand to an IRI: "${c["@index"]}" on term "${n}".`,"jsonld.SyntaxError",{code:"invalid term definition",context:t});v["@index"]=c["@index"]}if("@context"in c&&(v["@context"]=c["@context"]),"@language"in c&&!("@type"in c)){let e=c["@language"];if(null!==e&&!s(e))throw new a("Invalid JSON-LD syntax; @context @language value must be a string or null.","jsonld.SyntaxError",{code:"invalid language mapping",context:t});null!==e&&(e=e.toLowerCase()),v["@language"]=e}// term may be used as a prefix
if("@prefix"in c){if(n.match(/:|\//))throw new a("Invalid JSON-LD syntax; @context @prefix used on a compact IRI term","jsonld.SyntaxError",{code:"invalid term definition",context:t});if(b.isKeyword(v["@id"]))throw new a("Invalid JSON-LD syntax; keywords may not be used as prefixes","jsonld.SyntaxError",{code:"invalid term definition",context:t});if("boolean"==typeof c["@prefix"])v._prefix=!0===c["@prefix"];else throw new a("Invalid JSON-LD syntax; @context value for @prefix must be boolean","jsonld.SyntaxError",{code:"invalid @prefix value",context:t})}if("@direction"in c){let e=c["@direction"];if(null!==e&&"ltr"!==e&&"rtl"!==e)throw new a('Invalid JSON-LD syntax; @direction value must be null, "ltr", or "rtl".',"jsonld.SyntaxError",{code:"invalid base direction",context:t});v["@direction"]=e}if("@nest"in c){let e=c["@nest"];if(!s(e)||"@nest"!==e&&0===e.indexOf("@"))throw new a("Invalid JSON-LD syntax; @context @nest value must be a string which is not a keyword other than @nest.","jsonld.SyntaxError",{code:"invalid @nest value",context:t});v["@nest"]=e}// disallow aliasing @context and @preserve
let x=v["@id"];if("@context"===x||"@preserve"===x)throw new a("Invalid JSON-LD syntax; @context and @preserve cannot be aliased.","jsonld.SyntaxError",{code:"invalid keyword alias",context:t});// Check for overriding protected terms
if(p&&p.protected&&!d&&(// force new term to continue to be protected and see if the mappings would
// be equal
e.protected[n]=!0,v.protected=!0,!function e(t,n){// compare `null` or primitive types directly
if(!(t&&"object"==typeof t)||!(n&&"object"==typeof n))return t===n;// x1 and x2 are objects (also potentially arrays)
let r=Array.isArray(t);if(r!==Array.isArray(n))return!1;if(r){if(t.length!==n.length)return!1;for(let r=0;r<t.length;++r)if(!e(t[r],n[r]))return!1;return!0}// x1 and x2 are non-array objects
let a=Object.keys(t),i=Object.keys(n);if(a.length!==i.length)return!1;for(let r in t){let a=t[r],i=n[r];if("@container"===r&&Array.isArray(a)&&Array.isArray(i)&&(a=a.slice().sort(),i=i.slice().sort()),!e(a,i))return!1}return!0}(p,v)))throw new a("Invalid JSON-LD syntax; tried to redefine a protected term.","jsonld.SyntaxError",{code:"protected term redefinition",context:t,term:n})},/**
 * Expands a string to a full IRI. The string may be a term, a prefix, a
 * relative IRI, or an absolute IRI. The associated absolute IRI will be
 * returned.
 *
 * @param activeCtx the current active context.
 * @param value the string to expand.
 * @param relativeTo options for how to resolve relative IRIs:
 *          base: true to resolve against the base IRI, false not to.
 *          vocab: true to concatenate after @vocab, false not to.
 * @param {Object} [options] - processing options.
 *
 * @return the expanded value.
 */b.expandIri=(e,t,n,r)=>w(e,t,n,void 0,void 0,r),/**
 * Gets the initial context.
 *
 * @param options the options to use:
 *          [base] the document base IRI.
 *
 * @return the initial context.
 */b.getInitialContext=e=>{let t=JSON.stringify({processingMode:e.processingMode}),n=x.get(t);if(n)return n;let a={processingMode:e.processingMode,mappings:new Map,inverse:null,getInverse:/**
   * Generates an inverse context for use in the compaction algorithm, if
   * not already generated for the given active context.
   *
   * @return the inverse context.
   */function(){// lazily create inverse
if(this.inverse)return this.inverse;let e=this.inverse={},t=this.fastCurieMap={},n={},r=(this["@language"]||"@none").toLowerCase(),a=this["@direction"],o=this.mappings,l=[...o.keys()].sort(m);for(let s of l){let l=o.get(s);if(null===l)continue;let d=l["@container"]||"@none";if(d=[].concat(d).sort().join(""),null===l["@id"])continue;// iterate over every IRI in the mapping
let c=y(l["@id"]);for(let o of c){let c=e[o],u=b.isKeyword(o);if(c)u||l._termHasColon||n[o].push(s);else if(// initialize entry
e[o]=c={},!u&&!l._termHasColon){// init IRI to term map and fast CURIE prefixes
n[o]=[s];let e={iri:o,terms:n[o]};o[0]in t?t[o[0]].push(e):t[o[0]]=[e]}if(c[d]||(c[d]={"@language":{},"@type":{},"@any":{}}),i(s,(c=c[d])["@any"],"@none"),l.reverse)i(s,c["@type"],"@reverse");else if("@none"===l["@type"])i(s,c["@any"],"@none"),i(s,c["@language"],"@none"),i(s,c["@type"],"@none");else if("@type"in l)i(s,c["@type"],l["@type"]);else if("@language"in l&&"@direction"in l){// term is preferred for values using specific language and direction
let e=l["@language"],t=l["@direction"];e&&t?i(s,c["@language"],`${e}_${t}`.toLowerCase()):e?i(s,c["@language"],e.toLowerCase()):t?i(s,c["@language"],`_${t}`):i(s,c["@language"],"@null")}else"@language"in l?i(s,c["@language"],(l["@language"]||"@null").toLowerCase()):"@direction"in l?l["@direction"]?i(s,c["@language"],`_${l["@direction"]}`):i(s,c["@language"],"@none"):(a?i(s,c["@language"],`_${a}`):// add entries for no type and no language
i(s,c["@language"],r),i(s,c["@language"],"@none"),i(s,c["@type"],"@none"))}}// build fast CURIE map
for(let e in t)/**
   * Runs a recursive algorithm to build a lookup map for quickly finding
   * potential CURIEs.
   *
   * @param iriMap the map to build.
   * @param key the current key in the map to work on.
   * @param idx the index into the IRI to compare.
   */(function e(t,n,r){let a,i;let o=t[n],l=t[n]={};for(let e of o)(i=r>=(a=e.iri).length?"":a[r])in l?l[i].push(e):l[i]=[e];for(let t in l)""!==t&&e(l,t,r+1)})(t,e,1);return e},clone:/**
   * Clones an active context, creating a child active context.
   *
   * @return a clone (child) of the active context.
   */function(){let e={};return e.mappings=r.clone(this.mappings),e.clone=this.clone,e.inverse=null,e.getInverse=this.getInverse,e.protected=r.clone(this.protected),this.previousContext&&(e.previousContext=this.previousContext.clone()),e.revertToPreviousContext=this.revertToPreviousContext,"@base"in this&&(e["@base"]=this["@base"]),"@language"in this&&(e["@language"]=this["@language"]),"@vocab"in this&&(e["@vocab"]=this["@vocab"]),e},revertToPreviousContext:/**
   * Reverts any type-scoped context in this active context to the previous
   * context.
   */function(){return this.previousContext?this.previousContext.clone():this},protected:{}};return 1e4===x.size&&// the cache isn't being used very efficiently anyway
x.clear(),x.set(t,a),a;/**
   * Adds the term for the given entry if not already added.
   *
   * @param term the term to add.
   * @param entry the inverse context typeOrLanguage entry to add to.
   * @param typeOrLanguageValue the key in the entry to add to.
   */function i(e,t,n){t.hasOwnProperty(n)||(t[n]=e)}},/**
 * Gets the value for the given active context key and type, null if none is
 * set or undefined if none is set and type is '@context'.
 *
 * @param ctx the active context.
 * @param key the context key.
 * @param [type] the type of value to get (eg: '@id', '@type'), if not
 *          specified gets the entire entry for a key, null if not found.
 *
 * @return the value, null, or undefined.
 */b.getContextValue=(e,t,n)=>{// invalid key
if(null===t){if("@context"===n)return;return null}// get specific entry information
if(e.mappings.has(t)){let r=e.mappings.get(t);if(d(n))return r;if(r.hasOwnProperty(n))return r[n]}return(// get default language
"@language"===n&&n in e||"@direction"===n&&n in e?e[n]:"@context"!==n?null:void 0)},/**
 * Processing Mode check.
 *
 * @param activeCtx the current active context.
 * @param version the string or numeric version to check.
 *
 * @return boolean.
 */b.processingMode=(e,t)=>t.toString()>="1.1"?!e.processingMode||e.processingMode>="json-ld-"+t.toString():"json-ld-1.0"===e.processingMode,/**
 * Returns whether or not the given value is a keyword.
 *
 * @param v the value to check.
 *
 * @return true if the value is a keyword, false if not.
 */b.isKeyword=e=>{if(!s(e)||"@"!==e[0])return!1;switch(e){case"@base":case"@container":case"@context":case"@default":case"@direction":case"@embed":case"@explicit":case"@graph":case"@id":case"@included":case"@index":case"@json":case"@language":case"@list":case"@nest":case"@none":case"@omitDefault":case"@prefix":case"@preserve":case"@protected":case"@requireAll":case"@reverse":case"@set":case"@type":case"@value":case"@version":case"@vocab":return!0}return!1}}),n.register("8qp2g",function(e,t){var r=n("3Yszg"),a=n("guzPY").isArray,i=n("85rA0").asArray;let o={};e.exports=o,// default handler, store as null or an array
// exposed to allow fast external pre-handleEvent() checks
o.defaultEventHandler=null,/**
 * Setup event handler.
 *
 * Return an array event handler constructed from an optional safe mode
 * handler, an optional options event handler, and an optional default handler.
 *
 * @param {object} options - processing options
 *   {function|object|array} [eventHandler] - an event handler.
 *
 * @return an array event handler.
 */o.setupEventHandler=({options:e={}})=>{// build in priority order
let t=[].concat(e.safe?o.safeEventHandler:[],e.eventHandler?i(e.eventHandler):[],o.defaultEventHandler?o.defaultEventHandler:[]);// null if no handlers
return 0===t.length?null:t},/**
 * Handle an event.
 *
 * Top level APIs have a common 'eventHandler' option. This option can be a
 * function, array of functions, object mapping event.code to functions (with a
 * default to call next()), or any combination of such handlers. Handlers will
 * be called with an object with an 'event' entry and a 'next' function. Custom
 * handlers should process the event as appropriate. The 'next()' function
 * should be called to let the next handler process the event.
 *
 * NOTE: Only call this function if options.eventHandler is set and is an
 * array of hanlers. This is an optimization. Callers are expected to check
 * for an event handler before constructing events and calling this function.
 *
 * @param {object} event - event structure:
 *   {string} code - event code
 *   {string} level - severity level, one of: ['warning']
 *   {string} message - human readable message
 *   {object} details - event specific details
 * @param {object} options - processing options
 *   {array} eventHandler - an event handler array.
 */o.handleEvent=({event:e,options:t})=>{(function e({event:t,handlers:n}){let i=!0;for(let o=0;i&&o<n.length;++o){i=!1;let l=n[o];if(a(l))i=e({event:t,handlers:l});else if("function"==typeof l)l({event:t,next:()=>{i=!0}});else if("object"==typeof l)t.code in l?l[t.code]({event:t,next:()=>{i=!0}}):i=!0;else throw new r("Invalid event handler.","jsonld.InvalidEventHandler",{event:t})}return i})({event:e,handlers:t.eventHandler})};let l=new Set(["empty object","free-floating scalar","invalid @language value","invalid property",// NOTE: spec edge case
"null @id value","null @value value","object with only @id","object with only @language","object with only @list","object with only @value","relative @id reference","relative @type reference","relative @vocab reference","reserved @id value","reserved @reverse value","reserved term",// toRDF
"blank node predicate","relative graph reference","relative object reference","relative predicate reference","relative subject reference"]);// safe handler that rejects unsafe warning conditions
o.safeEventHandler=function({event:e,next:t}){// fail on all unsafe warnings
if("warning"===e.level&&l.has(e.code))throw new r("Safe mode validation error.","jsonld.ValidationError",{event:e});t()},// logs all events and continues
o.logEventHandler=function({event:e,next:t}){console.log(`EVENT: ${e.message}`,{event:e}),t()},// log 'warning' level events
o.logWarningEventHandler=function({event:e,next:t}){"warning"===e.level&&console.warn(`WARNING: ${e.message}`,{event:e}),t()},// fallback to throw errors for any unhandled events
o.unhandledEventHandler=function({event:e}){throw new r("No handler for event.","jsonld.UnhandledEvent",{event:e})},/**
 * Set default event handler.
 *
 * By default, all event are unhandled. It is recommended to pass in an
 * eventHandler into each call. However, this call allows using a default
 * eventHandler when one is not otherwise provided.
 *
 * @param {object} options - default handler options:
 *   {function|object|array} eventHandler - a default event handler.
 *     falsey to unset.
 */o.setDefaultEventHandler=function({eventHandler:e}={}){o.defaultEventHandler=e?i(e):null}}),n.register("98lVF",function(e,t){var r=n("dEapz").isSubjectReference,a=n("8xjSk").createMergedNodeMap;let i={};e.exports=i,/**
 * Performs JSON-LD flattening.
 *
 * @param input the expanded JSON-LD to flatten.
 *
 * @return the flattened output.
 */i.flatten=e=>{let t=a(e),n=[],i=Object.keys(t).sort();for(let e=0;e<i.length;++e){let a=t[i[e]];r(a)||n.push(a)}return n}}),n.register("8xjSk",function(e,t){var r=n("frGHZ").isKeyword,a=n("dEapz"),i=n("guzPY"),o=n("85rA0"),l=n("3Yszg");let s={};e.exports=s,/**
 * Creates a merged JSON-LD node map (node ID => node).
 *
 * @param input the expanded JSON-LD to create a node map of.
 * @param [options] the options to use:
 *          [issuer] a jsonld.IdentifierIssuer to use to label blank nodes.
 *
 * @return the node map.
 */s.createMergedNodeMap=(e,t)=>{t=t||{};// produce a map of all subjects and name each bnode
let n=t.issuer||new o.IdentifierIssuer("_:b"),r={"@default":{}};// add all non-default graphs to default graph
return s.createNodeMap(e,r,"@default",n),s.mergeNodeMaps(r)},/**
 * Recursively flattens the subjects in the given JSON-LD expanded input
 * into a node map.
 *
 * @param input the JSON-LD expanded input.
 * @param graphs a map of graph name to subject map.
 * @param graph the name of the current graph.
 * @param issuer the blank node identifier issuer.
 * @param name the name assigned to the current input if it is a bnode.
 * @param list the list to append to, null for none.
 */s.createNodeMap=(e,t,n,d,c,u)=>{// recurse through array
if(i.isArray(e)){for(let r of e)s.createNodeMap(r,t,n,d,void 0,u);return}// add non-object to list
if(!i.isObject(e)){u&&u.push(e);return}// add values to list
if(a.isValue(e)){if("@type"in e){let t=e["@type"];0===t.indexOf("_:")&&(e["@type"]=t=d.getId(t))}u&&u.push(e);return}if(u&&a.isList(e)){let r=[];s.createNodeMap(e["@list"],t,n,d,c,r),u.push({"@list":r});return}// Note: At this point, input must be a subject.
// spec requires @type to be named first, so assign names early
if("@type"in e){let t=e["@type"];for(let e of t)0===e.indexOf("_:")&&d.getId(e)}i.isUndefined(c)&&(c=a.isBlankNode(e)?d.getId(e["@id"]):e["@id"]),u&&u.push({"@id":c});// create new subject or merge into existing one
let p=t[n],h=p[c]=p[c]||{};h["@id"]=c;let f=Object.keys(e).sort();for(let i of f){// skip @id
if("@id"===i)continue;// handle reverse properties
if("@reverse"===i){let r={"@id":c},i=e["@reverse"];for(let e in i){let l=i[e];for(let i of l){let l=i["@id"];a.isBlankNode(i)&&(l=d.getId(l)),s.createNodeMap(i,t,n,d,l),o.addValue(p[l],e,r,{propertyIsArray:!0,allowDuplicate:!1})}}continue}// recurse into graph
if("@graph"===i){c in t||(t[c]={}),s.createNodeMap(e[i],t,c,d);continue}// recurse into included
if("@included"===i){s.createNodeMap(e[i],t,n,d);continue}// copy non-@type keywords
if("@type"!==i&&r(i)){if("@index"===i&&i in h&&(e[i]!==h[i]||e[i]["@id"]!==h[i]["@id"]))throw new l("Invalid JSON-LD syntax; conflicting @index property detected.","jsonld.SyntaxError",{code:"conflicting indexes",subject:h});h[i]=e[i];continue}// iterate over objects
let u=e[i];// ensure property is added for empty arrays
if(0===i.indexOf("_:")&&(i=d.getId(i)),0===u.length){o.addValue(h,i,[],{propertyIsArray:!0});continue}for(let e of u)// handle embedded subject or subject reference
if("@type"===i&&(e=0===e.indexOf("_:")?d.getId(e):e),a.isSubject(e)||a.isSubjectReference(e)){// skip null @id
if("@id"in e&&!e["@id"])continue;// relabel blank node @id
let r=a.isBlankNode(e)?d.getId(e["@id"]):e["@id"];// add reference and recurse
o.addValue(h,i,{"@id":r},{propertyIsArray:!0,allowDuplicate:!1}),s.createNodeMap(e,t,n,d,r)}else if(a.isValue(e))o.addValue(h,i,e,{propertyIsArray:!0,allowDuplicate:!1});else if(a.isList(e)){// handle @list
let r=[];s.createNodeMap(e["@list"],t,n,d,c,r),e={"@list":r},o.addValue(h,i,e,{propertyIsArray:!0,allowDuplicate:!1})}else // handle @value
s.createNodeMap(e,t,n,d,c),o.addValue(h,i,e,{propertyIsArray:!0,allowDuplicate:!1})}},/**
 * Merge separate named graphs into a single merged graph including
 * all nodes from the default graph and named graphs.
 *
 * @param graphs a map of graph name to subject map.
 *
 * @return the merged graph map.
 */s.mergeNodeMapGraphs=e=>{let t={};for(let n of Object.keys(e).sort())for(let a of Object.keys(e[n]).sort()){let i=e[n][a];a in t||(t[a]={"@id":a});let l=t[a];for(let e of Object.keys(i).sort())if(r(e)&&"@type"!==e)l[e]=o.clone(i[e]);else for(let t of i[e])o.addValue(l,e,o.clone(t),{propertyIsArray:!0,allowDuplicate:!1})}return t},s.mergeNodeMaps=e=>{// add all non-default graphs to default graph
let t=e["@default"],n=Object.keys(e).sort();for(let r of n){if("@default"===r)continue;let n=e[r],i=t[r];i?"@graph"in i||(i["@graph"]=[]):t[r]=i={"@id":r,"@graph":[]};let o=i["@graph"];for(let e of Object.keys(n).sort()){let t=n[e];a.isSubjectReference(t)||o.push(t)}}return t}}),n.register("1Wow0",function(e,t){var r=n("3Yszg"),a=n("dEapz"),i=n("guzPY"),o=n("85rA0"),l=o.REGEX_BCP47,s=o.addValue,d=n("8qp2g").handleEvent,c=n("3Umbt"),u=c.RDF_LIST,p=c.RDF_FIRST,h=c.RDF_REST,f=c.RDF_NIL,v=c.RDF_TYPE,g=c.RDF_JSON_LITERAL,y=c.XSD_BOOLEAN,m=c.XSD_DOUBLE,x=c.XSD_INTEGER,b=c.XSD_STRING;let w={};e.exports=w,/**
 * Converts an RDF dataset to JSON-LD.
 *
 * @param dataset the RDF dataset.
 * @param options the RDF serialization options.
 *
 * @return a Promise that resolves to the JSON-LD output.
 */w.fromRDF=async(e,t)=>{let n={},o={"@default":n},c={},{useRdfType:w=!1,useNativeTypes:j=!1,rdfDirection:I=null}=t;for(let a of e){// TODO: change 'name' to 'graph'
let e="DefaultGraph"===a.graph.termType?"@default":a.graph.value;e in o||(o[e]={}),"@default"===e||e in n||(n[e]={"@id":e});let u=o[e],p=a.subject.value,h=a.predicate.value,N=a.object;p in u||(u[p]={"@id":p});let S=u[p],E=N.termType.endsWith("Node");if(!E||N.value in u||(u[N.value]={"@id":N.value}),h===v&&!w&&E){s(S,"@type",N.value,{propertyIsArray:!0});continue}let O=/**
 * Converts an RDF triple object to a JSON-LD object.
 *
 * @param o the RDF triple object to convert.
 * @param useNativeTypes true to output native types, false not to.
 * @param rdfDirection text direction mode [null, i18n-datatype]
 * @param options top level API options
 *
 * @return the JSON-LD object.
 */function(e,t,n,a){// convert NamedNode/BlankNode object to JSON-LD
if(e.termType.endsWith("Node"))return{"@id":e.value};// convert literal to JSON-LD
let o={"@value":e.value};// add language
if(e.language)!e.language.match(l)&&a.eventHandler&&d({event:{type:["JsonLdEvent"],code:"invalid @language value",level:"warning",message:"@language value must be valid BCP47.",details:{language:e.language}},options:a}),o["@language"]=e.language;else{let s=e.datatype.value;if(s||(s=b),s===g){s="@json";try{o["@value"]=JSON.parse(o["@value"])}catch(e){throw new r("JSON literal could not be parsed.","jsonld.InvalidJsonLiteral",{code:"invalid JSON literal",value:o["@value"],cause:e})}}// use native types for certain xsd types
if(t){if(s===y)"true"===o["@value"]?o["@value"]=!0:"false"===o["@value"]&&(o["@value"]=!1);else if(i.isNumeric(o["@value"])){if(s===x){let e=parseInt(o["@value"],10);e.toFixed(0)===o["@value"]&&(o["@value"]=e)}else s===m&&(o["@value"]=parseFloat(o["@value"]))}[y,x,m,b].includes(s)||(o["@type"]=s)}else if("i18n-datatype"===n&&s.startsWith("https://www.w3.org/ns/i18n#")){let[,e,t]=s.split(/[#_]/);e.length>0&&(o["@language"]=e,!e.match(l)&&a.eventHandler&&d({event:{type:["JsonLdEvent"],code:"invalid @language value",level:"warning",message:"@language value must be valid BCP47.",details:{language:e}},options:a})),o["@direction"]=t}else s!==b&&(o["@type"]=s)}return o}(N,j,I,t);// object may be an RDF list/partial list node but we can't know easily
// until all triples are read
if(s(S,h,O,{propertyIsArray:!0}),E){if(N.value===f){// track rdf:nil uniquely per graph
let e=u[N.value];"usages"in e||(e.usages=[]),e.usages.push({node:S,property:h,value:O})}else N.value in c?c[N.value]=!1:c[N.value]={node:S,property:h,value:O}}}/*
  for(let name in dataset) {
    const graph = dataset[name];
    if(!(name in graphMap)) {
      graphMap[name] = {};
    }
    if(name !== '@default' && !(name in defaultGraph)) {
      defaultGraph[name] = {'@id': name};
    }
    const nodeMap = graphMap[name];
    for(let ti = 0; ti < graph.length; ++ti) {
      const triple = graph[ti];

      // get subject, predicate, object
      const s = triple.subject.value;
      const p = triple.predicate.value;
      const o = triple.object;

      if(!(s in nodeMap)) {
        nodeMap[s] = {'@id': s};
      }
      const node = nodeMap[s];

      const objectIsId = (o.type === 'IRI' || o.type === 'blank node');
      if(objectIsId && !(o.value in nodeMap)) {
        nodeMap[o.value] = {'@id': o.value};
      }

      if(p === RDF_TYPE && !useRdfType && objectIsId) {
        _addValue(node, '@type', o.value, {propertyIsArray: true});
        continue;
      }

      const value = _RDFToObject(o, useNativeTypes);
      _addValue(node, p, value, {propertyIsArray: true});

      // object may be an RDF list/partial list node but we can't know easily
      // until all triples are read
      if(objectIsId) {
        if(o.value === RDF_NIL) {
          // track rdf:nil uniquely per graph
          const object = nodeMap[o.value];
          if(!('usages' in object)) {
            object.usages = [];
          }
          object.usages.push({
            node: node,
            property: p,
            value: value
          });
        } else if(o.value in referencedOnce) {
          // object referenced more than once
          referencedOnce[o.value] = false;
        } else {
          // keep track of single reference
          referencedOnce[o.value] = {
            node: node,
            property: p,
            value: value
          };
        }
      }
    }
  }*/// convert linked lists to @list arrays
for(let e in o){let t=o[e];// no @lists to be converted, continue
if(!(f in t))continue;// iterate backwards through each RDF list
let n=t[f];if(n.usages){for(let e of n.usages){let n=e.node,r=e.property,o=e.value,l=[],s=[],d=Object.keys(n).length;for(;r===h&&i.isObject(c[n["@id"]])&&i.isArray(n[p])&&1===n[p].length&&i.isArray(n[h])&&1===n[h].length&&(3===d||4===d&&i.isArray(n["@type"])&&1===n["@type"].length&&n["@type"][0]===u)&&(l.push(n[p][0]),s.push(n["@id"]),n=// get next node, moving backwards through list
(e=c[n["@id"]]).node,r=e.property,o=e.value,d=Object.keys(n).length,a.isBlankNode(n)););for(let e of(// transform list into @list object
delete o["@id"],o["@list"]=l.reverse(),s))delete t[e]}delete n.usages}}let N=[],S=Object.keys(n).sort();for(let e of S){let t=n[e];if(e in o){let n=t["@graph"]=[],r=o[e],i=Object.keys(r).sort();for(let e of i){let t=r[e];a.isSubjectReference(t)||n.push(t)}}a.isSubjectReference(t)||N.push(t)}return N}}),n.register("klPaf",function(e,t){var r=n("8xjSk").createNodeMap,a=n("frGHZ").isKeyword,i=n("dEapz"),o=n("kRKFi"),l=n("guzPY"),s=n("85rA0"),d=n("8qp2g").handleEvent,c=n("3Umbt"),u=c.RDF_FIRST,p=c.RDF_REST,h=c.RDF_NIL,f=c.RDF_TYPE,v=c.RDF_JSON_LITERAL,g=c.RDF_LANGSTRING,y=c.XSD_BOOLEAN,m=c.XSD_DOUBLE,x=c.XSD_INTEGER,b=c.XSD_STRING,w=n("c0VXR").isAbsolute;let j={};e.exports=j,/**
 * Outputs an RDF dataset for the expanded JSON-LD input.
 *
 * @param input the expanded JSON-LD input.
 * @param options the RDF serialization options.
 *
 * @return the RDF dataset.
 */j.toRDF=(e,t)=>{// create node map for default graph (and any named graphs)
let n=new s.IdentifierIssuer("_:b"),c={"@default":{}};r(e,c,"@default",n);let j=[],I=Object.keys(c).sort();for(let e of I){let r;if("@default"===e)r={termType:"DefaultGraph",value:""};else if(w(e))(r=e.startsWith("_:")?{termType:"BlankNode"}:{termType:"NamedNode"}).value=e;else{t.eventHandler&&d({event:{type:["JsonLdEvent"],code:"relative graph reference",level:"warning",message:"Relative graph reference found.",details:{graph:e}},options:t});continue}/**
 * Adds RDF quads for a particular graph to the given dataset.
 *
 * @param dataset the dataset to append RDF quads to.
 * @param graph the graph to create RDF quads for.
 * @param graphTerm the graph term for each quad.
 * @param issuer a IdentifierIssuer for assigning blank node names.
 * @param options the RDF serialization options.
 *
 * @return the array of RDF triples for the given graph.
 */(function(e,t,n,r,s){let c=Object.keys(t).sort();for(let j of c){let c=t[j],I=Object.keys(c).sort();for(let t of I){let I=c[t];if("@type"===t)t=f;else if(a(t))continue;for(let a of I){// RDF subject
let c={termType:j.startsWith("_:")?"BlankNode":"NamedNode",value:j};// skip relative IRI subjects (not valid RDF)
if(!w(j)){s.eventHandler&&d({event:{type:["JsonLdEvent"],code:"relative subject reference",level:"warning",message:"Relative subject reference found.",details:{subject:j}},options:s});continue}// RDF predicate
let f={termType:t.startsWith("_:")?"BlankNode":"NamedNode",value:t};// skip relative IRI predicates (not valid RDF)
if(!w(t)){s.eventHandler&&d({event:{type:["JsonLdEvent"],code:"relative predicate reference",level:"warning",message:"Relative predicate reference found.",details:{predicate:t}},options:s});continue}// skip blank node predicates unless producing generalized RDF
if("BlankNode"===f.termType&&!s.produceGeneralizedRdf){s.eventHandler&&d({event:{type:["JsonLdEvent"],code:"blank node predicate",level:"warning",message:"Dropping blank node predicate.",details:{// FIXME: add better issuer API to get reverse mapping
property:r.getOldIds().find(e=>r.getId(e)===t)}},options:s});continue}// convert list, value or node object to triple
let I=/**
 * Converts a JSON-LD value object to an RDF literal or a JSON-LD string,
 * node object to an RDF resource, or adds a list.
 *
 * @param item the JSON-LD value or node object.
 * @param issuer a IdentifierIssuer for assigning blank node names.
 * @param dataset the dataset to append RDF quads to.
 * @param graphTerm the graph term for each quad.
 * @param options the RDF serialization options.
 *
 * @return the RDF literal or RDF resource.
 */function e(t,n,r,a,s,c){let f={};// convert value object to RDF
if(i.isValue(t)){f.termType="Literal",f.value=void 0,f.datatype={termType:"NamedNode"};let e=t["@value"],n=t["@type"]||null;// convert to XSD/JSON datatypes as appropriate
if("@json"===n)f.value=o(e),f.datatype.value=v;else if(l.isBoolean(e))f.value=e.toString(),f.datatype.value=n||y;else if(l.isDouble(e)||n===m)l.isDouble(e)||(e=parseFloat(e)),// canonical double representation
f.value=e.toExponential(15).replace(/(\d)0*e\+?/,"$1E"),f.datatype.value=n||m;else if(l.isNumber(e))f.value=e.toFixed(0),f.datatype.value=n||x;else if("i18n-datatype"===s&&"@direction"in t){let n="https://www.w3.org/ns/i18n#"+(t["@language"]||"")+`_${t["@direction"]}`;f.datatype.value=n,f.value=e}else"@language"in t?(f.value=e,f.datatype.value=n||g,f.language=t["@language"]):(f.value=e,f.datatype.value=n||b)}else if(i.isList(t)){let i=/**
 * Converts a @list value into linked list of blank node RDF quads
 * (an RDF collection).
 *
 * @param list the @list value.
 * @param issuer a IdentifierIssuer for assigning blank node names.
 * @param dataset the array of quads to append to.
 * @param graphTerm the graph term for each quad.
 * @param options the RDF serialization options.
 *
 * @return the head of the list.
 */function(t,n,r,a,i,o){let l={termType:"NamedNode",value:u},s={termType:"NamedNode",value:p},d={termType:"NamedNode",value:h},c=t.pop(),f=c?{termType:"BlankNode",value:n.getId()}:d,v=f;for(let d of t){let t=e(d,n,r,a,i,o),c={termType:"BlankNode",value:n.getId()};r.push({subject:v,predicate:l,object:t,graph:a}),r.push({subject:v,predicate:s,object:c,graph:a}),v=c}// Tail of list
if(c){let t=e(c,n,r,a,i,o);r.push({subject:v,predicate:l,object:t,graph:a}),r.push({subject:v,predicate:s,object:d,graph:a})}return f}(t["@list"],n,r,a,s,c);f.termType=i.termType,f.value=i.value}else{// convert string/node object to RDF
let e=l.isObject(t)?t["@id"]:t;f.termType=e.startsWith("_:")?"BlankNode":"NamedNode",f.value=e}return(// skip relative IRIs, not valid RDF
"NamedNode"!==f.termType||w(f.value)?f:(c.eventHandler&&d({event:{type:["JsonLdEvent"],code:"relative object reference",level:"warning",message:"Relative object reference found.",details:{object:f.value}},options:c}),null))}(a,r,e,n,s.rdfDirection,s);I&&e.push({subject:c,predicate:f,object:I,graph:n})}}}})(j,c[e],r,n,t)}return j}}),n.register("kRKFi",function(e,t){e.exports=function e(t){return null===t||"object"!=typeof t||null!=t.toJSON?JSON.stringify(t):Array.isArray(t)?"["+t.reduce((t,n,r)=>{let a=void 0===n||"symbol"==typeof n?null:n;return t+(0===r?"":",")+e(a)},"")+"]":"{"+Object.keys(t).sort().reduce((n,r,a)=>{if(void 0===t[r]||"symbol"==typeof t[r])return n;let i=0===n.length?"":",";return n+i+e(r)+":"+e(t[r])},"")+"}"}}),n.register("fm7xk",function(e,t){var r=n("frGHZ").isKeyword,a=n("dEapz"),i=n("guzPY"),o=n("85rA0"),l=n("c0VXR"),s=n("3Yszg"),d=n("8xjSk"),c=d.createNodeMap,u=d.mergeNodeMapGraphs;let p={};/**
 * Creates an implicit frame when recursing through subject matches. If
 * a frame doesn't have an explicit frame for a particular property, then
 * a wildcard child frame will be created that uses the same flags that the
 * parent frame used.
 *
 * @param flags the current framing flags.
 *
 * @return the implicit frame.
 */function h(e){let t={};for(let n in e)void 0!==e[n]&&(t["@"+n]=[e[n]]);return[t]}/**
 * Gets the frame flag value for the given flag name.
 *
 * @param frame the frame.
 * @param options the framing options.
 * @param name the flag name.
 *
 * @return the flag value.
 */function f(e,t,n){let r="@"+n,a=r in e?e[r][0]:t[n];if("embed"===n){// default is "@last"
// backwards-compatibility support for "embed" maps:
// true => "@last"
// false => "@never"
if(!0===a)a="@once";else if(!1===a)a="@never";else if("@always"!==a&&"@never"!==a&&"@link"!==a&&"@first"!==a&&"@last"!==a&&"@once"!==a)throw new s("Invalid JSON-LD syntax; invalid value of @embed.","jsonld.SyntaxError",{code:"invalid @embed value",frame:e})}return a}/**
 * Validates a JSON-LD frame, throwing an exception if the frame is invalid.
 *
 * @param frame the frame to validate.
 */function v(e){if(!i.isArray(e)||1!==e.length||!i.isObject(e[0]))throw new s("Invalid JSON-LD syntax; a JSON-LD frame must be a single object.","jsonld.SyntaxError",{frame:e});if("@id"in e[0]){for(let t of o.asArray(e[0]["@id"]))// @id must be wildcard or an IRI
if(!(i.isObject(t)||l.isAbsolute(t))||i.isString(t)&&0===t.indexOf("_:"))throw new s("Invalid JSON-LD syntax; invalid @id in frame.","jsonld.SyntaxError",{code:"invalid frame",frame:e})}if("@type"in e[0]){for(let t of o.asArray(e[0]["@type"]))// @type must be wildcard, IRI, or @json
if(!(i.isObject(t)||l.isAbsolute(t)||"@json"===t)||i.isString(t)&&0===t.indexOf("_:"))throw new s("Invalid JSON-LD syntax; invalid @type in frame.","jsonld.SyntaxError",{code:"invalid frame",frame:e})}}/**
 * Returns true if the given subject matches the given frame.
 *
 * Matches either based on explicit type inclusion where the node has any
 * type listed in the frame. If the frame has empty types defined matches
 * nodes not having a @type. If the frame has a type of {} defined matches
 * nodes having any type defined.
 *
 * Otherwise, does duck typing, where the node must have all of the
 * properties defined in the frame.
 *
 * @param state the current framing state.
 * @param subject the subject to check.
 * @param frame the frame to check.
 * @param flags the frame flags.
 *
 * @return true if the subject matches, false if not.
 */function g(e,t,n,l){// check ducktype
let s=!0,d=!1;for(let c in n){let u=!1,p=o.getValues(t,c),h=0===o.getValues(n,c).length;if("@id"===c){if(i.isEmptyObject(n["@id"][0]||{})?u=!0:n["@id"].length>=0&&(u=n["@id"].includes(p[0])),!l.requireAll)return u}else if("@type"===c){if(// check @type (object value means 'any' type,
// fall through to ducktyping)
s=!1,h){if(p.length>0)return!1;u=!0}else if(1===n["@type"].length&&i.isEmptyObject(n["@type"][0]))u=p.length>0;else // match on a specific @type
for(let e of n["@type"])u=!!i.isObject(e)&&"@default"in e||u||p.some(t=>t===e);if(!l.requireAll)return u}else{if(r(c))continue;// Force a copy of this frame entry so it can be manipulated
let t=o.getValues(n,c)[0],d=!1;// skip, but allow match if node has no value for property, and frame has
// a default value
if(t&&(v([t]),d="@default"in t),// no longer a wildcard pattern if frame has any non-keyword properties
s=!1,0===p.length&&d)continue;// if frame value is empty, don't match if subject has any value
if(p.length>0&&h)return!1;if(void 0===t){// node does not match if values is not empty and the value of property
// in frame is match none.
if(p.length>0)return!1;u=!0}else if(a.isList(t)){let n=t["@list"][0];if(a.isList(p[0])){let t=p[0]["@list"];a.isValue(n)?u=t.some(e=>x(n,e)):(a.isSubject(n)||a.isSubjectReference(n))&&(u=t.some(t=>m(e,n,t,l)))}}else u=a.isValue(t)?p.some(e=>x(t,e)):a.isSubjectReference(t)?p.some(n=>m(e,t,n,l)):!!i.isObject(t)&&p.length>0}// all non-defaulted values must match if requireAll is set
if(!u&&l.requireAll)return!1;d=d||u}// return true if wildcard or subject matches some properties
return s||d}/**
 * Adds framing output to the given parent.
 *
 * @param parent the parent to add to.
 * @param property the parent property.
 * @param output the output to add.
 */function y(e,t,n){i.isObject(e)?o.addValue(e,t,n,{propertyIsArray:!0}):e.push(n)}/**
 * Node matches if it is a node, and matches the pattern as a frame.
 *
 * @param state the current framing state.
 * @param pattern used to match value
 * @param value to check
 * @param flags the frame flags.
 */function m(e,t,n,r){if(!("@id"in n))return!1;let a=e.subjects[n["@id"]];return a&&g(e,a,t,r)}/**
 * Value matches if it is a value and matches the value pattern
 *
 * * `pattern` is empty
 * * @values are the same, or `pattern[@value]` is a wildcard, and
 * * @types are the same or `value[@type]` is not null
 *   and `pattern[@type]` is `{}`, or `value[@type]` is null
 *   and `pattern[@type]` is null or `[]`, and
 * * @languages are the same or `value[@language]` is not null
 *   and `pattern[@language]` is `{}`, or `value[@language]` is null
 *   and `pattern[@language]` is null or `[]`.
 *
 * @param pattern used to match value
 * @param value to check
 */function x(e,t){let n=t["@value"],r=t["@type"],a=t["@language"],o=e["@value"]?i.isArray(e["@value"])?e["@value"]:[e["@value"]]:[],l=e["@type"]?i.isArray(e["@type"])?e["@type"]:[e["@type"]]:[],s=e["@language"]?i.isArray(e["@language"])?e["@language"]:[e["@language"]]:[];return 0===o.length&&0===l.length&&0===s.length||!!((o.includes(n)||i.isEmptyObject(o[0]))&&(!r&&0===l.length||l.includes(r)||r&&i.isEmptyObject(l[0]))&&(!a&&0===s.length||s.includes(a)||a&&i.isEmptyObject(s[0])))}e.exports=p,/**
 * Performs JSON-LD `merged` framing.
 *
 * @param input the expanded JSON-LD to frame.
 * @param frame the expanded JSON-LD frame to use.
 * @param options the framing options.
 *
 * @return the framed output.
 */p.frameMergedOrDefault=(e,t,n)=>{// create framing state
let r={options:n,embedded:!1,graph:"@default",graphMap:{"@default":{}},subjectStack:[],link:{},bnodeMap:{}},l=new o.IdentifierIssuer("_:b");c(e,r.graphMap,"@default",l),n.merged&&(r.graphMap["@merged"]=u(r.graphMap),r.graph="@merged"),r.subjects=r.graphMap[r.graph];// frame the subjects
let s=[];return p.frame(r,Object.keys(r.subjects).sort(),t,s),n.pruneBlankNodeIdentifiers&&(n.bnodesToClear=Object.keys(r.bnodeMap).filter(e=>1===r.bnodeMap[e].length)),// remove @preserve from results
n.link={},/**
 * Removes the @preserve keywords from expanded result of framing.
 *
 * @param input the framed, framed output.
 * @param options the framing options used.
 *
 * @return the resulting output.
 */function e(t,n){// recurse through arrays
if(i.isArray(t))return t.map(t=>e(t,n));if(i.isObject(t)){// remove @preserve
if("@preserve"in t)return t["@preserve"][0];// skip @values
if(a.isValue(t))return t;// recurse through @lists
if(a.isList(t))return t["@list"]=e(t["@list"],n),t;// handle in-memory linked nodes
if("@id"in t){let e=t["@id"];if(n.link.hasOwnProperty(e)){let r=n.link[e].indexOf(t);if(-1!==r)return n.link[e][r];// prevent circular visitation
n.link[e].push(t)}else n.link[e]=[t]}// recurse through properties
for(let r in t){// potentially remove the id, if it is an unreference bnode
if("@id"===r&&n.bnodesToClear.includes(t[r])){delete t["@id"];continue}t[r]=e(t[r],n)}}return t}(s,n)},/**
 * Frames subjects according to the given frame.
 *
 * @param state the current framing state.
 * @param subjects the subjects to filter.
 * @param frame the frame.
 * @param parent the parent subject or top-level array.
 * @param property the parent property, initialized to null.
 */p.frame=(e,t,n,l,d=null)=>{// validate the frame
v(n),n=n[0];// get flags for current frame
let c=e.options,u={embed:f(n,c,"embed"),explicit:f(n,c,"explicit"),requireAll:f(n,c,"requireAll")};e.link.hasOwnProperty(e.graph)||(e.link[e.graph]={});let m=e.link[e.graph],b=/**
 * Returns a map of all of the subjects that match a parsed frame.
 *
 * @param state the current framing state.
 * @param subjects the set of subjects to filter.
 * @param frame the parsed frame.
 * @param flags the frame flags.
 *
 * @return all of the matched subjects.
 */function(e,t,n,r){// filter subjects in @id order
let a={};for(let i of t){let t=e.graphMap[e.graph][i];g(e,t,n,r)&&(a[i]=t)}return a}(e,t,n,u),w=Object.keys(b).sort();for(let v of w){let g=b[v];if(null===d?e.uniqueEmbeds={[e.graph]:{}}:e.uniqueEmbeds[e.graph]=e.uniqueEmbeds[e.graph]||{},"@link"===u.embed&&v in m){// TODO: may want to also match an existing linked subject against
// the current frame ... so different frames could produce different
// subjects that are only shared in-memory when the frames are the same
// add existing linked subject
y(l,d,m[v]);continue}// start output for subject
let w={"@id":v};// validate @embed
if(0===v.indexOf("_:")&&o.addValue(e.bnodeMap,v,w,{propertyIsArray:!0}),m[v]=w,("@first"===u.embed||"@last"===u.embed)&&e.is11)throw new s("Invalid JSON-LD syntax; invalid value of @embed.","jsonld.SyntaxError",{code:"invalid @embed value",frame:n});if(!(!e.embedded&&e.uniqueEmbeds[e.graph].hasOwnProperty(v))){// if embed is @never or if a circular reference would be created by an
// embed, the subject cannot be embedded, just add the reference;
// note that a circular reference won't occur when the embed flag is
// `@link` as the above check will short-circuit before reaching this point
if(e.embedded&&("@never"===u.embed||/**
 * Checks the current subject stack to see if embedding the given subject
 * would cause a circular reference.
 *
 * @param subjectToEmbed the subject to embed.
 * @param graph the graph the subject to embed is in.
 * @param subjectStack the current stack of subjects.
 *
 * @return true if a circular reference would be created, false if not.
 */function(e,t,n){for(let r=n.length-1;r>=0;--r){let a=n[r];if(a.graph===t&&a.subject["@id"]===e["@id"])return!0}return!1}(g,e.graph,e.subjectStack))||e.embedded&&("@first"==u.embed||"@once"==u.embed)&&e.uniqueEmbeds[e.graph].hasOwnProperty(v)){y(l,d,w);continue}// subject is also the name of a graph
if("@last"===u.embed&&v in e.uniqueEmbeds[e.graph]&&/**
 * Removes an existing embed.
 *
 * @param state the current framing state.
 * @param id the @id of the embed to remove.
 */function(e,t){// get existing embed
let n=e.uniqueEmbeds[e.graph],r=n[t],a=r.parent,l=r.property,s={"@id":t};// remove existing embed
if(i.isArray(a))// replace subject with reference
{for(let e=0;e<a.length;++e)if(o.compareValues(a[e],s)){a[e]=s;break}}else{// replace subject with reference
let e=i.isArray(a[l]);o.removeValue(a,l,s,{propertyIsArray:e}),o.addValue(a,l,s,{propertyIsArray:e})}// recursively remove dependent dangling embeds
let d=e=>{// get embed keys as a separate array to enable deleting keys in map
let t=Object.keys(n);for(let r of t)r in n&&i.isObject(n[r].parent)&&n[r].parent["@id"]===e&&(delete n[r],d(r))};d(t)}(e,v),e.uniqueEmbeds[e.graph][v]={parent:l,property:d},// push matching subject onto stack to enable circular embed checks
e.subjectStack.push({subject:g,graph:e.graph}),v in e.graphMap){let t=!1,r=null;"@graph"in n?(r=n["@graph"][0],t=!("@merged"===v||"@default"===v),i.isObject(r)||(r={})):(t="@merged"!==e.graph,r={}),t&&p.frame({...e,graph:v,embedded:!1},Object.keys(e.graphMap[v]).sort(),[r],w,"@graph")}// iterate over subject properties
for(let i of("@included"in n&&p.frame({...e,embedded:!1},t,n["@included"],w,"@included"),Object.keys(g).sort())){// copy keywords to output
if(r(i)){if(w[i]=o.clone(g[i]),"@type"===i)// count bnode values of @type
for(let t of g["@type"])0===t.indexOf("_:")&&o.addValue(e.bnodeMap,t,w,{propertyIsArray:!0});continue}// explicit is on and property isn't in the frame, skip processing
if(!u.explicit||i in n)// add objects
for(let t of g[i]){let r=i in n?n[i]:h(u);// recurse into list
if(a.isList(t)){let r=n[i]&&n[i][0]&&n[i][0]["@list"]?n[i][0]["@list"]:h(u),l={"@list":[]};y(w,i,l);// add list objects
let s=t["@list"];for(let t of s)a.isSubjectReference(t)?p.frame({...e,embedded:!0},[t["@id"]],r,l,"@list"):y(l,"@list",o.clone(t))}else a.isSubjectReference(t)?p.frame({...e,embedded:!0},[t["@id"]],r,w,i):x(r[0],t)&&y(w,i,o.clone(t))}}// handle defaults
for(let e of Object.keys(n).sort()){// skip keywords
if("@type"===e){if(!i.isObject(n[e][0])||!("@default"in n[e][0]))continue}else if(r(e))continue;// if omit default is off, then include default values for properties
// that appear in the next frame but are not in the matching subject
let t=n[e][0]||{},a=f(t,c,"omitDefault");if(!a&&!(e in w)){let n="@null";"@default"in t&&(n=o.clone(t["@default"])),i.isArray(n)||(n=[n]),w[e]=[{"@preserve":n}]}}// if embed reverse values by finding nodes having this subject as a value
// of the associated property
for(let t of Object.keys(n["@reverse"]||{}).sort()){let r=n["@reverse"][t];for(let n of Object.keys(e.subjects)){let a=o.getValues(e.subjects[n],t);a.some(e=>e["@id"]===v)&&(// node has property referencing this subject, recurse
w["@reverse"]=w["@reverse"]||{},o.addValue(w["@reverse"],t,[],{propertyIsArray:!0}),p.frame({...e,embedded:!0},[n],r,w["@reverse"][t],d))}}// add output to parent
y(l,d,w),// pop matching subject from circular ref-checking stack
e.subjectStack.pop()}}},/**
 * Replace `@null` with `null`, removing it from arrays.
 *
 * @param input the framed, compacted output.
 * @param options the framing options used.
 *
 * @return the resulting output.
 */p.cleanupNull=(e,t)=>{// recurse through arrays
if(i.isArray(e)){let n=e.map(e=>p.cleanupNull(e,t));return n.filter(e=>e);// removes nulls from array
}if("@null"===e)return null;if(i.isObject(e)){// handle in-memory linked nodes
if("@id"in e){let n=e["@id"];if(t.link.hasOwnProperty(n)){let r=t.link[n].indexOf(e);if(-1!==r)return t.link[n][r];// prevent circular visitation
t.link[n].push(e)}else t.link[n]=[e]}for(let n in e)e[n]=p.cleanupNull(e[n],t)}return e}}),n.register("gNObS",function(e,t){var r=n("3Yszg"),a=n("guzPY"),i=a.isArray,o=a.isObject,l=a.isString,s=a.isUndefined,d=n("dEapz"),c=d.isList,u=d.isValue,p=d.isGraph,h=d.isSimpleGraph,f=d.isSubjectReference,v=n("frGHZ"),g=v.expandIri,y=v.getContextValue,m=v.isKeyword,x=v.process,b=v.processingMode,w=n("c0VXR"),j=w.removeBase,I=w.prependBase,N=n("85rA0"),S=N.REGEX_KEYWORD,E=N.addValue,O=N.asArray,k=N.compareShortestLeast;let D={};/**
 * The value of `@nest` in the term definition must either be `@nest`, or a term
 * which resolves to `@nest`.
 *
 * @param activeCtx the active context.
 * @param nestProperty a term in the active context or `@nest`.
 * @param {Object} [options] - processing options.
 */function C(e,t,n){if("@nest"!==g(e,t,{vocab:!0},n))throw new r("JSON-LD compact error; nested property must have an @nest value resolving to @nest.","jsonld.SyntaxError",{code:"invalid @nest value"})}e.exports=D,/**
 * Recursively compacts an element using the given active context. All values
 * must be in expanded form before this method is called.
 *
 * @param activeCtx the active context to use.
 * @param activeProperty the compacted property associated with the element
 *          to compact, null for none.
 * @param element the element to compact.
 * @param options the compaction options.
 *
 * @return a promise that resolves to the compacted value.
 */D.compact=async({activeCtx:e,activeProperty:t=null,element:n,options:a={}})=>{// recursively compact array
if(i(n)){let r=[];for(let i=0;i<n.length;++i){let o=await D.compact({activeCtx:e,activeProperty:t,element:n[i],options:a});null!==o&&r.push(o)}if(a.compactArrays&&1===r.length){// use single element if no container is specified
let n=y(e,t,"@container")||[];0===n.length&&(r=r[0])}return r}// use any scoped context on activeProperty
let d=y(e,t,"@context");// recursively compact object
if(s(d)||(e=await x({activeCtx:e,localCtx:d,propagate:!0,overrideProtected:!0,options:a})),o(n)){if(a.link&&"@id"in n&&a.link.hasOwnProperty(n["@id"])){// check for a linked element to reuse
let e=a.link[n["@id"]];for(let t=0;t<e.length;++t)if(e[t].expanded===n)return e[t].compacted}// do value compaction on @values and subject references
if(u(n)||f(n)){let r=D.compactValue({activeCtx:e,activeProperty:t,value:n,options:a});return a.link&&f(n)&&(a.link.hasOwnProperty(n["@id"])||(a.link[n["@id"]]=[]),a.link[n["@id"]].push({expanded:n,compacted:r})),r}// if expanded property is @list and we're contained within a list
// container, recursively compact this item to an array
if(c(n)){let r=y(e,t,"@container")||[];if(r.includes("@list"))return D.compact({activeCtx:e,activeProperty:t,element:n["@list"],options:a})}// FIXME: avoid misuse of active property as an expanded property?
let d="@reverse"===t,v={},g=e;u(n)||f(n)||(e=e.revertToPreviousContext());// apply property-scoped context after reverting term-scoped context
let w=y(g,t,"@context");s(w)||(e=await x({activeCtx:e,localCtx:w,propagate:!0,overrideProtected:!0,options:a})),a.link&&"@id"in n&&(a.link.hasOwnProperty(n["@id"])||(a.link[n["@id"]]=[]),a.link[n["@id"]].push({expanded:n,compacted:v}));// apply any context defined on an alias of @type
// if key is @type and any compacted value is a term having a local
// context, overlay that context
let j=n["@type"]||[];j.length>1&&(j=Array.from(j).sort());// find all type-scoped contexts based on current context, prior to
// updating it
let I=e;for(let t of j){let n=D.compactIri({activeCtx:I,iri:t,relativeTo:{vocab:!0}}),r=y(g,n,"@context");s(r)||(e=await x({activeCtx:e,localCtx:r,options:a,propagate:!1}))}// process element keys in order
let N=Object.keys(n).sort();for(let s of N){let f=n[s];// compact @id
if("@id"===s){let t=O(f).map(t=>D.compactIri({activeCtx:e,iri:t,relativeTo:{vocab:!1},base:a.base}));1===t.length&&(t=t[0]);// use keyword alias and add value
let n=D.compactIri({activeCtx:e,iri:"@id",relativeTo:{vocab:!0}});v[n]=t;continue}// compact @type(s)
if("@type"===s){// resolve type values against previous context
let t=O(f).map(e=>D.compactIri({activeCtx:g,iri:e,relativeTo:{vocab:!0}}));1===t.length&&(t=t[0]);// use keyword alias and add value
let n=D.compactIri({activeCtx:e,iri:"@type",relativeTo:{vocab:!0}}),r=y(e,n,"@container")||[],a=r.includes("@set")&&b(e,1.1),o=a||i(t)&&0===f.length;E(v,n,t,{propertyIsArray:o});continue}// handle @reverse
if("@reverse"===s){// recursively compact expanded value
let t=await D.compact({activeCtx:e,activeProperty:"@reverse",element:f,options:a});// handle double-reversed properties
for(let n in t)if(e.mappings.has(n)&&e.mappings.get(n).reverse){let r=t[n],i=y(e,n,"@container")||[],o=i.includes("@set")||!a.compactArrays;E(v,n,r,{propertyIsArray:o}),delete t[n]}if(Object.keys(t).length>0){// use keyword alias and add value
let n=D.compactIri({activeCtx:e,iri:s,relativeTo:{vocab:!0}});E(v,n,t)}continue}if("@preserve"===s){// compact using activeProperty
let n=await D.compact({activeCtx:e,activeProperty:t,element:f,options:a});i(n)&&0===n.length||E(v,s,n);continue}// handle @index property
if("@index"===s){// drop @index if inside an @index container
let n=y(e,t,"@container")||[];if(n.includes("@index"))continue;// use keyword alias and add value
let r=D.compactIri({activeCtx:e,iri:s,relativeTo:{vocab:!0}});E(v,r,f);continue}// skip array processing for keywords that aren't
// @graph, @list, or @included
if("@graph"!==s&&"@list"!==s&&"@included"!==s&&m(s)){// use keyword alias and add value as is
let t=D.compactIri({activeCtx:e,iri:s,relativeTo:{vocab:!0}});E(v,t,f);continue}// Note: expanded value must be an array due to expansion algorithm.
if(!i(f))throw new r("JSON-LD expansion error; expanded value must be an array.","jsonld.SyntaxError");// preserve empty arrays
if(0===f.length){let t=D.compactIri({activeCtx:e,iri:s,value:f,relativeTo:{vocab:!0},reverse:d}),n=e.mappings.has(t)?e.mappings.get(t)["@nest"]:null,r=v;n&&(C(e,n,a),o(v[n])||(v[n]={}),r=v[n]),E(r,t,f,{propertyIsArray:!0})}// recusively process array values
for(let t of f){let n;// compact property and get container type
let r=D.compactIri({activeCtx:e,iri:s,value:t,relativeTo:{vocab:!0},reverse:d}),f=e.mappings.has(r)?e.mappings.get(r)["@nest"]:null,g=v;f&&(C(e,f,a),o(v[f])||(v[f]={}),g=v[f]);let m=y(e,r,"@container")||[],x=p(t),b=c(t);b?n=t["@list"]:x&&(n=t["@graph"]);// recursively compact expanded item
let w=await D.compact({activeCtx:e,activeProperty:r,element:b||x?n:t,options:a});// handle @list
if(b){if(i(w)||(w=[w]),m.includes("@list")){E(g,r,w,{valueIsArray:!0,allowDuplicate:!0});continue}// wrap using @list alias
w={[D.compactIri({activeCtx:e,iri:"@list",relativeTo:{vocab:!0}})]:w},"@index"in t&&(w[D.compactIri({activeCtx:e,iri:"@index",relativeTo:{vocab:!0}})]=t["@index"])}// Graph object compaction cases
if(x){if(m.includes("@graph")&&(m.includes("@id")||m.includes("@index")&&h(t))){let n;g.hasOwnProperty(r)?n=g[r]:g[r]=n={};// index on @id or @index or alias of @none
let i=(m.includes("@id")?t["@id"]:t["@index"])||D.compactIri({activeCtx:e,iri:"@none",relativeTo:{vocab:!0}});// add compactedItem to map, using value of `@id` or a new blank
// node identifier
E(n,i,w,{propertyIsArray:!a.compactArrays||m.includes("@set")})}else m.includes("@graph")&&h(t)?i(w)&&w.length>1&&(w={"@included":w}):(i(w)&&1===w.length&&a.compactArrays&&(w=w[0]),w={[D.compactIri({activeCtx:e,iri:"@graph",relativeTo:{vocab:!0}})]:w},"@id"in t&&(w[D.compactIri({activeCtx:e,iri:"@id",relativeTo:{vocab:!0}})]=t["@id"]),"@index"in t&&(w[D.compactIri({activeCtx:e,iri:"@index",relativeTo:{vocab:!0}})]=t["@index"])),E(g,r,w,{propertyIsArray:!a.compactArrays||m.includes("@set")})}else if(m.includes("@language")||m.includes("@index")||m.includes("@id")||m.includes("@type")){let n,i;if(g.hasOwnProperty(r)?n=g[r]:g[r]=n={},m.includes("@language"))u(w)&&(w=w["@value"]),i=t["@language"];else if(m.includes("@index")){let n=y(e,r,"@index")||"@index",a=D.compactIri({activeCtx:e,iri:n,relativeTo:{vocab:!0}});if("@index"===n)i=t["@index"],delete w[a];else{let e;if([i,...e]=O(w[n]||[]),l(i))switch(e.length){case 0:delete w[n];break;case 1:w[n]=e[0];break;default:w[n]=e}else i=null}}else if(m.includes("@id")){let t=D.compactIri({activeCtx:e,iri:"@id",relativeTo:{vocab:!0}});i=w[t],delete w[t]}else if(m.includes("@type")){let n;let o=D.compactIri({activeCtx:e,iri:"@type",relativeTo:{vocab:!0}});switch([i,...n]=O(w[o]||[]),n.length){case 0:delete w[o];break;case 1:w[o]=n[0];break;default:w[o]=n}1===Object.keys(w).length&&"@id"in t&&(w=await D.compact({activeCtx:e,activeProperty:r,element:{"@id":t["@id"]},options:a}))}i||(i=D.compactIri({activeCtx:e,iri:"@none",relativeTo:{vocab:!0}})),// add compact value to map object using key from expanded value
// based on the container type
E(n,i,w,{propertyIsArray:m.includes("@set")})}else{// use an array if: compactArrays flag is false,
// @container is @set or @list , value is an empty
// array, or key is @graph
let e=!a.compactArrays||m.includes("@set")||m.includes("@list")||i(w)&&0===w.length||"@list"===s||"@graph"===s;// add compact value
E(g,r,w,{propertyIsArray:e})}}}return v}// only primitives remain which are already compact
return n},/**
 * Compacts an IRI or keyword into a term or prefix if it can be. If the
 * IRI has an associated value it may be passed.
 *
 * @param activeCtx the active context to use.
 * @param iri the IRI to compact.
 * @param value the value to check or null.
 * @param relativeTo options for how to compact IRIs:
 *          vocab: true to split after @vocab, false not to.
 * @param reverse true if a reverse property is being compacted, false if not.
 * @param base the absolute URL to use for compacting document-relative IRIs.
 *
 * @return the compacted term, prefix, keyword alias, or the original IRI.
 */D.compactIri=({activeCtx:e,iri:t,value:n=null,relativeTo:a={vocab:!1},reverse:i=!1,base:l=null})=>{// can't compact null
if(null===t)return t;e.isPropertyTermScoped&&e.previousContext&&(e=e.previousContext);let s=e.getInverse();// if term is a keyword, it may be compacted to a simple alias
if(m(t)&&t in s&&"@none"in s[t]&&"@type"in s[t]["@none"]&&"@none"in s[t]["@none"]["@type"])return s[t]["@none"]["@type"]["@none"];// use inverse context to pick a term if iri is relative to vocab
if(a.vocab&&t in s){let r=e["@language"]||"@none",a=[];o(n)&&"@index"in n&&!("@graph"in n)&&a.push("@index","@index@set"),o(n)&&"@preserve"in n&&(n=n["@preserve"][0]),p(n)?("@index"in n&&a.push("@graph@index","@graph@index@set","@index","@index@set"),"@id"in n&&a.push("@graph@id","@graph@id@set"),a.push("@graph","@graph@set","@set"),"@index"in n||a.push("@graph@index","@graph@index@set","@index","@index@set"),"@id"in n||a.push("@graph@id","@graph@id@set")):o(n)&&!u(n)&&a.push("@id","@id@set","@type","@set@type");// defaults for term selection based on type/language
let l="@language",s="@null";if(i)l="@type",s="@reverse",a.push("@set");else if(c(n)){"@index"in n||a.push("@list");let e=n["@list"];if(0===e.length)// any empty list can be matched against any term that uses the
// @list container regardless of @type or @language
l="@any",s="@none";else{let t=0===e.length?r:null,n=null;for(let r=0;r<e.length;++r){let a=e[r],i="@none",o="@none";if(u(a)){if("@direction"in a){let e=(a["@language"]||"").toLowerCase(),t=a["@direction"];i=`${e}_${t}`}else"@language"in a?i=a["@language"].toLowerCase():"@type"in a?o=a["@type"]:i="@null"}else o="@id";// there are different languages and types in the list, so choose
// the most generic term, no need to keep iterating the list
if(null===t?t=i:i!==t&&u(a)&&(t="@none"),null===n?n=o:o!==n&&(n="@none"),"@none"===t&&"@none"===n)break}t=t||"@none","@none"!==(n=n||"@none")?(l="@type",s=n):s=t}}else{if(u(n)){if("@language"in n&&!("@index"in n)){a.push("@language","@language@set"),s=n["@language"];let e=n["@direction"];e&&(s=`${s}_${e}`)}else"@direction"in n&&!("@index"in n)?s=`_${n["@direction"]}`:"@type"in n&&(l="@type",s=n["@type"])}else l="@type",s="@id";a.push("@set")}// do term selection
a.push("@none"),!o(n)||"@index"in n||a.push("@index","@index@set"),u(n)&&1===Object.keys(n).length&&a.push("@language","@language@set");let d=/**
 * Picks the preferred compaction term from the given inverse context entry.
 *
 * @param activeCtx the active context.
 * @param iri the IRI to pick the term for.
 * @param value the value to pick the term for.
 * @param containers the preferred containers.
 * @param typeOrLanguage either '@type' or '@language'.
 * @param typeOrLanguageValue the preferred value for '@type' or '@language'.
 *
 * @return the preferred term.
 */function(e,t,n,r,a,i){null===i&&(i="@null");// preferences for the value of @type or @language
let l=[];// determine prefs for @id based on whether or not value compacts to a term
if(("@id"===i||"@reverse"===i)&&o(n)&&"@id"in n){"@reverse"===i&&l.push("@reverse");// try to compact value to a term
let t=D.compactIri({activeCtx:e,iri:n["@id"],relativeTo:{vocab:!0}});e.mappings.has(t)&&e.mappings.get(t)&&e.mappings.get(t)["@id"]===n["@id"]?l.push.apply(l,["@vocab","@id"]):l.push.apply(l,["@id","@vocab"])}else{l.push(i);// consider direction only
let e=l.find(e=>e.includes("_"));e&&l.push(e.replace(/^[^_]+_/,"_"))}l.push("@none");let s=e.inverse[t];for(let e of r){// if container not available in the map, continue
if(!(e in s))continue;let t=s[e][a];for(let e of l)// if type/language option not available in the map, continue
if(e in t)// select term
return t[e]}return null}(e,t,n,a,l,s);if(null!==d)return d}// no term match, use @vocab if available
if(a.vocab&&"@vocab"in e){// determine if vocab is a prefix of the iri
let n=e["@vocab"];if(0===t.indexOf(n)&&t!==n){// use suffix as relative iri if it is not a term in the active context
let r=t.substr(n.length);if(!e.mappings.has(r))return r}}// no term or @vocab match, check for possible CURIEs
let d=null,h=[],f=e.fastCurieMap,v=t.length-1;for(let e=0;e<v&&(t[e]in f);++e)""in(f=f[t[e]])&&h.push(f[""][0]);// check partial matches in reverse order to prefer longest ones first
for(let r=h.length-1;r>=0;--r){let a=h[r],i=a.terms;for(let r of i){// a CURIE is usable if:
// 1. it has no mapping, OR
// 2. value is null, which means we're not compacting an @value, AND
//   the mapping matches the IRI
let i=r+":"+t.substr(a.iri.length),o=e.mappings.get(r)._prefix&&(!e.mappings.has(i)||null===n&&e.mappings.get(i)["@id"]===t);o&&(null===d||0>k(i,d))&&(d=i)}}// return chosen curie
if(null!==d)return d;// If iri could be confused with a compact IRI using a term in this context,
// signal an error
for(let[n,a]of e.mappings)if(a&&a._prefix&&t.startsWith(n+":"))throw new r(`Absolute IRI "${t}" confused with prefix "${n}".`,"jsonld.SyntaxError",{code:"IRI confused with prefix",context:e});// compact IRI relative to base
if(!a.vocab){if(!("@base"in e))return j(l,t);if(e["@base"]){let n=j(I(l,e["@base"]),t);return S.test(n)?`./${n}`:n}}// return IRI as is
return t},/**
 * Performs value compaction on an object with '@value' or '@id' as the only
 * property.
 *
 * @param activeCtx the active context.
 * @param activeProperty the active property that points to the value.
 * @param value the value to compact.
 * @param {Object} [options] - processing options.
 *
 * @return the compaction result.
 */D.compactValue=({activeCtx:e,activeProperty:t,value:n,options:r})=>{// value is a @value
if(u(n)){// get context rules
let r=y(e,t,"@type"),a=y(e,t,"@language"),i=y(e,t,"@direction"),o=y(e,t,"@container")||[],s="@index"in n&&!o.includes("@index");// if there's no @index to preserve ...
if(!s&&"@none"!==r&&(n["@type"]===r||"@language"in n&&n["@language"]===a&&"@direction"in n&&n["@direction"]===i||"@language"in n&&n["@language"]===a||"@direction"in n&&n["@direction"]===i))return n["@value"];// return just the value of @value if all are true:
// 1. @value is the only key or @index isn't being preserved
// 2. there is no default language or @value is not a string or
//   the key has a mapping with a null @language
let d=Object.keys(n).length,c=1===d||2===d&&"@index"in n&&!s,u="@language"in e,p=l(n["@value"]),h=e.mappings.has(t)&&null===e.mappings.get(t)["@language"];if(c&&"@none"!==r&&(!u||!p||h))return n["@value"];let f={};return s&&(f[D.compactIri({activeCtx:e,iri:"@index",relativeTo:{vocab:!0}})]=n["@index"]),"@type"in n?f[D.compactIri({activeCtx:e,iri:"@type",relativeTo:{vocab:!0}})]=D.compactIri({activeCtx:e,iri:n["@type"],relativeTo:{vocab:!0}}):"@language"in n&&(f[D.compactIri({activeCtx:e,iri:"@language",relativeTo:{vocab:!0}})]=n["@language"]),"@direction"in n&&(f[D.compactIri({activeCtx:e,iri:"@direction",relativeTo:{vocab:!0}})]=n["@direction"]),// alias @value
f[D.compactIri({activeCtx:e,iri:"@value",relativeTo:{vocab:!0}})]=n["@value"],f}// value is a subject reference
let a=g(e,t,{vocab:!0},r),i=y(e,t,"@type"),o=D.compactIri({activeCtx:e,iri:n["@id"],relativeTo:{vocab:"@vocab"===i},base:r.base});return(// compact to scalar
"@id"===i||"@vocab"===i||"@graph"===a?o:{[D.compactIri({activeCtx:e,iri:"@id",relativeTo:{vocab:!0}})]:o})}}),n.register("eds65",function(e,t){e.exports=e=>{class t{toString(){return"[object JsonLdProcessor]"}}return Object.defineProperty(t,"prototype",{writable:!1,enumerable:!1}),Object.defineProperty(t.prototype,"constructor",{writable:!0,enumerable:!1,configurable:!0,value:t}),// The Web IDL test harness will check the number of parameters defined in
// the functions below. The number of parameters must exactly match the
// required (non-optional) parameters of the JsonLdProcessor interface as
// defined here:
// https://www.w3.org/TR/json-ld-api/#the-jsonldprocessor-interface
t.compact=function(t,n){return arguments.length<2?Promise.reject(TypeError("Could not compact, too few arguments.")):e.compact(t,n)},t.expand=function(t){return arguments.length<1?Promise.reject(TypeError("Could not expand, too few arguments.")):e.expand(t)},t.flatten=function(t){return arguments.length<1?Promise.reject(TypeError("Could not flatten, too few arguments.")):e.flatten(t)},t}});//# sourceMappingURL=jsonld.3bec2ec0.js.map

//# sourceMappingURL=jsonld.3bec2ec0.js.map
