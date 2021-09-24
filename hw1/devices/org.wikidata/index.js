// -*- mode: js; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// Copyright 2019-2021 The Board of Trustees of the Leland Stanford Junior University
//
// Redistribution and use in source and binary forms, with or
// without modification, are permitted provided that the following
// conditions are met:
//
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above
//    copyright notice, this list of conditions and the following
//    disclaimer in the documentation and/or other materials
//    provided with the distribution.
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived
//    from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Author: Silei Xu <silei@cs.stanford.edu>
"use strict";

const Tp = require('thingpedia');
const ThingTalk = require('thingtalk');

function groupResultById(results) {
    const grouped = {};
    for (const result of results) {
        if (!(result.id.value in grouped))
            grouped[result.id.value] = { id: result.id };
        for (const [property, value] of Object.entries(result)) {
            if (property === 'id')
                continue;
            if (!(property in grouped[result.id.value]))
                grouped[result.id.value][property] = []; // all entities are array 
            grouped[result.id.value][property].push(value)
        }
    }
    return Object.values(grouped);
}

module.exports = class WikidataDevice extends Tp.BaseDevice {
    constructor(engine, state) {
        super(engine, state);
        this.name = "Wikidata";
        this.description = "Question answering on wikdiata";
        this.url = 'https://query.wikidata.org/sparql';
    }

    async query(query) {
        const sparql = ThingTalk.Helper.toSparql(query);
        if (!sparql)
            throw new Error(`Failed to convert query "${query.prettyprint()}", got ${sparql}`); 
        
        console.log('====')
        console.log('SPARQL query:')
        console.log(sparql);
        console.log('====')
        return Tp.Helpers.Http.get(`${this.url}?query=${encodeURIComponent(sparql)}`, {
            accept: 'application/json'
        }).then((result) => {
            const parsed = JSON.parse(result).results.bindings;
            console.log('Raw result from Wikidata:')
            console.log(parsed);
            const preprocessed = parsed.map((r) => {
                const res = {};
                Object.keys(r).filter((key) => !key.endsWith('Label')).forEach((key) => {
                    let value = r[key].value;
                    if (value.startsWith('http://www.wikidata.org/entity/')) {
                        let id = value.slice('http://www.wikidata.org/entity/'.length);
                        value = r[key + 'Label'] ? r[key + 'Label'].value : null;
                        res[key] = { value: id, display: value };
                    } else {
                        res[key] = value;
                    }
                });
                return res;
            });
            return groupResultById(preprocessed);
        });
    }
};