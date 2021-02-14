// ==UserScript==
// @name         Weasyl Crossposter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  waxpost but it works
// @author       mileskitaro
// @match        https://www.furaffinity.net/view/*
// @match        https://inkbunny.net/s*
// @match        https://www.weasyl.com/submit/visual*
// @match        https://www.sofurry.com/view*
// @match        https://www.deviantart.com/art*
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @icon         https://www.weasyl.com/img/favicon-YIHdjAYHmG.png
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

if (window.location.href.includes("weasyl.com/submit/visual")) {
    let rating = new URLSearchParams(window.location.search).get("rating");
    if (rating.toLowerCase().includes("general")) {
        document.querySelector('#submissionrating').value = 10;
    } else if (rating.toLowerCase().includes("mature")) {
        document.querySelector('#submissionrating').value = 30;
    } else if (rating.toLowerCase().includes("adult")) {
        document.querySelector('#submissionrating').value = 40;
    }

    let category = new URLSearchParams(window.location.search).get("category");
    if (category.toLowerCase().includes("sketch")) {
        document.querySelector('#submissioncat').value = 1010;
    } else if (category.toLowerCase().includes("traditional")) {
        document.querySelector('#submissioncat').value = 1020;
    } else if (category.toLowerCase().includes("digital")) {
        document.querySelector('#submissioncat').value = 1030;
    } else if (category.toLowerCase().includes("crafts")) {
        document.querySelector('#submissioncat').value = 1075;
    } else {
        document.querySelector('#submissioncat').value = 1030;
    }
}

GM_registerMenuCommand("Post to Weasyl", function() {
    'use strict';
    var tabScripts = {};
    var tabScriptRegexps = [
        [/^https?:\/\/(?:[^.]+\.)?deviantart\.com\/art\//, deviantart],
        [/^https?:\/\/www\.sofurry\.com\/view\//, sofurry],
        [/^https?:\/\/(?:[^.]+\.)?furaffinity\.net\/view\//, furaffinity],
        [/^https?:\/\/inkbunny\.net\/s/, inkbunny],
        [/^https?:\/\/i\.imgur\.com\//, imgur],
    ];

    var foundNoMatch = tabScriptRegexps.every(function (entry) {
        if (entry[0].test(window.location)) {
            tabScripts = entry[1];
            return false;
        }
        return true;
    });

    if (!foundNoMatch) {
        tabScripts();
    }

    function deviantart() {window.alert("not implemented yet, sorry!")}
    function sofurry() {window.alert("not implemented yet, sorry!")}
    function imgur() {window.alert("not implemented yet, sorry!")}

    function inkbunny() {

        var title = document.querySelector("table.pooltable h1").innerText;
        var tags = $('div div:nth-child(1) a span', $('#kw_scroll').next());
        tags = $.map(tags.get(),
                     function (x) { return x.innerText.replace(/ /g, '_'); });
        var description = $('div.elephant_bottom.elephant_white div.content div span').get(0).innerText;
        var image = $('img#magicbox').eq(0);
        var imageLink = image.parent('a');
        var imageURL = imageLink.length ? imageLink.attr('href') : image.attr('src');
        var rating = document.querySelector('[style="width: 120px; color: #333333; font-size: 10pt;"]').textContent; //absolutely dont want to do it like this but they use about 1 class in their whole septic ass site
        if (rating.toLowerCase().includes("general")) {
            rating = "general";
        } else if (rating.toLowerCase().includes("mature")) {
            rating = "mature";
        } else if (rating.toLowerCase().includes("adult")) {
            rating = "adult";
        }
        var category = "digital";

        var url = 'https://www.weasyl.com/submit/visual?' + $.param({
            title: title,
            tags: tags,
            description: description,
            baseURL: document.location,
            imageURL: imageURL,
        }, true);
        GM_openInTab(url);
    }

    function furaffinity() {
        var title, tags, description, imageURL, rating, category;

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
            rating = document.querySelector('.rating-box').textContent.replace(/ /g, '');
            category = document.querySelector('.category-name').textContent
            if (category.toLowerCase().includes("traditional")) {
                category = "traditional";
            } else if (category.toLowerCase().includes("crafting")) {
                category = "crafts";
            } else {
                category = "digital";
            }


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
            rating: rating,
            category: category
        }, true);
        GM_openInTab(url);

    }



}, "w");
