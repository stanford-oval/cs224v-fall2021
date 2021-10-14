// -*- mode: js; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// Copyright 2021 The Board of Trustees of the Leland Stanford Junior University
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

function timeAdd(startTime, duration) {
    const minutes = (startTime.minute + duration) % 60;
    const hours = (startTime.hour + parseInt((startTime.minute + duration) / 60)) % 24;
    return [hours, minutes];
}

function snakeCase(str) {
    return str.toLowerCase().replace(/ /g, '_');
}

module.exports = class WikidataDevice extends Tp.BaseDevice {
    constructor(engine, state) {
        super(engine, state);
        this.name = "TVmaze";
        this.description = "TV information via TVMaze API";
        this.url = 'https://api.tvmaze.com';
    }
    
    async get_shows({ query }) {
        const parsed = JSON.parse(await Tp.Helpers.Http.get(`${this.url}/search/shows?q=${query}`));
        return Promise.all(parsed.slice(0, 3).map(async (item) => {
            const show = item.show;
            const casts = JSON.parse(await Tp.Helpers.Http.get(`${this.url}/shows/${show.id}/cast`));
            const crews = JSON.parse(await Tp.Helpers.Http.get(`${this.url}/shows/${show.id}/crew`));
            const directors = crews.filter((crew) => crew.type.includes('Director'));
            const producers = crews.filter((crew) => crew.type.includes('Producer'));
            const writers = crews.filter((crew) => crew.type.includes('Writer'));

            const duration = show.runtime || show.averageRuntime;
            let schedule = null;
            console.log(show.schedule);
            if (show.schedule.time) {
                const beginTime = new Tp.Value.Time(...show.schedule.time.split(':').map((str) => parseInt(str)));
                const endTime = new Tp.Value.Time(...timeAdd(beginTime, duration));
                schedule = show.schedule.days.map((day) => {
                    return {
                        beginTime, 
                        endTime, 
                        interval: 7 * 24 * 60 * 60 * 1000, // a week
                        frequency: 1,
                        dayOfWeek: day.toLowerCase(),
                        beginDate: null,
                        endDate: null,
                        substract: false
                    };
                });
            }

            const r = {
                id: new Tp.Value.Entity(show.id.toString(), show.name),
                description: show.summary,
                image: show.url,
                genres: show.genres ? show.genres.map((genre) => new Tp.Value.Entity(snakeCase(genre), genre)) : [],
                runtime: duration * 60 * 1000,
                premieredAt: show.premiered ? new Date(show.premiered) : null,
                rating: show.rating ? show.rating.average : null,
                channel: show.network ? new Tp.Value.Entity(show.network.id.toString(), show.network.name) : null,
                schedule,
                casts: casts.map((cast) => new Tp.Value.Entity(cast.person.id.toString(), cast.person.name)),
                directors: directors.map((director) => new Tp.Value.Entity(director.person.id.toString(), director.person.name)),
                producers: producers.map((producer) => new Tp.Value.Entity(producer.person.id.toString(), producer.person.name)),
                writers: writers.map((writer) => new Tp.Value.Entity(writer.person.id.toString(), writer.person.name)),
            }
            return r;
        }));
    }

    async get_people({ query }) {
        const parsed = JSON.parse(await Tp.Helpers.Http.get(`${this.url}/search/people?q=${query}`));
        return Promise.all(parsed.slice(0, 3).map(async (item) => {
            const person = item.person;
            const shows = JSON.parse(await Tp.Helpers.Http.get(`${this.url}/people/${person.id}/castcredits?embed=show`));
            return {
                id: new Tp.Value.Entity(person.id.toString(), person.name),
                link: person.url,
                country: person.country ? new Tp.Value.Entity(person.country.code.toLowerCase(), person.country.name) : null,
                birthday: person.birthday ? new Date(person.birthday) : null,
                gender: person.gender,
                image: person.image ? person.image.medium : null,
                shows: shows.map((item) => new Tp.Value.Entity(item._embedded.show.id.toString(), item._embedded.show.name))
            };
        }));
    }
};