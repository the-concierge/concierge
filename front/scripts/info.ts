import socket = require('./socket');
import ko = require('knockout');
import $ = require('jquery');

export var containers: KnockoutObservableArray<Concierge.Container> = ko.observableArray([]);

export var hosts: KnockoutObservableArray<Concierge.Host> = ko.observableArray([]);

export var variants: KnockoutObservableArray<Concierge.Variant> = ko.observableArray([]);

export var registry: KnockoutObservableArray<string> = ko.observableArray([]);

socket.on('container', container => {
    
});

socket.on('host', host => {
    
});

socket.on('variant', variant => {
    
});

socket.on('registry', registry => {
    
});

$.get('/containers', containers);
$.get('/hosts', hosts);
$.get('/variants', variants);