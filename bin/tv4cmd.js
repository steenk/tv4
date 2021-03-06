#!/usr/bin/env node

var tv4 = require('../tv4'),
	fs = require('fs'),
	path = require('path'),
	nopt = require('nopt'),
	known = {
		schema: path,
		json: path,
		out: path
	},
	short = {
		h: '--help',
		s: '--schema',
		j: '--json',
		v: '--verbose'
	};

var opt = nopt(known, short);

//console.log(opt);

function getFile (file, callback) {
	fs.exists(file, function (exists) {
		if (exists) {
			fs.readFile(file, function (err, res) {
				if (!err) {
					callback(null, JSON.parse(res));
				} else {
					callback('error');
				}
			});
		} else {
			callback('error');
		}
	});
}

function validate (schema, json, out) {
	getFile(schema, function (err, res) {
		if (err) {
			console.error(new Error("Couldn't get file " + schema));
			return;
		}
		var sch = res;
		var sch_ok = tv4.validate(sch, schema_v4);
		if (! sch_ok) {
			console.error(new Error("Schema is not valid."));
			return;
		} else {
			if (opt.verbose) {
				console.log("Schema is valid");
			}
		}
		if (! json) return;
		getFile(json, function (err, res) {
			if (err) {
				console.error(new Error("Couldn't get file " + json));
				return;
			}
			var data = res;
			var valid = tv4.validate(data, sch);
			if (! valid) {
				console.error(new Error("JSON is not valid."));
				if (opt.verbose) {
					console.error(tv4.error.message + ' in path "' + tv4.error.dataPath + '".');
				}
			} else if (opt.verbose) {
				console.log("JSON is valid.");
			}
		});
	});	
}

if (opt.schema) {
	validate(opt.schema, opt.json, opt.out);
} else {
	console.log();
	console.log("Usage: tv4 <options>");
	console.log("Where options are:");
	console.log("  -s, --schema <file>  Required");
	console.log("  -j, --json <file>");
	console.log("  -v, --verbose");
	console.log();
}

var schema_v4 = {
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
        },
        "simpleTypes": {
            "enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "format": "uri"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": { "$ref": "#/definitions/positiveInteger" },
        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/positiveInteger" },
        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "dependencies": {
        "exclusiveMaximum": [ "maximum" ],
        "exclusiveMinimum": [ "minimum" ]
    },
    "default": {}
}
