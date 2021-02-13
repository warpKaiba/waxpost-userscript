// ==UserScript==
// @name         Weasyl Crossposter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  waxpost but it works
// @author       mileskitaro
// @match        https://www.furaffinity.net/view/*
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @icon         https://www.weasyl.com/img/favicon-YIHdjAYHmG.png
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

GM_registerMenuCommand("Post to Weasyl", function() {
    'use strict';

    var title, tags, description, imageURL, rating;

    if (document.getElementById('submission_page') == null) {
        //using classic theme
        title = $('table.maintable table.maintable td.cat b');
        title = title.get(title.length-1).innerText;
        tags = $.map($('#keywords a').get(),
                     function (x) { return x.innerText.replace(/ /g, '_'); });
        description = $('table.maintable td.alt1[width="70%"]').text();

    } else {
        //using beta theme
        title = document.querySelector('div.submission-title p').textContent;
        //description = document.querySelector('#submission_page div.bg1 div.bg3 div.p20').innerText;
        description = document.querySelector('.submission-description').innerText;
        tags = Array.prototype.map.call(document.querySelectorAll('.tags-row .tags'),
                                        function(tag) {
            return tag.getElementsByTagName('a')[0].innerText;
        });
    }
    imageURL = document.querySelector('.download a').href

        var url = 'https://www.weasyl.com/submit/visual?' + $.param({
            title: title,
            tags: tags,
            description: description,
            baseURL: document.location,
            imageURL: imageURL,
        }, true);
    GM_openInTab(url);
}, "w");
